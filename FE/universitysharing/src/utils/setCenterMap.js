import { useMap } from "react-leaflet";

const SetCenterMap = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom()); // Cập nhật trung tâm bản đồ
  return null;
};
const SetCenterMapEnd = ({ endLocation }) => {
  const map = useMap();
  map.setView(endLocation, 30); // Cập nhật trung tâm bản đồ
  return null;
};

export { SetCenterMap, SetCenterMapEnd };
