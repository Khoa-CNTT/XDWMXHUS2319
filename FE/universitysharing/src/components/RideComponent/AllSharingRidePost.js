import React, { useState, useEffect } from "react";
import "../../styles/AllSharingCar.scss";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
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
import { fetchRidePost } from "../../stores/action/ridePostAction";

const defaultIcon = L.icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const AllSharingRide = () => {
  const [showMap, setShowMap] = useState(false);
  const [routePath, setRoutePath] = useState([]);

  const startPosition = [10.7769, 106.7009]; // Điểm đi (TP.HCM)
  const endPosition = [10.762622, 106.660172]; // Điểm đến (Ví dụ: Quận 1, TP.HCM)

  //Gọi data ride post
  const dispatch = useDispatch();
  const { ridePosts } = useSelector((state) => state.rides);
  useEffect(() => {
    dispatch(fetchRidePost());
  }, [dispatch]);
  //Gọi data ride post

  useEffect(() => {
    if (showMap && routePath.length === 0) {
      fetchRoute();
    }
  }, [showMap]);

  const fetchRoute = async () => {
    const apiKey = process.env.REACT_APP_GRAPHHOPPER_API_KEY; // Thay thế bằng API Key của bạn
    const url = `https://graphhopper.com/api/1/route?point=${startPosition[0]},${startPosition[1]}&point=${endPosition[0]},${endPosition[1]}&vehicle=car&locale=vi&key=${apiKey}&points_encoded=false`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.paths && data.paths.length > 0) {
        const coordinates = data.paths[0].points.coordinates;
        const formattedRoute = coordinates.map((coord) => [coord[1], coord[0]]); // Chuyển đổi toạ độ
        setRoutePath(formattedRoute);
        toast.warning("Bạn đã request bản đồ ");
      }
    } catch (error) {
      console.error("Error fetching route from GraphHopper:", error);
    }
  };

  return (
    <>
      {Array.isArray(ridePosts) && ridePosts.length > 0 ? (
        ridePosts.map((ridePost) => (
          <div className="All-ride-post">
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
                  center={ridePost.StartLocation}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={ridePost.StartLocation} icon={defaultIcon}>
                    <Popup>Điểm đi</Popup>
                  </Marker>
                  <Marker position={ridePost.EndLocation} icon={defaultIcon}>
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
              <div
                className="see-ride-map"
                onClick={() => setShowMap(!showMap)}
              >
                <img src={seeMapIcon} className="see-map" alt="See map" />
                <span className="see">{showMap ? "Ẩn map" : "Xem map"}</span>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p>Không có bài viết nào.</p>
      )}
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
    </>
  );
};

export default AllSharingRide;
