import { useState } from 'react';
import './ConfirmationModal.scss';

const paramDisplayMap = {
  '/api/Post/create': {
    Content: 'Nội dung bài đăng',
    Images: 'Hình ảnh kèm theo',
    Video: 'Video kèm theo',
    Scope: 'Phạm vi bài đăng',
  },
  '/api/Post/update-post': {
    PostId: 'ID bài đăng',
    Content: 'Nội dung bài đăng',
    Images: 'Hình ảnh kèm theo',
    Video: 'Video kèm theo',
    Scope: 'Phạm vi bài đăng',
  },
  '/api/Ride/create': {
    DriverId: 'ID Tài xế',
    RidePostId: 'ID bài đăng',
    IsSafetyTrackingEnabled: 'Chế độ an toàn',
  },
  '/api/Comment/CommentPost': {
    PostId: 'ID bài đăng',
    Content: 'Nội dung bình luận',
  },
  '/api/Comment/ReplyComment': {
    PostId: 'ID bài đăng',
    ParentCommentId: 'ID bình luận cha',
    Content: 'Nội dung trả lời',
  },
  '/api/Like/like': {
    PostId: 'ID bài đăng',
  },
  '/api/CommentLike/like': {
    CommentId: 'ID bình luận',
  },
  '/api/FriendShip/send-friend-request': {
    FriendId: 'ID bạn bè',
  },
  '/api/Share/SharePost': {
    PostId: 'ID bài đăng',
    Content: 'Nội dung chia sẻ',
  },
  '/api/UserProfile/upProfile': {
    FullName: 'Họ và tên',
    ProfileImage: 'Ảnh đại diện',
    BackgroundImage: 'Ảnh bìa',
    Bio: 'Tiểu sử',
    PhoneNumber: 'Số điện thoại',
    PhoneRelativeNumber: 'Số điện thoại người thân',
  },
  '/api/UserProfile/upInformation': {
    PhoneNumber: 'Số điện thoại',
    PhoneRelativeNumber: 'Số điện thoại người thân',
    Gender: 'Giới tính',
  },
};

const genderOptions = [
  { value: 'Male', label: 'Nam' },
  { value: 'Female', label: 'Nữ' },
  { value: 'Other', label: 'Khác' },
];

const isSafeOptions = [
  { value: true, label: 'Đồng ý' },
  { value: false, label: 'Không đồng ý' },
];

