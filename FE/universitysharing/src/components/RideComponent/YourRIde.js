import axios from "axios";

import { TbMoodEmptyFilled } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cancelRide, rateDriver } from "../../stores/action/ridePostAction";
import RatingModal from "../RatingModal";

import { motion } from "framer-motion";

import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { confirmAlert } from "react-confirm-alert";

import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../contexts/AuthContext"; // Thêm import useAuth

// Icons
import { FaCar } from "react-icons/fa6";
import {
  FiAlertTriangle,
  FiArchive,
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiInbox,
  FiMap,
  FiMapPin,
  FiNavigation,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUser,
} from "react-icons/fi";

// Leaflet assets
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Styles
import "leaflet/dist/leaflet.css";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/YourRide.scss";
// Redux actions
import {
  fetchLocation,
  fetchRidesByUserId,
} from "../../stores/action/ridePostAction";

// Placeholder animation for empty state
const emptyRideAnimation = {
  v: "5.5.2",
  fr: 60,
  ip: 0,
  op: 60,
  w: 500,
  h: 500,
  nm: "Empty Animation",
  ddd: 0,
  assets: [],
  layers: [],
};

// Custom Leaflet marker icons
const startIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const endIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const movingCarIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Main component for managing user rides
const YourRide = () => {
  // State declarations
  const [showHistory, setShowHistory] = useState(false);
  const [routePaths, setRoutePaths] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [lastSentPosition, setLastSentPosition] = useState(null);
  const [lastNotifiedPosition, setLastNotifiedPosition] = useState(null);
  const [expandedRide, setExpandedRide] = useState(null);
  const [userId, setUserId] = useState(null);
  const [smoothedProgress, setSmoothedProgress] = useState(0);
  const [isFollowing, setIsFollowing] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);

  const navigate = useNavigate();

  const [mapReady, setMapReady] = useState(false); // Thêm state để kiểm tra bản đồ sẵn sàng

  // Refs for managing intervals and connections
  const mapRef = useRef(null);
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastToastTime = useRef(0); // Theo dõi thời gian toast lần cuối

  // Redux hooks
  const dispatch = useDispatch();
  const { driverRides, passengerRides, locations, loading, error } =
    useSelector((state) => state.rides);
  // Lấy authData từ useAuth
  const { userId: authUserId, isAuthenticated, isLoading } = useAuth();
  // Cập nhật userId từ AuthContext
  useEffect(() => {
    if (isAuthenticated && authUserId) {
      setUserId(authUserId);
      console.log("[YourRide] UserId from AuthContext:", authUserId);
      dispatch(fetchRidesByUserId());
    } else if (!isLoading && !isAuthenticated) {
      console.warn("[YourRide] Không có người dùng đăng nhập");
      setUserId(null);
    }
  }, [isAuthenticated, authUserId, isLoading, dispatch]);
  // Đánh dấu bản đồ đã sẵn sàng sau khi khởi tạo
  useEffect(() => {
    if (mapRef.current) {
      // Đảm bảo Leaflet cập nhật kích thước bản đồ
      mapRef.current.invalidateSize();
      setMapReady(true);
      console.log("[YourRide] Map is ready");
    }
  }, [mapRef.current]);
  useEffect(() => {
    const currentRide = getCurrentRide();
    if (currentRide && userId) {
      dispatch(fetchLocation(currentRide.rideId));
    }
  }, [dispatch, userId]);
  useEffect(() => {
    if (locations && locations.length > 0) {
      const newNotifications = locations.map((loc, idx) => ({
        id: loc.id || `location-${idx}-${Date.now()}`,
        message: `${
          loc.userId === userId ? "Bạn" : loc.isDriver ? "Tài xế" : "Hành khách"
        } đã cập nhật vị trí tại: ${
          loc.location || `${loc.latitude}, ${loc.longitude}`
        }`,
        timestamp: loc.timestamp,
        isNew: false,
      }));
      setNotifications(newNotifications);
    }
  }, [locations, userId]);
  // Update map bounds when current ride or position changes
  useEffect(() => {
    const currentRide = getCurrentRide();
    if (currentRide && currentPosition && mapReady) {
      const start = parseLatLon(currentRide.latLonStart);
      const end = parseLatLon(currentRide.latLonEnd);
      if (start && end) {
        const bounds = L.latLngBounds([
          start,
          end,
          [currentPosition.lat, currentPosition.lon],
        ]).pad(0.2);
        setMapBounds(bounds);
        if (mapRef.current) {
          mapRef.current.flyToBounds(bounds, { maxZoom: 16, duration: 1 });
          console.log("[YourRide] Fly to bounds:", bounds);
        }
      }
    }
  }, [currentPosition, mapReady]);

  // Center map on current position when following
  useEffect(() => {
    if (isFollowing && mapRef.current && currentPosition && mapReady) {
      const newCenter = [currentPosition.lat, currentPosition.lon];
      const currentZoom = mapRef.current.getZoom() || 14;
      mapRef.current.flyTo(
        newCenter,
        currentZoom >= 12 && currentZoom <= 16 ? currentZoom : 14,
        { duration: 0.5 }
      );
    }
  }, [currentPosition, isFollowing]);


  // Calculate distance between two points using Haversine formula (in km)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c) / 1000;
  };

  // Fetch address from coordinates using OpenStreetMap Nominatim
  const getAddressFromCoordinates = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lon}`;
    } catch (error) {
      console.error("Error fetching address:", error);
      return `${lat}, ${lon}`;
    }
  };

  // Send current location to server
const sendLocationToServer = async (
  rideId,
  latitude,
  longitude,
  isNearDestination = false
) => {
  try {
    const location = await getAddressFromCoordinates(latitude, longitude);
    const cleanLocation = location.split(", ").slice(0, -2).join(", ");
    const token = localStorage.getItem("token");

    // Log giá trị isNearDestination trước khi gửi
    console.log("[sendLocationToServer] isNearDestination:", isNearDestination);

    const payload = {
      rideId,
      latitude,
      longitude,
      isNearDestination,
      location: cleanLocation,
    };
    console.log("[sendLocationToServer] Payload:", payload);

    const response = await axios.post(
      "https://localhost:7053/api/updatelocation/update",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setLastSentPosition({ lat: latitude, lon: longitude });
    
    // Thêm vị trí hiện tại vào notifications
    const newNotification = {
      id: `location-${Date.now()}`,
      message: `Bạn đã cập nhật vị trí tại: ${cleanLocation}`,
      timestamp: new Date().toISOString(),
      isNew: true,
    };
    setNotifications((prev) => [...prev, newNotification]);

    // Kiểm tra rideStatus từ server
    const { rideStatus } = response.data?.data || {};
    if (rideStatus === "Completed") {
      console.log("[YourRide] Ride completed, reloading page...");
      window.location.reload();
    }

    console.log(
      `Location sent: ${latitude}, ${longitude} - Address: ${cleanLocation}`
    );
  } catch (error) {
    console.error("Error sending location:", error);
  }
};

  // Track current position using geolocation
useEffect(() => {
  if (!navigator.geolocation) {
    console.error("Device does not support geolocation!");
    return;
  }

  const handlePositionError = (err) => {
    console.error(`Geolocation error: ${err.message}`);
  };

  watchIdRef.current = navigator.geolocation.watchPosition(
    ({ coords: { latitude, longitude } }) => {
      const newPosition = { lat: latitude, lon: longitude };
      // Chỉ cập nhật nếu vị trí thay đổi > 10m để tránh re-render quá nhiều
      if (
        !currentPosition ||
        calculateDistance(
          currentPosition.lat,
          currentPosition.lon,
          latitude,
          longitude
        ) > 0.01
      ) {
        setCurrentPosition(newPosition);
        console.log(`New position received: ${latitude}, ${longitude}`);
        if (
          !lastNotifiedPosition ||
          calculateDistance(
            lastNotifiedPosition.lat,
            lastNotifiedPosition.lon,
            latitude,
            longitude
          ) > 0.01
        ) {
          setLastNotifiedPosition(newPosition);
        }
      }
    },
    handlePositionError,
    { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
  );

  return () => {
    if (watchIdRef.current)
      navigator.geolocation.clearWatch(watchIdRef.current);
  };
}, [currentPosition, lastNotifiedPosition]);

  // Periodically send location for current ride
useEffect(() => {
  const currentRide = getCurrentRide();
  if (!currentPosition || !currentRide || !userId) return;

  const rideId = currentRide.rideId;
  const endLatLon = parseLatLon(currentRide.latLonEnd);
  const { lat, lon } = currentPosition;
  const isDriver = currentRide.driverId === userId;

  // Log tọa độ điểm đến để kiểm tra
  console.log("[YourRide] endLatLon:", endLatLon);

  intervalRef.current = setInterval(() => {
    // Kiểm tra khoảng cách với vị trí đã gửi trước đó
    if (
      lastSentPosition &&
      calculateDistance(
        lastSentPosition.lat,
        lastSentPosition.lon,
        lat,
        lon
      ) < 0.05 // 50m
    ) {
      console.log("Position unchanged (< 50m), skipping send...");
      return;
    }

    const distanceToEnd = endLatLon
      ? calculateDistance(lat, lon, endLatLon[0], endLatLon[1])
      : Infinity;
    const isNearDestination = distanceToEnd <= 5;
    console.log("[YourRide] distanceToEnd:", distanceToEnd, "isNearDestination:", isNearDestination);

    if (isDriver || currentRide.isSafetyTrackingEnabled) {
      sendLocationToServer(rideId, lat, lon, isNearDestination);
    }
  }, 5000);

  return () => clearInterval(intervalRef.current);
}, [currentPosition, driverRides, passengerRides, lastSentPosition, userId]);

  // Fetch route from GraphHopper API
  const fetchRoute = async (rideId, startLatLon, endLatLon) => {
    const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY;
    const url = `https://graphhopper.com/api/1/route?point=${startLatLon.join(
      ","
    )}&point=${endLatLon.join(
      ","
    )}&vehicle=car&locale=vi&key=${apiKey}&points_encoded=false`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.paths?.[0]?.points?.coordinates) {
        const coordinates = data.paths[0].points.coordinates.map(
          ([lon, lat]) => [lat, lon]
        );
        setRoutePaths((prev) => ({ ...prev, [rideId]: coordinates }));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Parse latitude and longitude from string
  const parseLatLon = (latLonString) => {
    if (!latLonString || latLonString === "0") return null;
    return latLonString.split(",").map(Number);
  };

  // Fetch route for current ride
  useEffect(() => {
    const currentRide = getCurrentRide();
    if (currentRide) {
      const startLatLon = parseLatLon(currentRide.latLonStart);
      const endLatLon = parseLatLon(currentRide.latLonEnd);
      if (startLatLon && endLatLon && !routePaths[currentRide.rideId]) {
        fetchRoute(currentRide.rideId, startLatLon, endLatLon);
      }
    }
  }, [driverRides, passengerRides, routePaths]);

  // Calculate ride progress percentage
  const calculateProgress = (ride, currentPosition) => {
    if (!ride || !currentPosition) return 0;
    const startLatLon = parseLatLon(ride.latLonStart);
    const endLatLon = parseLatLon(ride.latLonEnd);
    if (!startLatLon || !endLatLon) return 0;

    const totalDistance = calculateDistance(
      startLatLon[0],
      startLatLon[1],
      endLatLon[0],
      endLatLon[1]
    );
    const traveledDistance = calculateDistance(
      startLatLon[0],
      startLatLon[1],
      currentPosition.lat,
      currentPosition.lon
    );
    const distanceToEnd = calculateDistance(
      currentPosition.lat,
      currentPosition.lon,
      endLatLon[0],
      endLatLon[1]
    );

    if (distanceToEnd < 0.05) return 100;
    return Math.min((traveledDistance / totalDistance) * 100, 100);
  };

  // Calculate remaining distance to destination
  const calculateRemainingDistance = (ride, currentPosition) => {
    if (!ride || !currentPosition || !ride.latLonEnd) return 0;
    const endLatLon = parseLatLon(ride.latLonEnd);
    if (!endLatLon) return 0;
    return calculateDistance(
      currentPosition.lat,
      currentPosition.lon,
      endLatLon[0],
      endLatLon[1]
    );
  };

  // Helper function to get current ride
  const getCurrentRide = () =>
    (Array.isArray(driverRides)
      ? driverRides.find((ride) => ride.status === "Accepted")
      : null) ||
    (Array.isArray(passengerRides)
      ? passengerRides.find((ride) => ride.status === "Accepted")
      : null);
  const currentRide = getCurrentRide();
  // Smooth progress animation
  // const currentRide = getCurrentRide();
  const progress = calculateProgress(currentRide, currentPosition);
  useEffect(() => {
    const timer = setTimeout(() => setSmoothedProgress(progress), 500);
    return () => clearTimeout(timer);
  }, [progress]);

  // Toggle ride card expansion
  const toggleRideExpansion = (rideId) => {
    setExpandedRide(expandedRide === rideId ? null : rideId);
  };

  // Format timestamp to "time ago" string
  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Center map on current location
  const handleBackToCurrentLocation = () => {
    if (mapRef.current && currentPosition) {
      const newBounds = L.latLngBounds(
        [currentPosition.lat, currentPosition.lon],
        [currentPosition.lat, currentPosition.lon]
      ).pad(0.5);
      mapRef.current.flyToBounds(newBounds, { maxZoom: 16, duration: 1 });
      setIsFollowing(true);
    }
  };

  const handleCancelRide = (rideId) => {
    toast.info("Đang hủy chuyến đi, vui lòng chờ...", { autoClose: 3000 });
    setTimeout(() => {
      dispatch(cancelRide(rideId))
        .unwrap()
        .then(() => {
          dispatch(fetchRidesByUserId());
        })
        .catch((err) => {
          toast.error(`Lỗi khi hủy chuyến đi: ${err}`);
        });
    }, 3000);
  };

  const confirmCancelRide = (rideId) => {
    confirmAlert({
      title: "Xác nhận hủy",
      message: "Bạn có chắc chắn muốn hủy chuyến đi này không?",
      buttons: [
        { label: "Có", onClick: () => handleCancelRide(rideId) },
        { label: "Không", onClick: () => {} },
      ],
    });
  };

  const handleRateDriver = (rideId, driverId, rating, comment) => {
    dispatch(
      rateDriver({
        rideId,
        driverId,
        rating,
        comment,
      })
    )
      .unwrap()
      .then(() => {
        dispatch(fetchRidesByUserId()); // Fetch rides again to update IsRating
        toast.success("Đánh giá đã được gửi!");
      })
      .catch((err) => {
        console.error("Rating error:", err);
        toast.error("Lỗi khi gửi đánh giá!");
      });
  };
  const handleSearchRide = () => navigate("/sharing-ride");
  const isRideRated = (ride) => ride.isRating; // Use isRating directly from the ride object

  const openRatingModal = (ride) => {
    setSelectedRide(ride);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setSelectedRide(null);
  };

  if (loading) return <p className="loading">Loading data...</p>;
  if (error) return <p className="error">Error: {error.message || error}</p>;

  const isDriver = currentRide && currentRide.driverId === userId;
  const completedRides = [
    ...(Array.isArray(driverRides)
      ? driverRides.filter((ride) => ride.status === "Completed")
      : []),
    ...(Array.isArray(passengerRides)
      ? passengerRides.filter((ride) => ride.status === "Completed")
      : []),
  ];
  const remainingDistance = currentRide
    ? calculateRemainingDistance(currentRide, currentPosition)
    : 0;

  const cityBounds = L.latLngBounds(
    L.latLng(15.9, 107.9),
    L.latLng(16.2, 108.4)
  );

  return (
    <div className="rides-app">
      <div className="rides-header">
        <h2>
          <FiNavigation className="header-icon" /> Chuyến đi của bạn
        </h2>
        <div className="header-gradient"></div>
      </div>

      {currentRide ? (
        <motion.div
          className={`ride-card ${
            expandedRide === currentRide.rideId ? "expanded" : ""
          } ${isDriver ? "driver-ride" : "passenger-ride"}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div
            className="ride-summary"
            onClick={() => toggleRideExpansion(currentRide.rideId)}
          >
            <div className="ride-info">
              <div className="ride-badge">
                {isDriver ? (
                  <FaCar className="ride-icon" />
                ) : (
                  <FiUser className="ride-icon" />
                )}
                <span className="badge-text">
                  {isDriver ? "Tài xế" : "Hành khách"}
                </span>
              </div>
              <div className="route-info">
                <h3>
                  <span className="from-to">Điểm đi: </span>
                  <span className="location">{currentRide.startLocation}</span>
                  <FiArrowRight className="route-arrow" />
                  <span className="from-to">Điểm đến: </span>
                  <span className="location">{currentRide.endLocation}</span>
                </h3>
                <div className="progress-container">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${smoothedProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    >
                      <div className="moving-indicator">
                        <FaCar className="car-icon" />
                      </div>
                    </motion.div>
                  </div>
                  <span className="progress-text">
                    Đã đi {Math.round(smoothedProgress)}% ( Còn lại{" "}
                    {remainingDistance.toFixed(1)} km)
                  </span>
                </div>
              </div>
            </div>
            <div className="ride-meta">
              <span className="ride-time">
                <FiClock className="meta-icon" />{" "}
                {new Date(currentRide.startTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="ride-status active">
                <div className="pulse-dot"></div> Đang di chuyển
              </span>
              <button
                className="btn-cancel-ride"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmCancelRide(currentRide.rideId);
                }}
              >
                Hủy chuyến đi
              </button>
            </div>
            <div className="expand-icon">
              {expandedRide === currentRide.rideId ? (
                <FiChevronUp />
              ) : (
                <FiChevronDown />
              )}
            </div>
          </div>

          {expandedRide === currentRide.rideId && (
            <motion.div
              className="ride-details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
            >
              <div className="details-grid">
                <div className="detail-item">
                  <label>
                    <FiCalendar /> Bắt đầu:
                  </label>
                  <span>
                    {new Date(currentRide.startTime).toLocaleString()}
                  </span>
                </div>
                <div className="detail-item">
                  <label>
                    <FiCalendar /> Kết thúc:
                  </label>
                  <span>{new Date(currentRide.endTime).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>
                    <FiClock /> Thời gian dự kiến:
                  </label>
                  <span>{currentRide.estimatedDuration} phút</span>
                </div>
                <div className="detail-item">
                  <label>
                    <FiShield /> An toàn:
                  </label>
                  <span
                    className={`safety-badge ${
                      currentRide.isSafetyTrackingEnabled ? "safe" : "unsafe"
                    }`}
                  >
                    {currentRide.isSafetyTrackingEnabled ? (
                      <>
                        <FiCheckCircle /> An toàn
                      </>
                    ) : (
                      <>
                        <FiAlertTriangle /> Cảnh báo
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="interactive-section">
                <div className="map-container">
                  <div className="map-controls">
                    <button
                      className={`location-button ${
                        isFollowing ? "active" : ""
                      }`}
                      onClick={handleBackToCurrentLocation}
                      title="Về vị trí hiện tại"
                    >
                      <FiNavigation />
                      {isFollowing && <span className="pulse-dot"></span>}
                    </button>
                  </div>
                  <div className="map-header">
                    <h4>
                      <FiMap /> Hành trình
                    </h4>
                    <div className="distance-display">
                      <FiNavigation /> Còn {remainingDistance.toFixed(1)} km
                    </div>
                  </div>
                  {parseLatLon(currentRide.latLonStart) &&
                    parseLatLon(currentRide.latLonEnd) && (
                      <MapContainer
                        ref={mapRef}
                        center={[16.06778, 108.22346]}
                        zoom={14}
                        bounds={mapBounds}
                        style={{ height: "300px", width: "100%", zIndex: 1 }}
                        minZoom={12}
                        maxBounds={cityBounds}
                        whenCreated={(map) => {
                          mapRef.current = map;
                          map.on("zoomstart", () => setIsFollowing(false));
                          map.on("dragstart", () => setIsFollowing(false));
                          map.on("drag", () => {
                            if (!map.getBounds().intersects(cityBounds)) {
                              map.fitBounds(cityBounds);
                            }
                          });
                        }}
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={parseLatLon(currentRide.latLonStart)}
                          icon={startIcon}
                        >
                          <Popup>Điểm đón</Popup>
                        </Marker>
                        <Marker
                          position={parseLatLon(currentRide.latLonEnd)}
                          icon={endIcon}
                        >
                          <Popup>Điểm đến</Popup>
                        </Marker>
                        {currentPosition && (
                          <Marker
                            position={[
                              currentPosition.lat,
                              currentPosition.lon,
                            ]}
                            icon={movingCarIcon}
                          >
                            <Popup>Vị trí hiện tại</Popup>
                          </Marker>
                        )}
                        {routePaths[currentRide.rideId] && (
                          <Polyline
                            positions={routePaths[currentRide.rideId]}
                            color={isDriver ? "#3a86ff" : "#28a745"}
                            weight={4}
                            dashArray="5, 5"
                          />
                        )}
                      </MapContainer>
                    )}
                </div>

                <div className="notifications-section">
                  <div className="notifications-header">
                    <h4>
                      <FiBell /> Cập nhật vị trí
                    </h4>
                    <button
                      className="refresh-btn"
                      onClick={() => {
                        setNotifications([]);
                        dispatch(fetchLocation(currentRide.rideId));
                      }}
                    >
                      <FiRefreshCw /> Làm mới
                    </button>
                  </div>
                  {notifications.length > 0 ? (
                    <div className="notifications-list">
                      {notifications.slice(0, 5).map((notification, idx) => (
                        <motion.div
                          key={idx}
                          className="notification-item"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                        >
                          <div className="notification-badge">
                            <FiMapPin />
                          </div>
                          <div className="notification-content">
                            <div className="notification-message">
                              {notification.message}
                            </div>
                            <div className="notification-meta">
                              <span className="notification-time">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-notifications">
                      <FiInbox className="empty-icon" />
                      <p>Chưa có cập nhật</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="empty-animation">
            <TbMoodEmptyFilled style={{ fontSize: 100, color: "#aaa" }} />
          </div>
          <h3>Không có chuyến đi hiện tại</h3>
          <p>Bắt đầu chuyến đi mới để bắt đầu!</p>
          <button className="find-ride-btn" onClick={handleSearchRide}>
            <FiSearch /> Tìm chuyến đi
          </button>
        </motion.div>
      )}

      <div className="history-section">
        <motion.button
          className="history-toggle"
          onClick={() => setShowHistory(!showHistory)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {showHistory ? (
            <>
              <FiChevronUp /> Ẩn lịch sử
            </>
          ) : (
            <>
              <FiChevronDown /> Xem lịch sử chuyến đi
            </>
          )}
        </motion.button>

        {showHistory && (
          <motion.div
            className="history-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="history-title">
              <FiClock /> Lịch sử chuyến đi
            </h3>
            {completedRides.length > 0 ? (
              <div className="history-list">
                {completedRides.map((ride) => {
                  const isDriverHistory = ride.driverId === userId;
                  const isRated = isRideRated(ride);
                  return (
                    <motion.div
                      className={`history-item ${
                        isDriverHistory ? "driver-history" : "passenger-history"
                      }`}
                      key={ride.rideId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="history-icon">
                        {isDriverHistory ? <FaCar /> : <FiUser />}
                      </div>
                      <div className="history-details">
                        <div className="history-route">
                          <span className="location">{ride.startLocation}</span>
                          <FiArrowRight className="route-arrow" />
                          <span className="location">{ride.endLocation}</span>
                        </div>
                        <div className="history-meta">
                          <span className="date">
                            {new Date(ride.startTime).toLocaleDateString()}
                          </span>
                          <span className="duration">
                            {ride.estimatedDuration} phút
                          </span>
                          <span
                            className={`safety ${
                              ride.isSafetyTrackingEnabled ? "safe" : "unsafe"
                            }`}
                          >
                            {ride.isSafetyTrackingEnabled
                              ? "An toàn"
                              : "Cảnh báo"}
                          </span>
                        </div>
                      </div>
                      <div className="history-status completed">
                        <div className="status-text">
                          <FiCheckCircle /> Hoàn thành
                        </div>
                        {!isDriverHistory && !isRated && (
                          <button
                            className="rate-button"
                            onClick={() => openRatingModal(ride)}
                          >
                            Đánh giá
                          </button>
                        )}
                        {isRated && (
                          <span className="rated-badge">
                            <FiCheckCircle /> Đã đánh giá
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-history">
                <FiArchive className="empty-icon" />
                <p>Chưa có lịch sử chuyến đi</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <RatingModal
        isOpen={showRatingModal}
        onClose={closeRatingModal}
        ride={selectedRide}
        onSubmit={handleRateDriver}
      />
    </div>
  );
};

export default YourRide;
