import { useState, useCallback } from "react";
import Select from "react-select";
import debounce from "lodash.debounce";

const LocationSearch = ({ onSelect }) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocations = async (query) => {
    if (!query) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://photon.komoot.io/api/?q=${query}`);
      const data = await response.json();

      console.log("Dữ liệu API Photon trả về:", data); // ✅ Kiểm tra toàn bộ dữ liệu trả về

      setOptions(
        data.features.map((place) => {
          const name = place.properties.name || "";
          const street = place.properties.street || "";
          const city = place.properties.city || "";
          const province = place.properties.state || "";
          // Tạo mảng chứa các phần tử có thể hiển thị, lọc bỏ các giá trị rỗng
          const labelParts = [name, street, city, province].filter(Boolean);

          return {
            label: labelParts.join(", "), // ✅ Hiển thị đầy đủ thông tin
            value: place.geometry.coordinates
              ? [place.geometry.coordinates[1], place.geometry.coordinates[0]]
              : [0, 0], // ✅ Đảm bảo có tọa độ hợp lệ
          };
        })
      );
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý địa điểm:", error);
    }
    setIsLoading(false);
  };

  // Tạo debounce function
  const debouncedFetch = useCallback(
    debounce((query) => fetchLocations(query), 300),
    []
  );

  return (
    <Select
      className="search-location"
      options={options}
      isLoading={isLoading}
      onInputChange={(value, { action }) => {
        if (
          action === "input-change" &&
          typeof value === "string" &&
          value.trim() !== ""
        ) {
          debouncedFetch(value);
        }
      }}
      onChange={(selectedOption) => onSelect(selectedOption.value)}
      placeholder="Nhập vào điểm đến!"
      noOptionsMessage={() => "Không có kết quả"}
    />
  );
};

export default LocationSearch;
