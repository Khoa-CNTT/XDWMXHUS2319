import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  sendFriendRequest,
  cancelFriendRequest,
  fetchSentFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from "../../stores/action/friendAction";
import { FaUserPlus, FaUserCheck, FaUserClock } from "react-icons/fa";
import { BsThreeDots, BsChevronDown } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import EditProfileModal from "./EditProfileModal";
import { userProfileDetail } from "../../stores/action/profileActions";
import getUserIdFromToken from "../../utils/JwtDecode";
import "../../styles/ProfileUserView/ProfileHeader.scss";
import "../../styles/MoblieReponsive/ProfileFriendMobile/ProfileHeaderMobile.scss";
import avatarDefaut from "../../assets/AvatarDefaultFill.png";
import logoWeb from "../../assets/Logo.png";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import {
  fetchFriendsByUserId,
  fetchListFriend,
  fetchListFriendReceive,
} from "../../stores/action/friendAction";

const ProfileFriendHeader = forwardRef((props, ref) => {
  const {
    shouldFocusBio,
    onModalOpened,
    isFriendProfile = false,
    userData = null,
  } = props;

  const userId = getUserIdFromToken();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFriendOptions, setShowFriendOptions] = useState(false);
  const [friendStatus, setFriendStatus] = useState({
    isFriend: false,
    hasFriendRequest: false,
    isRequestSent: false,
  });
  const [isLoading, setIsLoading] = useState({
    action: false,
    initialLoad: true,
  });

  // Selectors
  const friendsData = useSelector((state) => state.friends.listFriends);
  const friendUserOtherData = useSelector(
    (state) => state.friends.listFriendsByUser
  );
  const friendRequests = useSelector(
    (state) => state.friends.listFriendReceived || []
  );
  const sentRequests = useSelector((state) => state.friends.sentFriendRequests);

  // Hàm delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Hàm xử lý gửi lời mời kết bạn
  const handleAddFriend = useCallback(async () => {
    if (!userData?.id || isLoading.action) return;

    setIsLoading((prev) => ({ ...prev, action: true }));
    try {
      await dispatch(sendFriendRequest(userData.id)).unwrap();
      toast.success("Đã gửi lời mời kết bạn");

      // Cập nhật ngay lập tức UI
      setFriendStatus((prev) => ({
        ...prev,
        isRequestSent: true,
        hasFriendRequest: false,
      }));

      // Thêm delay 5 giây
      await delay(5000);

      // Fetch lại danh sách
      await Promise.all([
        dispatch(fetchListFriendReceive()),
        dispatch(fetchSentFriendRequests()),
      ]);
    } catch (error) {
      toast.error(error || "Gửi lời mời thất bại");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  }, [userData?.id, dispatch, isLoading.action]);

  // Hàm xử lý hủy lời mời kết bạn
  const handleCancelRequest = useCallback(async () => {
    if (!userData?.id || isLoading.action) return;

    setIsLoading((prev) => ({ ...prev, action: true }));
    try {
      await dispatch(cancelFriendRequest(userData.id)).unwrap();
      toast.success("Đã hủy lời mời kết bạn");

      // Cập nhật ngay lập tức UI
      setFriendStatus((prev) => ({
        ...prev,
        isRequestSent: false,
        hasFriendRequest: false,
      }));

      // Thêm delay 5 giây
      await delay(5000);

      // Fetch lại danh sách
      await Promise.all([
        dispatch(fetchListFriendReceive()),
        dispatch(fetchSentFriendRequests()),
      ]);
    } catch (error) {
      toast.error(error || "Hủy lời mời thất bại");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  }, [userData?.id, dispatch, isLoading.action]);

  // Hàm xử lý chấp nhận lời mời
  const handleAcceptRequest = useCallback(async () => {
    if (!userData?.id || isLoading.action) return;

    setIsLoading((prev) => ({ ...prev, action: true }));
    try {
      await dispatch(acceptFriendRequest(userData.id)).unwrap();
      toast.success("Đã chấp nhận lời mời kết bạn");

      // Cập nhật trạng thái ngay lập tức
      setFriendStatus({
        isFriend: true,
        hasFriendRequest: false,
        isRequestSent: false,
      });

      // Fetch lại danh sách bạn bè
      await Promise.all([
        dispatch(fetchListFriend()),
        dispatch(fetchListFriendReceive()),
        dispatch(fetchSentFriendRequests()),
      ]);
    } catch (error) {
      toast.error(error || "Chấp nhận lời mời thất bại");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  }, [userData?.id, dispatch, isLoading.action]);

  // Hàm xử lý từ chối lời mời
  const handleRejectRequest = useCallback(async () => {
    if (!userData?.id || isLoading.action) return;

    setIsLoading((prev) => ({ ...prev, action: true }));
    try {
      await dispatch(rejectFriendRequest(userData.id)).unwrap();
      toast.success("Đã từ chối lời mời kết bạn");

      // Cập nhật trạng thái ngay lập tức
      setFriendStatus({
        isFriend: false,
        hasFriendRequest: false,
        isRequestSent: false,
      });

      // Fetch lại danh sách
      await Promise.all([
        dispatch(fetchListFriendReceive()),
        dispatch(fetchSentFriendRequests()),
      ]);
    } catch (error) {
      toast.error(error || "Từ chối lời mời thất bại");
    } finally {
      setIsLoading((prev) => ({ ...prev, action: false }));
    }
  }, [userData?.id, dispatch, isLoading.action]);

  // Hàm xử lý hủy kết bạn với xác nhận
  const handleCancelFriendRequest = useCallback(async () => {
    if (!userData?.id || isLoading.action) return;

    confirmAlert({
      title: "Xác nhận hủy kết bạn",
      message: `Bạn có chắc chắn muốn hủy kết bạn với ${
        userData?.fullName || "người này"
      }?`,
      buttons: [
        {
          label: "Xác nhận",
          onClick: async () => {
            setIsLoading((prev) => ({ ...prev, action: true }));
            try {
              // Thực hiện hủy kết bạn
              const result = await dispatch(removeFriend(userData.id));

              if (result.error) {
                throw new Error(result.error.message || "Hủy kết bạn thất bại");
              }

              // Hiển thị toast thành công
              toast.success("Đã hủy kết bạn thành công", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });

              // Cập nhật UI ngay lập tức
              setFriendStatus({
                isFriend: false,
                hasFriendRequest: false,
                isRequestSent: false,
              });

              // Đóng dropdown options
              setShowFriendOptions(false);

              // Fetch lại dữ liệu trong background
              dispatch(fetchListFriend()).catch(console.error);
              dispatch(fetchFriendsByUserId(userData.id)).catch(console.error);
            } catch (error) {
              toast.error(error.message || "Hủy kết bạn thất bại", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            } finally {
              setIsLoading((prev) => ({ ...prev, action: false }));
            }
          },
        },
        {
          label: "Hủy",
          onClick: () => setShowFriendOptions(false),
        },
      ],
      closeOnEscape: true,
      closeOnClickOutside: true,
      afterClose: () => setShowFriendOptions(false),
    });
  }, [userData, dispatch, isLoading.action]);

  // Kiểm tra trạng thái kết bạn
  useEffect(() => {
    if (!userData?.id) return;

    const isAlreadyFriend = friendsData?.friends?.some(
      (friend) => friend.friendId === userData.id
    );
    const hasPendingRequest = friendRequests.some(
      (request) => request.friendId === userData.id
    );
    const hasSentRequest = sentRequests.some(
      (request) => request.friendId === userData.id
    );

    setFriendStatus({
      isFriend: isAlreadyFriend,
      hasFriendRequest: hasPendingRequest,
      isRequestSent: hasSentRequest,
    });
  }, [userData?.id, friendsData, friendRequests, sentRequests]);

  // Load dữ liệu ban đầu
  useEffect(() => {
    const abortController = new AbortController();

    const loadInitialData = async () => {
      try {
        await Promise.all([
          dispatch(fetchListFriendReceive()),
          dispatch(fetchSentFriendRequests()),
          dispatch(fetchListFriend()),
          dispatch(userProfileDetail()),
        ]);

        if (userData?.id) {
          await dispatch(fetchFriendsByUserId(userData.id));
        }
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error("Failed to load initial data:", error);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading((prev) => ({ ...prev, initialLoad: false }));
        }
      }
    };

    loadInitialData();

    return () => {
      abortController.abort();
    };
  }, [dispatch, userData?.id]);

  // Cho phép component cha gọi hàm mở modal
  useImperativeHandle(ref, () => ({
    openModal: () => setIsModalOpen(true),
  }));

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  if (isLoading.initialLoad) {
    return <div className="profile-header loading">Loading...</div>;
  }

  return (
    <div className="profile-header">
      <div className="profile-header__background">
        <img
          src={userData?.backgroundPicture || logoWeb}
          alt="Background"
          className="profile-header__background-image"
        />
      </div>
      <div className="profile-header__container">
        <div className="profile-header__info">
          <img
            src={userData?.profilePicture || avatarDefaut}
            alt="Avatar"
            className="profile-header__avatar"
          />
          <div className="profile-header__details">
            <h1 className="profile-header__name">
              {userData?.fullName || "Chưa có thông tin."}
            </h1>
            <p className="profile-header__stats">
              {friendUserOtherData?.countFriend || 0} bạn bè
            </p>
            <span className="profile-header__trust">
              Điểm uy tín: {userData?.trustPoints || 0}
            </span>
          </div>

          {friendStatus.hasFriendRequest ? (
            <>
              <button
                className="profile-header__accept-button"
                onClick={handleAcceptRequest}
                disabled={isLoading.action}
              >
                {isLoading.action ? (
                  "Đang xử lý..."
                ) : (
                  <>
                    <FaUserCheck style={{ marginRight: "8px" }} />
                    Chấp nhận
                  </>
                )}
              </button>
              <button
                className="profile-header__reject-button"
                onClick={handleRejectRequest}
                disabled={isLoading.action}
              >
                {isLoading.action ? "Đang xử lý..." : "Xóa lời mời"}
              </button>
            </>
          ) : friendStatus.isFriend ? (
            <div className="profile-header__friend-actions">
              <button
                className="profile-header__friend-button"
                onClick={() => setShowFriendOptions(!showFriendOptions)}
              >
                <FaUserCheck style={{ marginRight: "8px" }} />
                Bạn bè
                <BsChevronDown
                  style={{
                    marginLeft: "8px",
                    transform: showFriendOptions
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                />
              </button>
              {showFriendOptions && (
                <div className="friend-options-dropdown">
                  <button
                    className="friend-option-item cancel-friend"
                    onClick={handleCancelFriendRequest}
                    disabled={isLoading.action}
                  >
                    {isLoading.action ? "Đang xử lý..." : "Hủy kết bạn"}
                  </button>
                </div>
              )}
            </div>
          ) : friendStatus.isRequestSent ? (
            <button
              className="profile-header__cancel-request-button"
              onClick={handleCancelRequest}
              disabled={isLoading.action}
            >
              {isLoading.action ? (
                "Đang xử lý..."
              ) : (
                <>
                  <FaUserClock style={{ marginRight: "8px" }} />
                  Hủy lời mời
                </>
              )}
            </button>
          ) : (
            <button
              className="profile-header__addfriend-button"
              onClick={handleAddFriend}
              disabled={isLoading.action}
            >
              {isLoading.action ? (
                "Đang xử lý..."
              ) : (
                <>
                  <FaUserPlus style={{ marginRight: "8px" }} />
                  Thêm bạn bè
                </>
              )}
            </button>
          )}

          <button className="profile-header__option-button">
            <BsThreeDots />
          </button>
        </div>
      </div>
      <EditProfileModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shouldFocusBio={shouldFocusBio}
        onModalOpened={onModalOpened}
      />
    </div>
  );
});

export default ProfileFriendHeader;