const ConfirmationModal = ({ results, streamId, onConfirm, onEdit, onCancel, conversationId, isEditing }) => {
  const firstResult = results[0] || {};
  const { endpoint, params: rawParams, redis_key } = firstResult;

  const [params, setParams] = useState(() => {
    if (!rawParams) return [{}];
    if (Array.isArray(rawParams)) {
      if (rawParams.length === 0) return [{}];
      return [
        rawParams.reduce((acc, item) => {
          if (item && typeof item === 'object') {
            Object.entries(item).forEach(([key, value]) => {
              acc[key] = value === 'null' || value === undefined ? null : value;
            });
          }
          return acc;
        }, {})
      ];
    }
    if (typeof rawParams === 'object' && rawParams !== null) {
      return [
        Object.entries(rawParams).reduce((acc, [key, value]) => {
          acc[key] = value === 'null' || value === undefined ? null : value;
          return acc;
        }, {})
      ];
    }
    console.warn('Invalid rawParams format:', rawParams);
    return [{}];
  });

  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);
  const [newProfileImage, setNewProfileImage] = useState(null);
  const [newBackgroundImage, setNewBackgroundImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái isLoading

  const displayMap = paramDisplayMap[endpoint.replace('https://localhost:7053', '')] || {};

  const handleConfirm = async () => {
    setIsLoading(true); // Bật trạng thái loading
    let updatedParams;
    if (endpoint.includes('/api/Ride/create')) {
      updatedParams = {
        driverId: params[0].DriverId || null,
        ridePostId: params[0].RidePostId || null,
        estimatedDuration: params[0].EstimatedDuration || 0,
        IsSafetyTrackingEnabled: params[0].IsSafetyTrackingEnabled || false,
        fare: params[0].Fare || null,
      };

      if (!updatedParams.driverId || !updatedParams.ridePostId) {
        console.error('Missing required fields:', updatedParams);
        alert('Vui lòng cung cấp đầy đủ thông tin chuyến đi (ID tài xế và ID bài đăng).');
        setIsLoading(false); // Tắt loading nếu có lỗi
        return;
      }
    } else {
      updatedParams = {
        ...params[0],
        Images: endpoint.includes('/Post/') ? (newImages.length > 0 ? newImages : null) : params[0].Images,
        Video: endpoint.includes('/Post/') ? newVideo : params[0].Video,
        ProfileImage: endpoint.includes('/UserProfile/') ? newProfileImage : params[0].ProfileImage,
        BackgroundImage: endpoint.includes('/UserProfile/') ? newBackgroundImage : params[0].BackgroundImage,
      };
    }

    console.log('[ConfirmationModal] Sending updatedParams:', JSON.stringify(updatedParams, null, 2));
    await onConfirm(endpoint, updatedParams, redis_key, streamId, setIsLoading); // Truyền setIsLoading
    // setIsLoading sẽ được tắt trong handleModalConfirm
  };

  const handleEdit = () => {
    if (!isLoading) onEdit(streamId); // Chỉ cho phép chỉnh sửa nếu không đang loading
  };

  const handleCancel = () => {
    if (!isLoading) { // Chỉ cho phép hủy nếu không đang loading
      setNewImages([]);
      setNewVideo(null);
      setNewProfileImage(null);
      setNewBackgroundImage(null);
      onCancel(streamId);
    }
  };

  const handleParamChange = (index, key, value) => {
    setParams((prev) =>
      prev.map((paramObj, i) =>
        i === index ? { ...paramObj, [key]: value } : paramObj
      )
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    setNewVideo(file);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    setNewProfileImage(file);
  };

  const handleBackgroundImageChange = (e) => {
    const file = e.target.files[0];
    setNewBackgroundImage(file);
  };

  return (
    <div className="confirmation-message">
      <div className="message-content">
        <h4>{isEditing ? 'Chỉnh sửa thông tin' : 'Xác nhận thông tin'}</h4>
        {isLoading && (
          <div className="loading-overlay">
            <div className="spinner"></div>
            <p>Đang xử lý, vui lòng chờ...</p>
          </div>
        )}
        <div className="params-list">
          {params && Array.isArray(params) && params.length > 0 ? (
            params.map((paramObj, index) =>
              Object.entries(paramObj)
                .filter(([key]) => displayMap[key])
                .map(([key, value]) => (
                  <div key={`${key}-${index}`} className="param-item">
                    <strong>{displayMap[key] || key}:</strong>{' '}
                    {isEditing ? (
                      <>
                        {key === 'Content' || key === 'Bio' ? (
                          <textarea
                            value={paramObj[key] || ''}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                            disabled={isLoading}
                          />
                        ) : key === 'Scope' && endpoint.includes('/Post/') ? (
                          <select
                            value={paramObj[key] || 'Public'}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                            disabled={isLoading}
                          >
                            <option value="Public">Công khai</option>
                            <option value="Friends">Bạn bè</option>
                            <option value="Private">Riêng tư</option>
                          </select>
                        ) : key === 'IsSafetyTrackingEnabled' && endpoint.includes('/Ride/') ? (
                          <select
                            value={paramObj[key] === true ? 'true' : 'false'}
                            onChange={(e) => handleParamChange(index, key, e.target.value === 'true')}
                            className="edit-input"
                            disabled={isLoading}
                          >
                            {isSafeOptions.map((option) => (
                              <option key={option.value} value={option.value.toString()}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : key === 'Gender' && endpoint.includes('/UserProfile/') ? (
                          <select
                            value={paramObj[key] || ''}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                            disabled={isLoading}
                          >
                            {genderOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        ) : key === 'Images' && endpoint.includes('/Post/') ? (
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="edit-input"
                            disabled={isLoading}
                          />
                        ) : key === 'Video' && endpoint.includes('/Post/') ? (
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="edit-input"
                            disabled={isLoading}
                          />
                        ) : key === 'ProfileImage' && endpoint.includes('/UserProfile/') ? (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="edit-input"
                            disabled={isLoading}
                          />
                        ) : key === 'BackgroundImage' && endpoint.includes('/UserProfile/') ? (
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundImageChange}
                            className="edit-input"
                            disabled={isLoading}
                          />
                        ) : (
                          <input
                            type="text"
                            value={paramObj[key] || ''}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                            disabled={isLoading}
                          />
                        )}
                      </>
                    ) : key === 'Images' && Array.isArray(value) ? (
                      <div className="images-preview">
                        {value.map((url, imgIndex) => (
                          <img key={imgIndex} src={url} alt={`Hình ảnh ${imgIndex + 1}`} className="preview-image" />
                        ))}
                      </div>
                    ) : key === 'Video' && value ? (
                      <video src={value} controls className="preview-video" />
                    ) : key === 'ProfileImage' && value ? (
                      <img src={value} alt="Ảnh đại diện" className="preview-image" />
                    ) : key === 'BackgroundImage' && value ? (
                      <img src={value} alt="Ảnh bìa" className="preview-image" />
                    ) : key === 'Gender' && value ? (
                      <span>{genderOptions.find((opt) => opt.value === value)?.label || value}</span>
                    ) : key === 'IsSafetyTrackingEnabled' && endpoint.includes('/Ride/') ? (
                      <span>{value ? 'Đồng ý' : 'Không đồng ý'}</span>
                    ) : (
                      <span>{value === null ? 'Không có thay đổi' : value.toString()}</span>
                    )}
                  </div>
                ))
            )
          ) : (
            <p>Không có thông tin để hiển thị.</p>
          )}
          {isEditing && (
            <>
              {endpoint.includes('/Post/') && newImages.length > 0 && (
                <div className="param-item">
                  <strong>Hình ảnh mới:</strong>
                  <div className="images-preview">
                    {newImages.map((file, index) => (
                      <img
                        key={index}
                        src={URL.createObjectURL(file)}
                        alt={`Hình ảnh mới ${index + 1}`}
                        className="preview-image"
                      />
                    ))}
                  </div>
                </div>
              )}
              {endpoint.includes('/Post/') && newVideo && (
                <div className="param-item">
                  <strong>Video mới:</strong>
                  <video src={URL.createObjectURL(newVideo)} controls className="preview-video" />
                </div>
              )}
              {endpoint.includes('/UserProfile/') && newProfileImage && (
                <div className="param-item">
                  <strong>Ảnh đại diện mới:</strong>
                  <img src={URL.createObjectURL(newProfileImage)} alt="Ảnh đại diện mới" className="preview-image" />
                </div>
              )}
              {endpoint.includes('/UserProfile/') && newBackgroundImage && (
                <div className="param-item">
                  <strong>Ảnh bìa mới:</strong>
                  <img src={URL.createObjectURL(newBackgroundImage)} alt="Ảnh bìa mới" className="preview-image" />
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={handleConfirm} className="confirm-button" disabled={isLoading}>
            {isLoading ? 'Đang xử lý...' : isEditing ? 'Lưu' : 'Xác nhận'}
          </button>
          {!isEditing && (
            <button onClick={handleEdit} className="edit-button" disabled={isLoading}>
              Sửa
            </button>
          )}
          <button onClick={handleCancel} className="cancel-button" disabled={isLoading}>
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;