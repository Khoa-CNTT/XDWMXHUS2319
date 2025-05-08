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
import { updatePost } from "../../stores/action/ridePostAction";
import { resetPostState } from "../../stores/reducers/ridePostReducer";

// Custom hook to control map
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

// Da Nang bounds
const daNangBounds = L.latLngBounds(
  L.latLng(15.975, 108.05), // Southwest Da Nang
  L.latLng(16.15, 108.35) // Northeast Da Nang
);

const HERE_API_KEY = process.env.REACT_APP_HERE_API_KEY;

const UpdateRidePost = ({ onClose, usersProfile, ridePost }) => {
  const [selectedTime, setSelectedTime] = useState(ridePost.startTime || "");
  const [startLocation, setStartLocation] = useState(
    ridePost.startLocation
      ? ridePost.startLocation.split(",").map(Number)
      : [16.054407, 108.202167] // Default: Da Nang center
  );
  const [endLocation, setEndLocation] = useState(
    ridePost.endLocation ? ridePost.endLocation.split(",").map(Number) : null
  );
  const [route, setRoute] = useState([]);
  const [startLabel, setStartLabel] = useState(
    ridePost.startLabel || "Vị trí của bạn"
  );
  const [endLabel, setEndLabel] = useState(ridePost.endLabel || "");
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");
  const [content, setContent] = useState(ridePost.content || "");
  const [isFetchingCoordinates, setIsFetchingCoordinates] = useState(false);

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

  useEffect(() => {
    const now = new Date();
    const localISOTime = new Date(now.getTime() + 7 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 16);
    setMinDateTime(localISOTime);
  }, []);

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

  const fetchCoordinates = async (query, setLocation, setLabel) => {
    try {
      const response = await fetch(
        `https://geocode.search.hereapi.com/v1/geocode?q=${encodeURIComponent(
          query
        )}&lang=vi&apiKey=${HERE_API_KEY}`
      );
      const data = await response.json();
      if (data.items && data.items.length > 0) {
        const { lat, lng } = data.items[0].position;
        if (daNangBounds.contains([lat, lng])) {
          setLocation([lat, lng]);
          setLabel(
            data.items[0]?.title || `${lat.toFixed(6)},${lng.toFixed(6)}`
          );
          return true;
        }
      }
      toast.warning("Địa điểm không nằm trong phạm vi Đà Nẵng!");
      return false;
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      toast.error("Không thể lấy tọa độ!");
      return false;
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

  const handleStartLabelChange = async (e) => {
    const newLabel = e.target.value;
    setStartLabel(newLabel);
    if (newLabel) {
      const valid = await fetchCoordinates(
        newLabel,
        setStartLocation,
        setStartLabel
      );
      if (valid) setIsUserInteracted(true);
    } else {
      setStartLocation([16.054407, 108.202167]);
      setIsUserInteracted(false);
    }
  };

  const handleEndLabelChange = async (e) => {
    const newLabel = e.target.value;
    setEndLabel(newLabel);
    if (newLabel) {
      const valid = await fetchCoordinates(
        newLabel,
        setEndLocation,
        setEndLabel
      );
      if (valid) setIsUserInteracted(true);
    } else {
      setEndLocation(null);
      setIsUserInteracted(false);
    }
  };

  useEffect(() => {
    if (isUserInteracted && startLocation && endLocation) {
      getRoute();
    }
  }, [startLocation, endLocation, isUserInteracted, getRoute]);

  useEffect(() => {
    if (success) {
      if (error && error.includes("No changes needed")) {
        toast.info("Không có thay đổi nào được thực hiện!");
      } else {
        toast.success("Cập nhật bài đăng thành công!");
      }
      setTimeout(() => {
        dispatch(resetPostState());
        onClose();
      }, 2000);
    } else if (error && !success) {
      toast.error(`${error}`);
    }
  }, [success, error, dispatch, onClose]);

  const handleUpdatePost = async () => {
    if (!ridePost?.id) {
      toast.error("ID bài đăng không hợp lệ!");
      return;
    }
    if (!startLabel || !endLabel || !selectedTime) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsFetchingCoordinates(true);
    let finalStartLocation = startLocation;
    let finalEndLocation = endLocation;

    try {
      // Validate or fetch start location coordinates
      if (
        !startLocation ||
        startLocation.join(",") === "16.054407,108.202167"
      ) {
        const valid = await fetchCoordinates(
          startLabel,
          setStartLocation,
          setStartLabel
        );
        if (!valid) {
          toast.error("Điểm đi không hợp lệ hoặc ngoài phạm vi Đà Nẵng!");
          return;
        }
        finalStartLocation = startLocation;
      }

      // Validate or fetch end location coordinates
      if (!endLocation) {
        const valid = await fetchCoordinates(
          endLabel,
          setEndLocation,
          setEndLabel
        );
        if (!valid) {
          toast.error("Điểm đến không hợp lệ hoặc ngoài phạm vi Đà Nẵng!");
          return;
        }
        finalEndLocation = endLocation;
      }

      // Validate and format startTime
      let formattedStartTime = selectedTime;
      if (selectedTime) {
        const date = new Date(selectedTime);
        if (!isNaN(date.getTime())) {
          formattedStartTime = date.toISOString();
        } else {
          toast.error("Thời gian khởi hành không hợp lệ!");
          return;
        }
      }

      // Ensure coordinates are in the correct format
      const startLocationStr = finalStartLocation
        ? `${finalStartLocation[0].toFixed(6)},${finalStartLocation[1].toFixed(
            6
          )}`
        : null;
      const endLocationStr = finalEndLocation
        ? `${finalEndLocation[0].toFixed(6)},${finalEndLocation[1].toFixed(6)}`
        : null;

      // Only include fields that have changed or are provided
      const postData = {
        id: ridePost.id,
        content: content.trim() || null,
        startLocation: startLocationStr,
        endLocation: endLocationStr,
        startTime: formattedStartTime,
      };

      // Remove null or unchanged fields to avoid "No fields provided" error
      Object.keys(postData).forEach(
        (key) => postData[key] === null && delete postData[key]
      );

      console.log("Dispatching updatePost with payload:", postData);
      dispatch(updatePost(postData));
    } catch (error) {
      console.error("Error in handleUpdatePost:", error);
    } finally {
      setIsFetchingCoordinates(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-container">
        <div className="modal-header">
          <div className="header-content">
            <h2>Cập nhật chuyến đi</h2>
            <p>Chỉnh sửa thông tin chuyến đi của bạn</p>
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
                  onChange={handleStartLabelChange}
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
                  onChange={handleEndLabelChange}
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
          onClick={handleUpdatePost}
          disabled={loading || isFetchingCoordinates}
        >
          {loading || isFetchingCoordinates ? (
            <>
              <span className="spinner"></span> Đang cập nhật...
            </>
          ) : (
            <>
              <FaPaperPlane className="icon" /> Cập nhật bài đăng
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

export default UpdateRidePost;
