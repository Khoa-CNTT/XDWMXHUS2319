import React, { useState, useEffect } from "react";
import "../../styles/AllSharingCar.scss";
import { MapContainer, TileLayer, Marker, Popup, Polyline ,useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import avatarDefault from "../../assets/AvatarDefault.png";
import checkIcon from "../../assets/iconweb/checkIcon.svg";
import likeFillIcon from "../../assets/iconweb/likefillIcon.svg";
import { PiDotsThreeLight } from "react-icons/pi";
import { FaMapLocationDot } from "react-icons/fa6";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchRidePost, createRide, deletePost, updatePost } from "../../stores/action/ridePostAction";
import { resetPostState } from "../../stores/reducers/ridePostReducer";
import { jwtDecode } from "jwt-decode";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
// Giới hạn phạm vi Đà Nẵng
const daNangBounds = L.latLngBounds(
  L.latLng(15.975, 108.05), // Tây Nam Đà Nẵng
  L.latLng(16.15, 108.35)   // Đông Bắc Đà Nẵng
);
const formatTimeAgo = (utcTime) => {
  const serverTime = new Date(utcTime);
  const vietnamTime = serverTime.getTime() + 7 * 60 * 60 * 1000; // UTC+7
  const now = new Date().getTime();
  const diffMs = vietnamTime - now;
  const absDiff = Math.abs(diffMs);

  const diffSec = Math.floor(absDiff / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffMs > 0) {
    if (diffSec < 60) return `${diffSec} giây nữa`;
    if (diffMin < 60) return `${diffMin} phút nữa`;
    if (diffHour < 24) return `${diffHour} giờ nữa`;
    if (diffDay === 1) return "Ngày mai";
    if (diffDay < 7) return `${diffDay} ngày nữa`;
    return new Date(vietnamTime).toLocaleDateString("vi-VN");
  }

  if (diffSec < 60) return `${diffSec} giây trước`;
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay === 1) return "Hôm qua";
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  if (diffYear === 1) return "1 năm trước";
  if (diffYear > 1) return `${diffYear} năm trước`;

  return new Date(vietnamTime).toLocaleDateString("vi-VN");
};
// Custom hook để kiểm soát bản đồ
const convertUTCToVNTime = (utcDate) => {
  const date = new Date(utcDate);
  date.setHours(date.getHours() + 7);
  return date;
};
const useMapControl = (center, bounds) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
    if (bounds) {
      map.setMaxBounds(bounds);
      map.setMinZoom(12);
      map.setMaxZoom(18);
    }
  }, [center, map, bounds]);
};
const AllSharingRide = () => {
  const [showMap, setShowMap] = useState({});
  const [routePaths, setRoutePaths] = useState({});
  const [shortestPaths, setShortestPaths] = useState({});
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [selectedRidePost, setSelectedRidePost] = useState(null);
  const [showOptions, setShowOptions] = useState(null);
  const [editPost, setEditPost] = useState(null);
  const [startLocation, setStartLocation] = useState([16.054407, 108.202167]); // Trung tâm Đà Nẵng
  const [endLocation, setEndLocation] = useState(null);
  const dispatch = useDispatch();
  const { ridePosts, loading, error, success, currentRide } = useSelector((state) => state.rides);
  const token = localStorage.getItem("token");
  let username = "Người dùng";
  let currentUserId = "null";
  if (token) {
    try {
      const decoded = jwtDecode(token);
      username = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || "Người dùng";
      currentUserId = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || "null";
    } catch (err) {
      console.error("Lỗi khi decode token:", err);
    }
  }

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

  // Xử lý thông báo thành công, không phụ thuộc vào đóng modal
  useEffect(() => {
    if (success && currentRide) {
      toast.success("Đã tạo ride thành công!");
      dispatch(fetchRidePost()); // Cập nhật lại danh sách bài đăng
      dispatch(resetPostState()); // Reset state sau khi thành công
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
    if (!latLonString || latLonString === "0") return null;
    const [lat, lon] = latLonString.split(",").map(Number);
    return [lat, lon];
  };

  const handleSeeMapClick = (ridePost) => {
    const newShowMap = !showMap[ridePost.id];
    setShowMap((prev) => ({ ...prev, [ridePost.id]: newShowMap }));
  };

  const handleAcceptClick = (ridePost) => {
    setSelectedRidePost(ridePost);
    setShowSafetyModal(true);
  };

  const handleSafeMode = () => {
    if (selectedRidePost) {
      const rideData = {
        driverId: selectedRidePost.userId,
        RidePostId: selectedRidePost.id,
        EstimatedDuration: 8,
        isSafe: true,
        Fare: null,
      };
      dispatch(createRide(rideData))
        .unwrap()
        .then(() => {
          setShowSafetyModal(false); // Đóng modal ngay sau khi thành công
          setSelectedRidePost(null);
          dispatch(fetchRidePost()); // Cập nhật danh sách bài đăng
        })
        .catch((err) => {
          toast.error(`Lỗi khi tạo ride: ${err}`);
        });
    }
  };

  const handleUnsafeMode = () => {
    if (selectedRidePost) {
      const rideData = {
        driverId: selectedRidePost.userId,
        RidePostId: selectedRidePost.id,
        EstimatedDuration: 8,
        isSafe: false,
        Fare: null,
      };
      dispatch(createRide(rideData))
        .unwrap()
        .then(() => {
          setShowSafetyModal(false); // Đóng modal ngay sau khi thành công
          setSelectedRidePost(null);
          dispatch(fetchRidePost()); // Cập nhật danh sách bài đăng
        })
        .catch((err) => {
          toast.error(`Lỗi khi tạo ride: ${err}`);
        });
    }
  };

  const handleCancel = () => {
    setShowSafetyModal(false);
    setSelectedRidePost(null);
    toast.info("Bạn đã hủy chấp nhận chuyến đi.");
  };

  const handleDeletePost = (postId) => {
    dispatch(deletePost(postId));
    setShowOptions(null);
  };

  const handleEditPost = (ridePost) => {
    setEditPost(ridePost);
    setShowOptions(null);
  };

  const handleUpdatePost = () => {
    if (editPost) {
      dispatch(updatePost({
        postId: editPost.id,
        startLocation: editPost.startLocation,
        endLocation: editPost.endLocation,
        startTime: editPost.startTime,
        postType: editPost.postType,
      }));
      setEditPost(null);
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  return (
    <>
      {Array.isArray(ridePosts) && ridePosts.length > 0 ? (
        ridePosts.map((ridePost) => {
          if (!ridePost) return null;
          const startLatLon = ridePost.latLonStart ? parseLatLon(ridePost.latLonStart) : null;
          const endLatLon = ridePost.latLonEnd ? parseLatLon(ridePost.latLonEnd) : null;
          const isOwner = ridePost.userId === currentUserId;
  
          return (
            <div className="All-ride-post" key={ridePost.id}>
              <div className="header-ride-post">
                <div className="left-header-post">
                  <img className="Avata-user" src={avatarDefault} alt="Avatar" />
                  <strong className="Name-User">{username}</strong>
                  <span className="time-ridePost">{formatTimeAgo(ridePost.createdAt)}</span>
                </div>
                <div className="right-header-post">
                  {isOwner && (
                    <div className="post-options">
                      <PiDotsThreeLight
                        className="moreOption"
                        onClick={() => setShowOptions(ridePost.id === showOptions ? null : ridePost.id)}
                      />
                      {showOptions === ridePost.id && (
                        <div className="options-menu">
                          <button onClick={() => handleEditPost(ridePost)}>Sửa bài</button>
                          <button onClick={() => handleDeletePost(ridePost.id)}>Xóa bài</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {editPost && editPost.id === ridePost.id ? (
                <div className="edit-post-form">
                  <textarea
                    value={editPost.content || ""}
                    onChange={(e) => setEditPost({ ...editPost, content: e.target.value })}
                    placeholder="Nội dung bài viết"
                    rows="4"
                    maxLength="200"
                  />
                  <input
                    value={editPost.startLocation}
                    onChange={(e) => setEditPost({ ...editPost, startLocation: e.target.value })}
                  />
                  <input
                    value={editPost.endLocation}
                    onChange={(e) => setEditPost({ ...editPost, endLocation: e.target.value })}
                  />
                  <input
                    type="datetime-local"
                    value={editPost.startTime.slice(0, 16)}
                    onChange={(e) => setEditPost({ ...editPost, startTime: e.target.value })}
                  />
                  <button onClick={handleUpdatePost}>Lưu</button>
                  <button onClick={() => setEditPost(null)}>Hủy</button>
                </div>
              ) : (
                <div className="content-ride-post">
                  {ridePost.content && <p className="post-content">{ridePost.content}</p>}
                  <span className="location-time">
                    Đi từ {ridePost.startLocation} đến {ridePost.endLocation} vào{" "}
                    {new Date(ridePost.startTime).toLocaleString("vi-VN")}
                  </span>
                </div>
              )}
  
              {showMap[ridePost.id] && startLatLon && endLatLon && (
                <div className="map-ride-post" style={{ height: "300px", width: "100%" }}>
                  <MapContainer center={startLatLon} zoom={13}
                    maxBounds={daNangBounds}
                    maxBoundsViscosity={1.0}
                  style={{ height: "100%", width: "100%" }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapControl center={startLocation || endLocation} bounds={daNangBounds} />
                    <Marker position={startLatLon} icon={defaultIcon}>
                      <Popup>Điểm đi</Popup>
                    </Marker>
                    <Marker position={endLatLon} icon={defaultIcon}>
                      <Popup>Điểm đến</Popup>
                    </Marker>
                    {routePaths[ridePost.id] && <Polyline positions={routePaths[ridePost.id]} color="blue" />}
                    {shortestPaths[ridePost.id] && <Polyline positions={shortestPaths[ridePost.id]} color="red" />}
                  </MapContainer>
                </div>
              )}
  
              <div className="action-ride-post">
                <div className="like-number-ride-post">
                  <img className="like-ride-Post" src={likeFillIcon} alt="Like" />
                  <span className="number-like-ride-post">12</span>
                </div>
                {!isOwner && (
                  <div className="accept-ride-post" onClick={() => handleAcceptClick(ridePost)}>
                    <img className="check-ride-post" src={checkIcon} alt="Check" />
                    <span className="accept-ride">Chấp nhận</span>
                  </div>
                )}
                <div className="see-ride-map" onClick={() => handleSeeMapClick(ridePost)}>
                  <FaMapLocationDot className="see-map" alt="See map" />
                  <span className="see">{showMap[ridePost.id] ? "Ẩn map" : "Xem map"}</span>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <p>Không có bài viết nào.</p>
      )}
  
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
const MapControl = ({ center, bounds }) => {
  useMapControl(center, bounds);
  return null;
};
export default AllSharingRide;