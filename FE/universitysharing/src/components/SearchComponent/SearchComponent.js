import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchPost } from "../../stores/action/searchAction";
import "../../styles/headerHome.scss";
import Spinner from "../../utils/Spinner";
import searchIcon from "../../assets/iconweb/searchIcon.svg";

const SearchComponent = () => {
  const dispatch = useDispatch();
  const { search, loading } = useSelector((state) => state.searchs);
  const [keyword, setKeyword] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (keyword.trim()) {
        dispatch(searchPost(keyword));
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [keyword, dispatch]);

  const handleResultClick = (item) => {
    // Xử lý khi click vào kết quả (tuỳ thuộc vào loại kết quả)
    console.log("Selected item:", item);
    setShowResults(false);
  };

  return (
    <div className="search-container">
      <div className="search">
        <input
          type="text"
          placeholder="Tìm kiếm bài viết, người dùng..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onFocus={() => keyword && setShowResults(true)}
        />
        <img
          src={searchIcon}
          alt="Search"
          onClick={() => keyword && dispatch(searchPost(keyword))}
        />
      </div>

      {showResults && (
        <div className="search-results">
          {loading ? (
            <div className="search-loading">
              <Spinner size={20} />
            </div>
          ) : search?.length > 0 ? (
            search.map((item) => (
              <div
                key={item.id}
                className="result-item"
                onClick={() => handleResultClick(item)}
              >
                {item.type === "User" ? (
                  <>
                    <img
                      src={item.profilePicture || "/default-avatar.png"}
                      alt={item.fullName}
                      className="result-avatar"
                    />
                    <div className="result-info">
                      <h4>{item.fullName}</h4>
                      <p>Người dùng</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="result-info">
                      <h4>{item.fullName}</h4>
                      <p className="post-content">{item.content}</p>
                      <p>Bài viết</p>
                    </div>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="no-results">
              {keyword ? "Không tìm thấy kết quả" : "Nhập từ khóa để tìm kiếm"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;
