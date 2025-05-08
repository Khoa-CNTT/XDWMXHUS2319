import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaStar } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import "../styles/RatingModal.scss";

const RatingModal = ({ isOpen, onClose, ride, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");

  if (!isOpen || !ride) return null;

  const handleSubmit = () => {
    if (rating < 1 || rating > 5) {
      toast.error("Vui lòng chọn số sao từ 1 đến 5!");
      return;
    }
    onSubmit(
      ride.rideId,
      ride.driverId,
      rating,
      comment.trim() || "Không có bình luận"
    );
    setRating(0);
    setComment("");
    setHoveredRating(0);
    onClose();
  };

  return (
    <div className="rating-modal-overlay">
      <motion.div
        className="rating-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="modal-header">
          <h3>Đánh giá chuyến đi</h3>
          <button className="close-modal" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <p>
            Chuyến đi từ <strong>{ride.startLocation}</strong> đến{" "}
            <strong>{ride.endLocation}</strong>
          </p>
          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                className={`star ${
                  (hoveredRating || rating) >= star ? "selected" : ""
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              />
            ))}
          </div>
          <textarea
            placeholder="Bạn cảm thấy chuyến đi như thế nào?"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Hủy
          </button>
          <button className="submit-rating" onClick={handleSubmit}>
            Gửi đánh giá
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default RatingModal;
