import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import positionIcon from "../../assets/iconweb/my_locationIcon.svg";
import closeIcon from "../../assets/iconweb/closeIcon.svg";
import avatarDefault from "../../assets/AvatarDefault.png";
import "../../styles/CreateRideModal.scss";
import pingIcon from "../../assets/iconweb/location_pingIcon.svg";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SetCenterMap, SetCenterMapEnd } from "../../utils/setCenterMap";
import LocationSearch from "./LocationSreach";
// Thêm import từ Redux huy làm
import { useDispatch, useSelector } from "react-redux";
import { createPost } from "../../stores/action/ridePostAction"; // Import action
import { resetPostState } from "../../stores/reducers/ridePostReducer"; // Import reducer action
//
const CreateRidePost = ({ onClose, usersProfile }) => {
  const [selectedTime, setSelectedTime] = useState("");
  const [startLocation, setStartLocation] = useState([0, 0]);
  const [endLocation, setEndLocation] = useState([16.0497517, 108.1603569]);
  const [route, setRoute] = useState([]); // Lưu tuyến đường
  const [startAddress, setStartAddress] = useState(
    "Vị trí của bạn(Thiết bị sẽ tự động dò)"
  );
  const [isUserInteracted, setIsUserInteracted] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");
  // Thêm Redux hooks để lấy state và dispatch action huy làm
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.rides);
  //
  useEffect(() => {
    const now = new Date();
    const localISOTime = now.toISOString().slice(0, 16); // Lấy định dạng 'YYYY-MM-DDTHH:MM'
    setMinDateTime(localISOTime);
  }, []);
  // Lấy tọa độ hiện tại
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setStartLocation([lat, lng]);

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = (await response).json;
          if (data.display_name) {
            setStartAddress(data.display_name);
          } else {
            setStartAddress(`${lat}, ${lng}`);
            //setStartAddress("Vị trí của bạn đã được cập nhật!");
          }
        } catch (error) {
          console.error("Lỗi khi lấy địa chỉ:", error);
          setStartAddress(`${lat}, ${lng}`); // Hiển thị tọa độ nếu lỗi
        }
      });
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị!");
    }
  };

  // Gửi request API lấy đường đi
  const getRoute = async () => {
    try {
      const apiKey = "xin chào"; //process.env.REACT_APP_GRAPHHOPPER_API_KEY; // Thay bằng API Key của bạn
      const url = `https://graphhopper.com/api/1/route?point=${startLocation[0]},${startLocation[1]}&point=${endLocation[0]},${endLocation[1]}&profile=car&locale=vi&points_encoded=false&key=${apiKey}`;

      const response = await fetch(url);
      const data = await response.json();
      console.log("GraphHopper API Response:", data); // Debug API response

      if (data.paths && data.paths.length > 0) {
        // setRoute(data.paths[0].points.coordinates); // Lưu tuyến đường
        // console.log("Tọa độ nhận được:", coordinates); // Debug tọa độ
        toast.warning("Bạn đã request tuyến đường!");

        const coordinates = data.paths[0].points.coordinates;
        // console.log("Tọa độ nhận được:", coordinates); // Debug tọa độ

        setRoute(coordinates);
      } else {
        console.warn("Không tìm thấy tuyến đường!");
        setRoute([]); // Xóa tuyến đường cũ nếu API không trả về kết quả
      }
    } catch (error) {
      console.error("Lỗi lấy đường đi:", error);
    }
  };

  // Khi chọn điểm đến, gọi API để lấy tuyến đường
  const handleLocationChange = (event) => {
    const value = event.target.value.split(",").map(Number);
    // console.log("Tọa độ điểm đến:", value);
    setEndLocation(value);
    setIsUserInteracted(true); // Đánh dấu rằng người dùng đã chọn điểm đến
  }; //Sau sài cho Select

  const updateEndLocation = (location) => {
    // Xử lý trường hợp từ <LocationSearch>
    // console.log("Cập nhật từ LocationSearch:", location);
    setEndLocation(location);
    setIsUserInteracted(true); // Đánh dấu rằng người dùng đã chọn điểm đến
  };

  useEffect(() => {
    if (isUserInteracted && endLocation) {
      //console.log("endLocation đã cập nhật, gọi getRoute()");
      getRoute();
    }
  }, [endLocation]); // Chỉ chạy khi endLocation thay đổi và đã có tương tác của user

  // Thêm useEffect để xử lý sau khi tạo post thành công huy làm
  useEffect(() => {
    if (success) {
      toast.success("Đăng bài thành công!");
      setTimeout(() => {
        dispatch(resetPostState()); // Reset state sau khi thành công
        onClose(); // Đóng modal
      }, 2000);
    }
    if (error) {
      toast.error(error); // Hiển thị lỗi nếu có
    }
  }, [success, error, dispatch, onClose]);

  // Hàm xử lý khi nhấn nút "Đăng bài"
  const handleCreatePost = () => {
    if (!startAddress || !endLocation || !selectedTime) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Chuẩn bị dữ liệu gửi lên BE
    const postData = {
      startLocation: startAddress, // Dùng địa chỉ thay vì tọa độ
      endLocation: `${endLocation[0]}, ${endLocation[1]}`, // Chuyển tọa độ thành chuỗi
      startTime: selectedTime, // Thời gian đã chọn từ input
      postType: 0, // Giá trị mặc định theo mẫu JSON của bạn
    };

    dispatch(createPost(postData)); // Dispatch action để tạo post
  };
  //
  return (
    <>
      <div className="Create-Ride-Post-overlay" onClick={onClose}></div>
      <div className="Create-Ride-Post-Modal">
        <div className="header-create-ride">
          <span>Đăng bài</span>
          <img
            className="close-create-ride"
            src={closeIcon}
            alt="Close"
            onClick={onClose}
          />
        </div>
        <div className="user-Create-ride">
          <img
            className="Avatar-user-Create"
            src={usersProfile.profilePicture || avatarDefault}
            alt="Avatar"
          />
          <strong className="user-name-Create">
            {usersProfile.fullName || "University Sharing"}
          </strong>
        </div>
        <div className="create-ride">
          <div className="startLocation">
            <span>Điểm đi</span>
            <input
              readOnly
              value={startAddress}
              placeholder="Vị trí của bạn(Thiết bị sẽ tự động dò) "
            ></input>
            <img
              src={positionIcon}
              alt="Location"
              onClick={getCurrentLocation}
            />
          </div>
          <div className="endLocation">
            <span>Điểm đến</span>
            {/* <select onChange={handleLocationChange}>
              <option value="16.0497517,108.1603569">
                Đại Học Duy Tân - Hòa Khánh Nam
              </option>
              <option value="16.0600602,108.209513">
                Đại Học Duy Tân - Nguyễn Văn Linh
              </option>
              <option value="16.0745184,108.2226759">
                Đại Học Duy Tân - Quang Trung
              </option>
              <option value="16.0164504,108.2069124">
                Đại Học Duy Tân - Phan Văn Trị
              </option>
            </select> */}
            {/* <input placeholder="Nhập vào điểm đến!"></input> */}
            {/* <LocationSearch onSelect={setEndLocation} /> */}
            <LocationSearch onSelect={updateEndLocation} />

            <img src={pingIcon}></img>
          </div>
        </div>

        <div className="time-start">
          <label>Thời gian khởi hành:</label>
          <input
            required
            type="datetime-local"
            min={minDateTime}
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          />
        </div>

        <div className="review-map">
          <MapContainer
            center={startLocation}
            zoom={13}
            className="map-container"
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {/* Điều khiển bản đồ cập nhật vị trí */}
            <SetCenterMap center={startLocation} />

            {/* Marker điểm đi */}
            <Marker
              position={startLocation}
              icon={L.icon({ iconUrl: positionIcon, iconSize: [30, 30] })}
            />
            {/* <SetCenterMapEnd endLocation={endLocation} /> */}
            {/* Marker điểm đến */}
            <Marker
              position={endLocation}
              icon={L.icon({
                iconUrl: pingIcon, // Thay bằng icon mong muốn
                iconSize: [30, 30],
              })}
            />

            {/* Vẽ tuyến đường */}
            {route.length > 0 && (
              <Polyline
                positions={route.map((point) => [point[1], point[0]])}
                color="blue"
              />
            )}
          </MapContainer>
        </div>

        {/* Cập nhật nút "Đăng bài" để gọi handleCreatePost huy làm */}
        <button
          className="btn-create-ride"
          onClick={handleCreatePost}
          disabled={loading} // Vô hiệu hóa nút khi đang loading
        >
          {loading ? "Đang đăng..." : "Đăng bài"}
        </button>
      </div>
    </>
  );
};

export default CreateRidePost;
