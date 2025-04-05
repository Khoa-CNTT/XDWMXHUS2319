import React, { useState, useEffect, useRef } from "react";
import "../../styles/YourRide.scss";
import { FiNavigation, FiChevronUp, FiChevronDown, FiMapPin, FiClock, 
  FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchPassengerRides } from "../../stores/action/ridePostAction";
import * as signalR from "@microsoft/signalr";
import axios from "axios";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const YourRide = () => {
  const [showHistory, setShowHistory] = useState(false);
  const [routePaths, setRoutePaths] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [lastSentPosition, setLastSentPosition] = useState(null);
  const [lastNotifiedPosition, setLastNotifiedPosition] = useState(null);
  const [expandedRide, setExpandedRide] = useState(null);
  
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const signalRConnectionRef = useRef(null);

  const dispatch = useDispatch();
  const { passengerRides, loading, error } = useSelector((state) => state.rides);

  // Fetch rides on mount
  useEffect(() => {
    dispatch(fetchPassengerRides());
  }, [dispatch]);

// SignalR: Nhận thông báo từ server
useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7053/notificationHub", {
        accessTokenFactory: () => localStorage.getItem("token"),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    signalRConnectionRef.current = connection;

    connection.on("ReceiveNotificationUpdateLocation", (message) => {
      const notification = {
        message: message,
        timestamp: new Date().toISOString(),
      };
      setNotifications((prev) => [...prev, notification]);
      toast.info(message);
      console.log("Received notification:", notification);
    });

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("SignalR Connected");
      } catch (err) {
        console.error("SignalR Connection Error:", err);
      }
    };

    startConnection();

    connection.onclose(async () => {
      console.log("SignalR Disconnected, attempting to reconnect...");
      await startConnection();
    });

    return () => {
      connection.stop().then(() => console.log("SignalR Disconnected"));
    };
  }, []);

  // Haversine distance calculation
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };
// Lấy địa chỉ từ tọa độ (sử dụng Nominatim API)
const getAddressFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lon}`;
    } catch (error) {
      console.error("Error fetching address:", error);
      return `${lat}, ${lon}`; // Fallback nếu lỗi
    }
  };
 // Gửi vị trí lên server
 const sendLocationToServer = async (rideId, latitude, longitude, isNearDestination = false) => {
    try {
      const location = await getAddressFromCoordinates(latitude, longitude);
      const token = localStorage.getItem("token");
      await axios.post(
        "https://localhost:7053/api/updatelocation/update",
        { rideId, latitude, longitude, isNearDestination, location },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLastSentPosition({ lat: latitude, lon: longitude });
      console.log("Location sent successfully:", location);
    } catch (error) {
      console.error("Error sending location:", error);
      toast.error("Gửi vị trí thất bại");
    }
  };

  // Watch geolocation
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your device!");
      return;
    }

    const handlePositionError = (err) => {
      const errorMessages = {
        1: "Vui lòng cho phép truy cập vị trí trong trình duyệt!",
        2: "Không thể xác định vị trí hiện tại! Vui lòng kiểm tra GPS.",
        3: "Hết thời gian lấy vị trí (20s), đang thử lại..."
      };
      toast.error(errorMessages[err.code] || `Lỗi không xác định: ${err.message}`);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        const newPosition = { lat: latitude, lon: longitude };
        setCurrentPosition(newPosition);

        if (!lastNotifiedPosition || 
            calculateDistance(lastNotifiedPosition.lat, lastNotifiedPosition.lon, latitude, longitude) > 50) {
          setLastNotifiedPosition(newPosition);
        }
      },
      handlePositionError,
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [lastNotifiedPosition]);

  // Periodic location updates
  useEffect(() => {
    const acceptedRides = passengerRides.filter((ride) => ride.status === "Accepted");
    if (!currentPosition || acceptedRides.length === 0) return;

    const ride = acceptedRides[0];
    const rideId = ride.rideId;
    const endLatLon = parseLatLon(ride.latLonEnd);
    const { lat, lon } = currentPosition;

    intervalRef.current = setInterval(() => {
      if (lastSentPosition) {
        const distanceMoved = calculateDistance(
          lastSentPosition.lat, lastSentPosition.lon, lat, lon
        ) * 1000; // Chuyển sang mét

        if (distanceMoved < 50) return; // Không gửi nếu < 50m
      }

      const distanceToEnd = endLatLon ? calculateDistance(lat, lon, endLatLon[0], endLatLon[1]) * 1000 : Infinity;
      const isNearDestination = distanceToEnd <= 500;

      sendLocationToServer(rideId, lat, lon, isNearDestination);
    }, 10000);

    return () => clearInterval(intervalRef.current);
  }, [currentPosition, passengerRides, lastSentPosition]);

  // Fetch route from GraphHopper
  const fetchRoute = async (rideId, startLatLon, endLatLon) => {
    const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY;
    const url = `https://graphhopper.com/api/1/route?point=${startLatLon.join(',')}&point=${endLatLon.join(',')}&vehicle=car&locale=vi&key=${apiKey}&points_encoded=false`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.paths?.[0]?.points?.coordinates) {
        const coordinates = data.paths[0].points.coordinates.map(([lon, lat]) => [lat, lon]);
        setRoutePaths((prev) => ({ ...prev, [rideId]: coordinates }));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Parse coordinates
  const parseLatLon = (latLonString) => {
    if (!latLonString || latLonString === "0") return null;
    return latLonString.split(",").map(Number);
  };

  // Calculate routes for accepted rides
  useEffect(() => {
    passengerRides
      .filter((ride) => ride.status === "Accepted")
      .forEach((ride) => {
        const startLatLon = parseLatLon(ride.latLonStart);
        const endLatLon = parseLatLon(ride.latLonEnd);
        if (startLatLon && endLatLon && !routePaths[ride.rideId]) {
          fetchRoute(ride.rideId, startLatLon, endLatLon);
        }
      });
  }, [passengerRides, routePaths]);

  const toggleRideExpansion = (rideId) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  const acceptedRides = passengerRides.filter((ride) => ride.status === "Accepted");

  // Hàm format thời gian thông báo
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
  };
  const calculateBounds = (start, current, end) => {
    const points = [];
    
    if (start) points.push([start[0], start[1]]);
    if (current) points.push([current.lat, current.lon]);
    if (end) points.push([end[0], end[1]]);
    
    // Nếu không có đủ 3 điểm, tạo bounds mặc định
    if (points.length === 0) return L.latLngBounds([[0, 0], [0, 0]]);
    
    return L.latLngBounds(points).pad(0.2); // pad thêm 20% khoảng trống xung quanh
  };
  return (
    <div className="your-rides-container">
      <div className="rides-header">
        <h2><FiNavigation /> Chuyến đi của bạn</h2>
      </div>
  
      <div className="rides-list">
        {acceptedRides.length > 0 ? (
          acceptedRides.map((ride) => {
            const startLatLon = parseLatLon(ride.latLonStart);
            const endLatLon = parseLatLon(ride.latLonEnd);
            const isExpanded = expandedRide === ride.rideId;
  
            return (
              <div className={`ride-card ${isExpanded ? "expanded" : ""}`} key={ride.rideId}>
                <div className="ride-summary" onClick={() => toggleRideExpansion(ride.rideId)}>
                  <div className="ride-info">
                    <h3><FiMapPin />Từ: {ride.startLocation} → {ride.endLocation}</h3>
                    <div className="ride-meta">
                      <span className="ride-time">
                        <FiClock /> {new Date(ride.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className={`ride-status ${ride.status.toLowerCase()}`}>
                        {ride.status === "Accepted" ? <FiCheckCircle /> : <FiAlertCircle />}
                        {ride.status === "Accepted" ? "Đang di chuyển" : ride.status}
                      </span>
                    </div>
                  </div>
                  <div className="expand-icon">
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                </div>
  
                {isExpanded && (
                  <div className="ride-details">
                    <div className="details-grid">
                      <div className="detail-item">
                        <label>Thời gian bắt đầu:</label>
                        <span>{new Date(ride.startTime).toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <label>Thời gian kết thúc:</label>
                        <span>{new Date(ride.endTime).toLocaleString()}</span>
                      </div>
                      <div className="detail-item">
                        <label>Thời gian dự kiến:</label>
                        <span>{ride.estimatedDuration} phút</span>
                      </div>
                      <div className="detail-item">
                        <label>Độ an toàn:</label>
                        <span className={ride.isSafe ? "safe" : "unsafe"}>
                          {ride.isSafe ? "An toàn" : "Không an toàn"}
                        </span>
                      </div>
                    </div>
  
                    <div className="map-notification-container">
                      <div className="map-container">
                        {startLatLon && endLatLon && (
                          <MapContainer
                          bounds={calculateBounds(startLatLon, currentPosition, endLatLon)}
                          style={{ height: "300px", width: "100%" }}
                          zoomControl={false}
                          dragging={false}
                          doubleClickZoom={false}
                          scrollWheelZoom={false}
                          touchZoom={false}
                          boxZoom={false}
                          keyboard={false}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={startLatLon} icon={defaultIcon}>
                              <Popup>Điểm đón</Popup>
                            </Marker>
                            <Marker position={endLatLon} icon={defaultIcon}>
                              <Popup>Điểm đến</Popup>
                            </Marker>
                            {currentPosition && (
                              <Marker position={[currentPosition.lat, currentPosition.lon]} icon={defaultIcon}>
                                <Popup>Vị trí hiện tại</Popup>
                              </Marker>
                            )}
                            {routePaths[ride.rideId] && (
                              <Polyline 
                                positions={routePaths[ride.rideId]} 
                                color="#3a86ff" 
                                weight={4}
                              />
                            )}
                          </MapContainer>
                        )}
                      </div>
  
                      <div className="notifications-section">
                        <h4><FiAlertCircle /> Cập nhật vị trí</h4>
                        {notifications.length > 0 ? (
                          <ul className="notifications-list">
                            {notifications.map((notification, idx) => (
                              <li key={idx}>
                                <div className="notification-message">{notification.message}</div>
                                <div className="notification-time">
                                  {formatTimeAgo(notification.timestamp)}
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-notifications">Chưa có cập nhật nào</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="no-rides-message">
            <img src="/images/no-rides.svg" alt="No rides" />
            <p>Hiện không có chuyến đi nào</p>
          </div>
        )}
      </div>
  
      <div className="history-toggle-container">
        <button 
          className="toggle-history-btn"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? <><FiChevronUp /> Ẩn lịch sử</> : <><FiChevronDown /> Xem lịch sử chuyến đi</>}
        </button>
      </div>
  
      {showHistory && (
        <div className="rides-history">
          <h3><FiClock /> Lịch sử chuyến đi</h3>
          {passengerRides.length > 0 ? (
            <div className="history-list">
              {passengerRides.map((ride) => (
                <div className="history-item" key={ride.rideId}>
                  <div className="history-header">
                    <span className="route">Đi từ: {ride.startLocation} → {ride.endLocation}</span>
                    <span className={`status ${ride.status.toLowerCase()}`}>
                      Trạng thái: {ride.status === "Completed" ? "Hoàn thành" : ride.status}
                    </span>
                  </div>
                  <div className="history-details">
                    <span>{new Date(ride.startTime).toLocaleDateString()}</span>
                    <span>Thời gian ước tính: {ride.estimatedDuration} phút</span>
                    <span className={ride.isSafe ? "safe" : "unsafe"}>
                      {ride.isSafe ? "An toàn" : "Không an toàn"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history-message">
              <p>Chưa có lịch sử chuyến đi</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YourRide;