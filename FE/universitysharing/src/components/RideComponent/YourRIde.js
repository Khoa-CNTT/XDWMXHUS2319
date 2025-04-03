import React, { useState, useEffect, useRef } from "react";
import "../../styles/YourRide.scss";
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
  const intervalRef = useRef(null);
  const watchIdRef = useRef(null);

  const dispatch = useDispatch();
  const { passengerRides, loading, error } = useSelector((state) => state.rides);

  useEffect(() => {
    dispatch(fetchPassengerRides());
  }, [dispatch]);

  // Khởi tạo SignalR connection
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7053/notificationHub", {
        accessTokenFactory: () => localStorage.getItem("token"),
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("SignalR Connected"))
      .catch((err) => console.error("SignalR Connection Error:", err));

    connection.on("ReceiveNotificationUpdateLocation", (message) => {
      setNotifications((prev) => [...prev, message]);
      toast.info(`Cập nhật vị trí: ${message}`);
    });

    return () => {
      connection.stop();
    };
  }, []);

  // Hàm tính khoảng cách Haversine (đơn vị: mét)
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

    return R * c;
  };

  // Gửi vị trí lên server
  const sendLocationToServer = async (rideId, latitude, longitude) => {
    const token = localStorage.getItem("token");
    const payload = {
      RideId: rideId,
      Latitude: latitude.toString(),
      Longitude: longitude.toString(),
    };

    try {
      await axios.post(
        "https://localhost:7053/api/updatelocation/update",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLastSentPosition({ lat: latitude, lon: longitude });
      console.log("Đã gửi vị trí thành công!");
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  // Theo dõi vị trí và xử lý
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Thiết bị không hỗ trợ Geolocation!");
      return;
    }

    const handlePositionError = (err) => {
      console.error("Geolocation error:", err);
      switch (err.code) {
        case err.PERMISSION_DENIED:
          toast.error("Vui lòng cấp quyền truy cập vị trí trong trình duyệt!");
          break;
        case err.POSITION_UNAVAILABLE:
          toast.error("Không thể xác định vị trí hiện tại! Vui lòng kiểm tra GPS.");
          break;
        case err.TIMEOUT:
          toast.warn("Hết thời gian lấy vị trí (20s), đang thử lại...");
          break;
        default:
          toast.error("Lỗi không xác định: " + err.message);
      }
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = { lat: latitude, lon: longitude };
        setCurrentPosition(newPosition);

        if (!lastNotifiedPosition) {
          setLastNotifiedPosition(newPosition);
        } else {
          const distance = calculateDistance(
            lastNotifiedPosition.lat,
            lastNotifiedPosition.lon,
            latitude,
            longitude
          );
          if (distance > 50) {
            setLastNotifiedPosition(newPosition);
          }
        }
      },
      handlePositionError,
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [lastNotifiedPosition]);

  // Gửi vị trí mỗi 10s
  useEffect(() => {
    const startLocationUpdates = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        const acceptedRides = passengerRides.filter((ride) => ride.status === "Accepted");
        if (currentPosition && acceptedRides.length > 0) {
          const rideId = acceptedRides[0].rideId;
          const { lat, lon } = currentPosition;

          sendLocationToServer(rideId, lat, lon);
          console.log("Gửi vị trí lên server:", new Date().toLocaleTimeString());
        }
      }, 10000);//sửa giây
    };

    startLocationUpdates();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentPosition, passengerRides]);

  // Hàm lấy tuyến đường từ GraphHopper
  const fetchRoute = async (rideId, startLatLon, endLatLon) => {
    const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY;
    const url = `https://graphhopper.com/api/1/route?point=${startLatLon[0]},${startLatLon[1]}&point=${endLatLon[0]},${endLatLon[1]}&vehicle=car&locale=vi&key=${apiKey}&points_encoded=false`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.paths && data.paths.length > 0) {
        const coordinates = data.paths[0].points.coordinates;
        const formattedRoute = coordinates.map((coord) => [coord[1], coord[0]]);
        setRoutePaths((prev) => ({ ...prev, [rideId]: formattedRoute }));
      }
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  // Parse tọa độ từ chuỗi
  const parseLatLon = (latLonString) => {
    if (latLonString === "0") return null;
    const [lat, lon] = latLonString.split(",").map(Number);
    return [lat, lon];
  };

  // Tính toán tuyến đường cho các ride Accepted
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

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p>Lỗi: {error}</p>;

  const acceptedRides = passengerRides.filter((ride) => ride.status === "Accepted");
  const historyRides = passengerRides;

  return (
    <div className="your-ride-container">
      <h2>Your Rides</h2>

      {acceptedRides.length > 0 ? (
        acceptedRides.map((ride) => {
          const startLatLon = parseLatLon(ride.latLonStart);
          const endLatLon = parseLatLon(ride.latLonEnd);

          return (
            <div className="ride-item" key={ride.rideId}>
              <div className="ride-info">
                <p>
                  Ride ID: {ride.rideId} <br />
                  Ride Post ID: {ride.ridePostId} <br />
                  Thời gian bắt đầu: {new Date(ride.startTime).toLocaleString()} <br />
                  Thời gian kết thúc: {new Date(ride.endTime).toLocaleString()} <br />
                  Thời gian dự kiến: {ride.estimatedDuration} phút <br />
                  Trạng thái: {ride.status} <br />
                  An toàn: {ride.isSafe ? "Có" : "Không"}
                </p>
                {currentPosition && (
                  <p>
                    Vị trí hiện tại: Lat {currentPosition.lat.toFixed(5)}, Lon{" "}
                    {currentPosition.lon.toFixed(5)}
                  </p>
                )}
              </div>
              {(startLatLon && endLatLon) || currentPosition ? (
                <div className="ride-map" style={{ height: "300px", width: "100%" }}>
                  <MapContainer
                    center={startLatLon || [currentPosition.lat, currentPosition.lon]}
                    zoom={13}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {startLatLon && (
                      <Marker position={startLatLon} icon={defaultIcon}>
                        <Popup>Điểm đi</Popup>
                      </Marker>
                    )}
                    {endLatLon && (
                      <Marker position={endLatLon} icon={defaultIcon}>
                        <Popup>Điểm đến</Popup>
                      </Marker>
                    )}
                    {currentPosition && (
                      <Marker position={[currentPosition.lat, currentPosition.lon]} icon={defaultIcon}>
                        <Popup>Vị trí hiện tại</Popup>
                      </Marker>
                    )}
                    {routePaths[ride.rideId] && (
                      <Polyline positions={routePaths[ride.rideId]} color="blue" />
                    )}
                  </MapContainer>
                </div>
              ) : null}
              <div className="notifications">
                <h4>Thông báo vị trí:</h4>
                {notifications.length > 0 ? (
                  <ul>
                    {notifications.map((msg, index) => (
                      <li key={index}>{msg}</li>
                    ))}
                  </ul>
                ) : (
                  <p>Chưa có cập nhật vị trí.</p>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p>Không có ride nào được chấp nhận.</p>
      )}

      <button
        className="history-button"
        onClick={() => setShowHistory(!showHistory)}
      >
        {showHistory ? "Ẩn lịch sử" : "Xem lịch sử các ride đã đi"}
      </button>

      {showHistory && (
        <div className="ride-history">
          <h3>Lịch sử các ride đã đi</h3>
          {historyRides.length > 0 ? (
            historyRides.map((ride) => (
              <div className="history-item" key={ride.rideId}>
                <p>
                  Ride ID: {ride.rideId} <br />
                  Ride Post ID: {ride.ridePostId} <br />
                  Thời gian bắt đầu: {new Date(ride.startTime).toLocaleString()} <br />
                  Thời gian kết thúc: {new Date(ride.endTime).toLocaleString()} <br />
                  Thời gian dự kiến: {ride.estimatedDuration} phút <br />
                  Trạng thái: {ride.status} <br />
                  An toàn: {ride.isSafe ? "Có" : "Không"}
                </p>
              </div>
            ))
          ) : (
            <p>Chưa có lịch sử ride.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default YourRide;