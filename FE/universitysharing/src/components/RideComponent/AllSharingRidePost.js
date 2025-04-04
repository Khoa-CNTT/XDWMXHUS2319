import React, { useState, useEffect } from "react";
import "../../styles/AllSharingCar.scss";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import avatarDefault from "../../assets/AvatarDefault.png";
import moreIcon from "../../assets/iconweb/moreIcon.svg";
import closerIcon from "../../assets/iconweb/closeIcon.svg";
import checkIcon from "../../assets/iconweb/checkIcon.svg";
import likeFillIcon from "../../assets/iconweb/likefillIcon.svg";
import seeMapIcon from "../../assets/iconweb/seeMapIcon.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchRidePost, createRide } from "../../stores/action/ridePostAction";
import { resetPostState } from "../../stores/reducers/ridePostReducer";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const AllSharingRide = () => {
  const [showMap, setShowMap] = useState({});
  const [routePaths, setRoutePaths] = useState({});
  const [shortestPaths, setShortestPaths] = useState({});
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [selectedRidePost, setSelectedRidePost] = useState(null); // Lưu ridePost được chọn

  const dispatch = useDispatch();
  const { ridePosts, loading, error, success, currentRide } = useSelector(
    (state) => state.rides
  );

  useEffect(() => {
    dispatch(fetchRidePost());
  }, [dispatch]);

  useEffect(() => {
    Object.keys(showMap).forEach((postId) => {
      if (showMap[postId] && !routePaths[postId]) {
        const ridePost = ridePosts.find((post) => post.id === postId);
        if (ridePost) {
          const startLatLon = parseLatLon(ridePost.latLonStart);
          const endLatLon = parseLatLon(ridePost.latLonEnd);
          if (startLatLon && endLatLon) {
            fetchRoute(postId, startLatLon, endLatLon);
            fetchShortestRoute(postId, startLatLon, endLatLon);
          }
        }
      }
    });
  }, [showMap, ridePosts, routePaths]);

  // Xử lý khi tạo ride thành công
  useEffect(() => {
    if (success && currentRide) {
      toast.success("Đã tạo ride thành công!");
      dispatch(resetPostState()); // Reset state sau khi thành công
      setShowSafetyModal(false);
    }
    if (error) {
      toast.error(`Lỗi: ${error}`);
    }
  }, [success, currentRide, error, dispatch]);


  const fetchRoute = async (ridePostId, startLatLon, endLatLon) => {
    const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY;
    const url = `https://graphhopper.com/api/1/route?point=${startLatLon[0]},${startLatLon[1]}&point=${endLatLon[0]},${endLatLon[1]}&vehicle=car&locale=vi&key=${apiKey}&points_encoded=false`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.paths && data.paths.length > 0) {
        const coordinates = data.paths[0].points.coordinates;
        const formattedRoute = coordinates.map((coord) => [coord[1], coord[0]]);
        setRoutePaths((prev) => ({ ...prev, [ridePostId]: formattedRoute }));
        toast.warning("Bạn đã request bản đồ (tuyến mặc định)");
      }
    } catch (error) {
      console.error("Error fetching route from GraphHopper:", error);
    }
  };

  const fetchShortestRoute = async (ridePostId, startLatLon, endLatLon) => {
    const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY;
    const url = `https://graphhopper.com/api/1/route?point=${startLatLon[0]},${startLatLon[1]}&point=${endLatLon[0]},${endLatLon[1]}&vehicle=car&locale=vi&key=${apiKey}&points_encoded=false&optimize=true`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.paths && data.paths.length > 0) {
        const coordinates = data.paths[0].points.coordinates;
        const formattedRoute = coordinates.map((coord) => [coord[1], coord[0]]);
        setShortestPaths((prev) => ({ ...prev, [ridePostId]: formattedRoute }));
        toast.info("Đã tải tuyến đường ngắn nhất (màu đỏ)");
      }
    } catch (error) {
      console.error("Error fetching shortest route from GraphHopper:", error);
    }
  };

  const parseLatLon = (latLonString) => {
    if (latLonString === "0") return null;
    const [lat, lon] = latLonString.split(",").map(Number);
    return [lat, lon];
  };

  const handleSeeMapClick = (ridePost) => {
    const newShowMap = !showMap[ridePost.id];
    setShowMap((prev) => ({ ...prev, [ridePost.id]: newShowMap }));
  };

  // Sửa handleAcceptClick để lưu ridePost được chọn
  const handleAcceptClick = (ridePost) => {
    setSelectedRidePost(ridePost); // Lưu ridePost để dùng trong modal
    setShowSafetyModal(true);
  };

  // Hàm xử lý tiếp tục với chế độ an toàn
  const handleSafeMode = () => {
    if (selectedRidePost) {
      const rideData = {
        driverId: selectedRidePost.userId, // Lấy từ ridePost
        RidePostId: selectedRidePost.id,   // Lấy từ ridePost
        EstimatedDuration: 8,              // Giá trị mặc định
        isSafe: true,                      // Chế độ an toàn
        Fare: null,                        // Để null
      };
      dispatch(createRide(rideData));
    }
  };

  // Hàm xử lý tiếp tục với chế độ không an toàn
  const handleUnsafeMode = () => {
    if (selectedRidePost) {
      const rideData = {
        driverId: selectedRidePost.userId,
        RidePostId: selectedRidePost.id,
        EstimatedDuration: 8,
        isSafe: false,                     // Chế độ không an toàn
        Fare: null,
      };
      dispatch(createRide(rideData));
    }
  };

  // Hàm hủy (không chấp nhận đi)
  const handleCancel = () => {
    setShowSafetyModal(false);
    setSelectedRidePost(null);
    toast.info("Bạn đã hủy chấp nhận chuyến đi.");
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <>
      {Array.isArray(ridePosts) && ridePosts.length > 0 ? (
        ridePosts.map((ridePost) => {
          if(!ridePost) return null;
           // Thêm kiểm tra tồn tại các thuộc tính cần thiết
        const startLatLon = ridePost.latLonStart ? parseLatLon(ridePost.latLonStart) : null;
        const endLatLon = ridePost.latLonEnd ? parseLatLon(ridePost.latLonEnd) : null;


          return (
            <div className="All-ride-post" key={ridePost.id}>
              <div className="header-ride-post">
                <div className="left-header-post">
                  <img className="Avata-user" src={avatarDefault} alt="Avatar" />
                  <strong className="Name-User">University Sharing</strong>
                  <span className="time-ridePost">
                    {new Date(ridePost.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="right-header-post">
                  <img className="moreOption" src={moreIcon} alt="More options" />
                  <img className="HidePost" src={closerIcon} alt="Close" />
                </div>
              </div>
              <span className="content-ride-post">
                Đi từ {ridePost.startLocation} đến {ridePost.endLocation} vào{" "}
                {new Date(ridePost.startTime).toLocaleString()}
              </span>

              {showMap[ridePost.id] && startLatLon && endLatLon && (
                <div
                  className="map-ride-post"
                  style={{ height: "300px", width: "100%" }}
                >
                  <MapContainer
                    center={startLatLon}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={startLatLon} icon={defaultIcon}>
                      <Popup>Điểm đi</Popup>
                    </Marker>
                    <Marker position={endLatLon} icon={defaultIcon}>
                      <Popup>Điểm đến</Popup>
                    </Marker>
                    {routePaths[ridePost.id] && (
                      <Polyline positions={routePaths[ridePost.id]} color="blue" />
                    )}
                    {shortestPaths[ridePost.id] && (
                      <Polyline positions={shortestPaths[ridePost.id]} color="red" />
                    )}
                  </MapContainer>
                </div>
              )}

              <div className="action-ride-post">
                <div className="like-number-ride-post">
                  <img className="like-ride-Post" src={likeFillIcon} alt="Like" />
                  <span className="number-like-ride-post">12</span>
                </div>
                {/* Truyền ridePost vào handleAcceptClick */}
                <div
                  className="accept-ride-post"
                  onClick={() => handleAcceptClick(ridePost)}
                >
                  <img className="check-ride-post" src={checkIcon} alt="Check" />
                  <span className="accept-ride">Chấp nhận</span>
                </div>
                <div
                  className="see-ride-map"
                  onClick={() => handleSeeMapClick(ridePost)}
                >
                  <img src={seeMapIcon} className="see-map" alt="See map" />
                  <span className="see">
                    {showMap[ridePost.id] ? "Ẩn map" : "Xem map"}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p>Không có bài viết nào.</p>
      )}

      {/* Sửa modal với 3 nút */}
      {showSafetyModal && (
        <>
          <div className="safety-modal-overlay" onClick={handleCancel}></div>
          <div className="safety-modal">
            <p>Bạn muốn tiếp tục với chế độ nào?</p>
            <div className="safety-modal-buttons">
              <button onClick={handleSafeMode}>Tiếp tục với chế độ an toàn</button>
              <button onClick={handleUnsafeMode}>Tiếp tục với chế độ không an toàn</button>
              <button onClick={handleCancel}>Hủy</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default AllSharingRide;
      {/* <div className="All-ride-post">
        <div className="header-ride-post">
          <div className="left-header-post">
            <img className="Avata-user" src={avatarDefault} alt="Avatar" />
            <strong className="Name-User">University Sharing </strong>
            <span className="time-ridePost">12 hour ago</span>
          </div>
          <div className="right-header-post">
            <img className="moreOption" src={moreIcon} alt="More options" />
            <img className="HidePost" src={closerIcon} alt="Close" />
          </div>
        </div>
        <span className="content-ride-post"> Cho mình quá giang nhé!</span>

        {showMap && (
          <div
            className="map-ride-post"
            style={{ height: "300px", width: "100%" }}
          >
            <MapContainer
              center={startPosition}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={startPosition} icon={defaultIcon}>
                <Popup>Điểm đi</Popup>
              </Marker>
              <Marker position={endPosition} icon={defaultIcon}>
                <Popup>Điểm đến</Popup>
              </Marker>
              {routePath.length > 0 && (
                <Polyline positions={routePath} color="blue" />
              )}
            </MapContainer>
          </div>
        )}

        <div className="action-ride-post">
          <div className="like-number-ride-post">
            <img className="like-ride-Post" src={likeFillIcon} alt="Like" />
            <span className="number-like-ride-post">12</span>
          </div>
          <div className="accept-ride-post">
            <img className="check-ride-post" src={checkIcon} alt="Check" />
            <span className="accept-ride">Chấp nhận</span>
          </div>
          <div className="see-ride-map" onClick={() => setShowMap(!showMap)}>
            <img src={seeMapIcon} className="see-map" alt="See map" />
            <span className="see">{showMap ? "Ẩn map" : "Xem map"}</span>
          </div>
        </div>
      </div> */}
