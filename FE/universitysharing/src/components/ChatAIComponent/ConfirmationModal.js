import React, { useState } from 'react';
import './ConfirmationModal.scss';

const paramDisplayMap = {
  '/api/Post/create': {
    Content: 'Nội dung bài đăng',
    Images: 'Hình ảnh kèm theo',
    Video: 'Video kèm theo',
    Scope: 'Phạm vi bài đăng',
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
};

const ConfirmationModal = ({ results, streamId, onConfirm, onEdit, onCancel, conversationId, isEditing }) => {
  const firstResult = results[0] || {};
  const { endpoint, params: rawParams, redis_key } = firstResult;

  const initialParams = Array.isArray(rawParams) ? rawParams : [rawParams];
  const [params, setParams] = useState(initialParams);
  const [newImages, setNewImages] = useState([]);
  const [newVideo, setNewVideo] = useState(null);

  const displayMap = paramDisplayMap[endpoint.replace('https://localhost:7053', '')] || {};

  const handleConfirm = () => {
    console.log('[ConfirmationModal] Confirm button clicked:', { endpoint, params, redis_key, streamId });
    const updatedParams = params.map((paramObj) => ({
      ...paramObj,
      Images: endpoint.includes('/Post/create') ? newImages : paramObj.Images,
      Video: endpoint.includes('/Post/create') ? newVideo : paramObj.Video,
    }));
    onConfirm(endpoint, updatedParams, redis_key, streamId);
  };

  const handleEdit = () => {
    console.log('[ConfirmationModal] Edit button clicked for streamId:', streamId);
    onEdit(streamId); // Truyền streamId của modal này
  };

  const handleCancel = () => {
    console.log('[ConfirmationModal] Cancel button clicked', { streamId });
    setNewImages([]);
    setNewVideo(null);
    onCancel(streamId);
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

  return (
    <div className="message-bubble ai-message confirmation-message">
      <div className="message-content">
        <h4>{isEditing ? 'Chỉnh sửa thông tin' : 'Xác nhận thông tin'}</h4>
        <div className="params-list">
          {params && Array.isArray(params) && params.length > 0 ? (
            params.map((paramObj, index) =>
              Object.entries(paramObj)
                .filter(([_, value]) => value !== null && value !== undefined && value !== 'null' && value !== '')
                .map(([key, value]) => (
                  <div key={`${key}-${index}`} className="param-item">
                    <strong>{displayMap[key] || key}:</strong>{' '}
                    {isEditing ? (
                      <>
                        {key === 'Content' ? (
                          <textarea
                            value={paramObj[key] || ''}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                          />
                        ) : key === 'Scope' && endpoint.includes('/Post/create') ? (
                          <select
                            value={paramObj[key] || 'Public'}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                          >
                            <option value="Public">Công khai</option>
                            <option value="Friends">Bạn bè</option>
                            <option value="Private">Riêng tư</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={paramObj[key] || ''}
                            onChange={(e) => handleParamChange(index, key, e.target.value)}
                            className="edit-input"
                          />
                        )}
                      </>
                    ) : key === 'Images' && Array.isArray(value) ? (
                      <div className="images-preview">
                        {value.map((url, imgIndex) => (
                          <img key={imgIndex} src={url} alt={`Hình ảnh ${imgIndex + 1}`} className="preview-image" />
                        ))}
                      </div>
                    ) : key === 'Video' ? (
                      <video src={value} controls className="preview-video" />
                    ) : (
                      <span>{value.toString()}</span>
                    )}
                  </div>
                ))
            )
          ) : (
            <p>Không có thông tin để hiển thị.</p>
          )}
          {isEditing && endpoint.includes('/Post/create') && (
            <>
              <div className="param-item">
                <strong>Thêm hình ảnh:</strong>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="edit-input"
                />
                {newImages.length > 0 && (
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
                )}
              </div>
              <div className="param-item">
                <strong>Thêm video:</strong>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="edit-input"
                />
                {newVideo && (
                  <video src={URL.createObjectURL(newVideo)} controls className="preview-video" />
                )}
              </div>
            </>
          )}
        </div>
        <div className="modal-actions">
          <button onClick={handleConfirm} className="confirm-button">
            {isEditing ? 'Lưu' : 'Xác nhận'}
          </button>
          {!isEditing && (
            <button onClick={handleEdit} className="edit-button">
              Sửa
            </button>
          )}
          <button onClick={handleCancel} className="cancel-button">
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;