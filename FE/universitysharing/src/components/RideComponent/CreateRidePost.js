import React, { useState, useEffect, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Icon } from "leaflet";
import {
  FaTimes,
  FaSearchLocation,
  FaClock,
  FaPaperPlane,
} from "react-icons/fa";
import { MdMyLocation } from "react-icons/md";
import avatarDefault from "../../assets/AvatarDefault.png";
import "../../styles/CreateRideModal.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LocationSearch from "./LocationSreach";
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../stores/action/ridePostAction";
import { resetPostState } from "../../stores/reducers/ridePostReducer";

// Custom hook để kiểm soát bản đồ
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

// Giới hạn phạm vi Đà Nẵng
const daNangBounds = L.latLngBounds(
  L.latLng(15.975, 108.05), // Tây Nam Đà Nẵng
  L.latLng(16.15, 108.35)
); // Đông Bắc Đ
const HERE_API_KEY = process.env.REACT_APP_HERE_API_KEY;

const CreateRidePost = ({ onClose, usersProfile }) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [startLocation, setStartLocation] = useState([16.054407, 108.202167]); // Trung tâm Đà Nẵng
  const [endLocation, setEndLocation] = useState(null);
  const [route, setRoute] = useState([]);
  const [startLabel, setStartLabel] = useState("Vị trí của bạn");
  const [endLabel, setEndLabel] = useState("");
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");
  const [content, setContent] = useState("");

  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.rides);

  const startIcon = new Icon({
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const endIcon = new Icon({
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    className: "destination-marker",
  });

  // Hàm để lấy thời gian hiện tại dạng ISO (YYYY-MM-DDTHH:mm)
  const getCurrentDateTime = () => {
    const now = new Date();
    // Thêm 1 phút để đảm bảo thời gian tương lai
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

  // Cập nhật minDateTime khi component mount và mỗi 30 giây
  useEffect(() => {
    setMinDateTime(getCurrentDateTime());
    const interval = setInterval(() => {
      setMinDateTime(getCurrentDateTime());
    }, 30000); // Cập nhật mỗi 30 giây
    return () => clearInterval(interval); // Dọn dẹp khi component unmount
  }, []);

  // Kiểm tra và đặt lại selectedTime nếu nó nhỏ hơn minDateTime
  useEffect(() => {
    if (selectedTime && new Date(selectedTime) < new Date(minDateTime)) {
      setSelectedTime(minDateTime);
      toast.warning("Thời gian phải ở tương lai!");
    }
  }, [minDateTime, selectedTime]);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị!");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        if (!daNangBounds.contains([lat, lng])) {
          toast.warning("Vị trí của bạn ngoài phạm vi Đà Nẵng!");
          return;
        }
        setStartLocation([lat, lng]);
        await fetchAddress(lat, lng, setStartLabel);
      },
      (error) => {
        toast.error("Không thể lấy vị trí hiện tại!");
        console.error("Lỗi định vị:", error);
      }
    );
  }, []);

  const fetchAddress = async (lat, lng, setLabel) => {
    try {
      const response = await fetch(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lng}&lang=vi&apiKey=${HERE_API_KEY}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setLabel(
          data.items[0]?.title || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        );
      } else {
        setLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error("Lỗi lấy địa chỉ:", error);
      setLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    }
  };

  const getRoute = useCallback(async () => {
    if (!startLocation || !endLocation) return;
    try {
      const url = `https://router.hereapi.com/v8/routes?transportMode=car&origin=${startLocation[0]},${startLocation[1]}&destination=${endLocation[0]},${endLocation[1]}&return=polyline&apiKey=${HERE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.routes?.[0]?.sections?.[0]?.polyline) {
        const polyline = data.routes[0].sections[0].polyline;
        const coords = decodePolyline(polyline);
        setRoute(coords);
      } else {
        toast.warning("Không tìm thấy tuyến đường!");
        setRoute([]);
      }
    } catch (error) {
      console.error("Lỗi lấy tuyến đường:", error);
      toast.error("Không thể tải tuyến đường!");
    }
  }, [startLocation, endLocation]);

  const decodePolyline = (encoded) => {
    const coords = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += deltaLat;

      shift = 0;
      result = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += deltaLng;

      coords.push([lat / 1e5, lng / 1e5]);
    }
    return coords;
  };

  const updateLocation = useCallback(
    (location, label, setLocation, setLabel, type) => {
      if (!daNangBounds.contains(location)) {
        toast.warning(`Điểm ${type} phải trong phạm vi Đà Nẵng!`);
        return;
      }
      setLocation(location);
      setLabel(label);
      setIsUserInteracted(true);
    },
    []
  );

  useEffect(() => {
    if (isUserInteracted && startLocation && endLocation) {
      getRoute();
    }
  }, [startLocation, endLocation, isUserInteracted, getRoute]);

  useEffect(() => {
    if (success) {
      toast.success("Đăng bài thành công!");
      setTimeout(() => {
        dispatch(resetPostState());
        onClose();
      }, 2000);
    } else if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch, onClose]);

  const handleCreatePost = () => {
    if (!startLocation || !endLocation || !selectedTime) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }
    if (new Date(selectedTime) <= new Date()) {
      toast.error("Thời gian khởi hành phải ở tương lai!");
      return;
    }
    const postData = {
      content: content || null,
      startLocation: `${startLocation[0]},${startLocation[1]}`,
      endLocation: `${endLocation[0]},${endLocation[1]}`,
      startTime: selectedTime,
      postType: 0,
    };
    dispatch(createPost(postData));
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-content">
            <h2>Chia sẻ chuyến đi</h2>
            <p>Tìm người đi chung dễ dàng</p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="user-section">
          <div className="user-avatar">
            <img
              src={usersProfile.profilePicture || avatarDefault}
              alt="Avatar"
            />
          </div>
          <div className="user-info">
            <span className="user-name">
              {usersProfile.fullName || "Người dùng"}
            </span>
            <span className="post-time">Bây giờ</span>
          </div>
        </div>

        <div className="form-content">
          <div className="form-group">
            <div className="floating-textarea">
              <textarea
                rows="4"
                maxLength="200"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="input-field"
              />
              <label htmlFor="post-content">Nội dung bài viết</label>
              <span className="char-counter">{content.length}/200</span>
            </div>
          </div>

          <div className="location-group">
            <div className="form-group">
              <div className="floating-input with-icon">
                <LocationSearch
                  onSelect={(location, label) =>
                    updateLocation(
                      location,
                      label,
                      setStartLocation,
                      setStartLabel,
                      "đi"
                    )
                  }
                  bounds={daNangBounds}
                  placeholder="Nhập điểm đi"
                  value={startLabel}
                />
                <button className="input-action" onClick={getCurrentLocation}>
                  <MdMyLocation />
                </button>
              </div>
            </div>

            <div className="form-group">
              <div className="floating-input with-icon">
                <LocationSearch
                  onSelect={(location, label) =>
                    updateLocation(
                      location,
                      label,
                      setEndLocation,
                      setEndLabel,
                      "đến"
                    )
                  }
                  bounds={daNangBounds}
                  placeholder="Nhập điểm đến"
                  value={endLabel}
                />
                <span className="input-action">
                  <FaSearchLocation />
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="floating-input">
              <input
                type="datetime-local"
                min={minDateTime}
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                required
                className="input-field"
              />
              <label htmlFor="start-time">
                <FaClock className="icon" /> Thời gian khởi hành
              </label>
            </div>
          </div>
        </div>

        <div className="map-preview">
          <MapContainer
            center={startLocation}
            zoom={13}
            className="map-view"
            maxBounds={daNangBounds}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapControl
              center={startLocation || endLocation}
              bounds={daNangBounds}
            />

            <Marker position={startLocation} icon={startIcon}>
              <Popup>Điểm đi: {startLabel}</Popup>
            </Marker>

            {endLocation && (
              <Marker position={endLocation} icon={endIcon}>
                <Popup>Điểm đến: {endLabel}</Popup>
              </Marker>
            )}

            {route.length > 0 && (
              <Polyline
                positions={route}
                color="var(--primary-color)"
                weight={4}
              />
            )}
          </MapContainer>
        </div>

        <button
          className="submit-btn"
          onClick={handleCreatePost}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner"></span> Đang đăng...
            </>
          ) : (
            <>
              <FaPaperPlane className="icon" /> Đăng bài
            </>
          )}
        </button>
      </div>
    </>
  );
};

const MapControl = ({ center, bounds }) => {
  useMapControl(center, bounds);
  return null;
};

export default CreateRidePost;
