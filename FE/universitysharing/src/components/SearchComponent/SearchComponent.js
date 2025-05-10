import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { searchPost } from "../../stores/action/searchAction";
import "../../styles/headerHome.scss";
import Spinner from "../../utils/Spinner";
import searchIcon from "../../assets/iconweb/searchIcon.svg";
import ListUser from "./ListUserComponent";
import ListPost from "./ListPostComponent";
import { useNavigate } from "react-router-dom";

const SearchComponent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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
    }, 500);

    return () => clearTimeout(timer);
  }, [keyword, dispatch]);

  // Tách dữ liệu thành users và posts
  const users = search?.data?.filter((item) => item.type === "User") || [];
  const posts = search?.data?.filter((item) => item.type === "Post") || [];

  // Xử lý khi nhấp vào bài viết
  const handlePostClick = (postId) => {
    navigate(`/post/${postId}`);
    setShowResults(false);
    setKeyword("");
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
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
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
          ) : search?.data?.length > 0 ? (
            <>
              {/* Hiển thị danh sách người dùng */}
              {users.length > 0 && (
                <div className="search-users">
                  <ListUser users={users} />
                </div>
              )}

              {/* Hiển thị danh sách bài viết */}
              {posts.length > 0 && (
                <div className="search-posts">
                  <h3 className="search-posts-title">Bài viết</h3>
                  <ListPost
                    posts={posts.map((item) => ({
                      ...item.data,
                      onClick: () => handlePostClick(item.data.id),
                    }))}
                    usersProfile={users.reduce((acc, user) => {
                      acc[user.data.id] = user.data;
                      return acc;
                    }, {})}
                  />
                </div>
              )}
            </>
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
