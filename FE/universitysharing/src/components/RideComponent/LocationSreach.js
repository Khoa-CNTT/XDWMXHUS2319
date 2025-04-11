import { useState, useCallback } from "react";
import Select from "react-select";
import debounce from "lodash.debounce";
import "../../styles/SearchView/LocationSearch.scss";

const HERE_API_KEY = process.env.REACT_APP_HERE_API_KEY;

const LocationSearch = ({ onSelect, bounds, placeholder, value }) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const fetchLocations = async (query) => {
    if (!query || query.trim() === "") {
      setOptions([]);
      return;
    }

    setIsLoading(true);
    try {
      const url = `https://autosuggest.search.hereapi.com/v1/autosuggest?q=${encodeURIComponent(query)}&lang=vi&in=bbox:108.05,15.975,108.35,16.15&limit=10&apiKey=${HERE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      const filteredOptions = data.items
        ? data.items
            .filter((item) => {
              if (!item.position) return false;
              const { lat, lng } = item.position;
              return bounds.contains([lat, lng]);
            })
            .map((item) => ({
              label: item.title,
              value: [item.position.lat, item.position.lng],
            }))
        : [];

      setOptions(filteredOptions);
    } catch (error) {
      console.error("Lỗi khi lấy gợi ý địa điểm từ HERE Maps:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetch = useCallback(debounce(fetchLocations, 500), []);

  const handleInputChange = (newValue, actionMeta) => {
    setInputValue(newValue);
    if (actionMeta.action === "input-change") {
      debouncedFetch(newValue);
    }
  };

  return (
    <Select
      className={`search-location ${inputValue ? "search-location--has-value" : ""}`}
      classNamePrefix="react-select"
      options={options}
      isLoading={isLoading}
      onInputChange={handleInputChange}
      onChange={(selectedOption) => {
        if (selectedOption) {
          onSelect(selectedOption.value, selectedOption.label); // Truyền cả tọa độ và tên
          setInputValue(selectedOption.label);
        }
      }}
      placeholder={placeholder}
      noOptionsMessage={() => "Không tìm thấy địa điểm trong Đà Nẵng"}
      value={value ? { label: value, value: value } : null}
      inputValue={inputValue}
    />
  );
};

export default LocationSearch;