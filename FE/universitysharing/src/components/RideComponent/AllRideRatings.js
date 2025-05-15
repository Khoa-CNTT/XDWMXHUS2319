import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCompletedRidesWithRating } from "../../stores/action/ridePostAction";
import { toast } from "react-toastify";
import moment from "moment";
import "../../styles/RideViews/AllRideRatings.scss";
import { useNavigate } from "react-router-dom";
import getUserIdFromToken from "../../utils/JwtDecode";
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaUser } from "react-icons/fa";

const AllRideRatings = ({ className, driverId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { completedRidesWithRating, loading, error } = useSelector(
    (state) => state.rides
  );
  const [starFilter, setStarFilter] = useState("all");

  useEffect(() => {
    if (driverId) {
      dispatch(fetchCompletedRidesWithRating(driverId));
    }
  }, [dispatch, driverId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const filteredRides =
    starFilter === "all"
      ? completedRidesWithRating // Show all rides, including rating: null
      : completedRidesWithRating.filter(
          (ride) => ride.rating && ride.rating.level === parseInt(starFilter)
        ); // Exclude rating: null for 1-5 star filters

  const renderStars = (level) => {
    const maxStars = 5;
    return Array.from({ length: maxStars }, (_, index) => (
      <FaStar
        key={index}
        className={index < level ? "star-icon filled" : "star-icon"}
      />
    ));
  };

  const navigateUser = (userId) => {
    if (userId === getUserIdFromToken()) {
      navigate("/ProfileUserView");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (completedRidesWithRating.length === 0) {
    return (
      <div className="no-rides">Không có chuyến đi nào được đánh giá.</div>
    );
  }

  return (
    <div className={`all-ride-ratings ${className}`}>
      {/* Star Filter */}
      <div className="star-filter">
        <button
          className={starFilter === "all" ? "active" : ""}
          onClick={() => setStarFilter("all")}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            className={starFilter === star.toString() ? "active" : ""}
            onClick={() => setStarFilter(star.toString())}
          >
            {star} <FaStar className="filter-star" />
          </button>
        ))}
      </div>

      {/* Ride List */}
      {filteredRides.length === 0 ? (
        <div className="no-rides">Không có chuyến đi với {starFilter} sao.</div>
      ) : (
        filteredRides.map((ride) => (
          <div key={ride.rideId} className="ride-card">
            {/* Ride Post Details */}
            <div className="ride-post">
              <h3>{ride.content || "Chuyến đi không có tiêu đề"}</h3>
              <p>
                <FaMapMarkerAlt className="icon" />
                <strong>Điểm đi:</strong> {ride.startLocation}
              </p>
              <p>
                <FaMapMarkerAlt className="icon" />
                <strong>Điểm đến:</strong> {ride.endLocation}
              </p>
              <p>
                <FaCalendarAlt className="icon" />
                <strong>Thời gian bắt đầu:</strong>{" "}
                {moment(ride.startTime).format("DD/MM/YYYY HH:mm")}
              </p>
              <p>
                <FaCalendarAlt className="icon" />
                <strong>Ngày tạo:</strong>{" "}
                {moment(ride.createdAt).format("DD/MM/YYYY HH:mm")}
              </p>
            </div>

            {/* Driver Info */}
            {ride.driver && (
              <div
                className="driver-info"
                onClick={() => navigateUser(ride.driver.driverId)}
              >
                <img
                  src={ride.driver.avatarUrl || "/images/default-avatar.png"}
                  alt={ride.driver.fullname}
                  className="avatar"
                />
                <p>
                  <FaUser className="icon" />
                  Tài xế: {ride.driver.fullname}
                </p>
              </div>
            )}

            {/* Rating Info */}
            <div className="rating-info">
              {ride.rating ? (
                <>
                  <h4>
                    <span className="star-container">
                      {renderStars(ride.rating.level)}
                    </span>
                    Đánh giá: {ride.rating.level}/5
                  </h4>
                  <p>
                    <strong>Bình luận:</strong>{" "}
                    {ride.rating.comment || "Không có bình luận"}
                  </p>
                  <p>
                    <FaCalendarAlt className="icon" />
                    <strong>Ngày đánh giá:</strong>{" "}
                    {moment(ride.rating.createdAt).format("DD/MM/YYYY HH:mm")}
                  </p>
                  {ride.rating.ratedByUser && (
                    <div
                      className="rated-by-user"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateUser(ride.rating.ratedByUser.ratedByUserId);
                      }}
                    >
                      <img
                        src={
                          ride.rating.ratedByUser.avatarUrl ||
                          "/images/default-avatar.png"
                        }
                        alt={ride.rating.ratedByUser.fullname}
                        className="reviewer-avatar"
                      />
                      <p>
                        <FaUser className="icon" />
                        Đánh giá bởi: {ride.rating.ratedByUser.fullname}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-rating-container">
                  <p className="no-rating">Chưa có đánh giá</p>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AllRideRatings;
