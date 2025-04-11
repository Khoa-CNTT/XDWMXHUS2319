import React, { useEffect } from "react";
import Header from "../components/HomeComponent/Header";
import LeftSidebar from "../components/HomeComponent/LeftSideBarHome";
import FooterHome from "../components/HomeComponent/FooterHome";
import "../styles/HomeView.scss";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { searchPost } from "../stores/action/searchAction";
import { userProfile } from "../stores/action/profileActions";
import ListUser from "../components/SearchComponent/ListUserComponent";
import ListPost from "../components/SearchComponent/ListPostComponent";

const SearchView = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const searchState = useSelector((state) => state.searchs);
  const usersState = useSelector((state) => state.users) || {};

  const { search, loading, error } = searchState;
  const { users } = usersState;

  // Extract search query from URL
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("q");

  useEffect(() => {
    if (searchQuery) {
      dispatch(userProfile());
      dispatch(searchPost(searchQuery));
    }
  }, [searchQuery, dispatch]);

  // Filter results by type
  const userResults =
    search?.data?.filter(
      (item) => item.type === "User" && typeof item.data !== "string"
    ) || [];

  const postResults =
    search?.data?.filter(
      (item) => item.type === "Post" && typeof item.data !== "string"
    ) || [];

  if (loading) {
    return <div className="loading">Đang tìm kiếm...</div>;
  }

  if (error) {
    return <div className="error">Lỗi tìm kiếm: {error.message}</div>;
  }

  return (
    <div className="home-view">
      <Header className="header" usersProfile={users} />
      <div className="main-content">
        <div className="left-sidebar">
          <LeftSidebar usersProfile={users} />
          <FooterHome className="footer" />
        </div>
        <div className="center-content">
          {/* Only show "No results" if we have finished searching */}
          {!loading && userResults.length === 0 && postResults.length === 0 ? (
            <div className="no-results">Không tìm thấy kết quả</div>
          ) : (
            <>
              <ListUser users={userResults} />
              <ListPost
                posts={postResults.map((post) => post.data)}
                usersProfile={users}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchView;
