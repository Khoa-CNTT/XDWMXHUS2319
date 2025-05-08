import React, { useState } from "react";
import { Modal, DatePicker } from "antd";
import moment from "moment";

const BlockUserModal = ({ visible, onConfirm, onCancel, userId, title }) => {
  const [blockUntil, setBlockUntil] = useState(null);

  const handleConfirm = () => {
    if (!blockUntil) {
      return; // onConfirm sẽ xử lý lỗi
    }
    onConfirm(blockUntil.toISOString());
    setBlockUntil(null); // Reset sau khi xác nhận
  };

  const handleCancel = () => {
    setBlockUntil(null); // Reset khi hủy
    onCancel();
  };

  return (
    <Modal
      title={title || "Chọn thời gian hết hạn"} // Tiêu đề tùy chỉnh
      visible={visible}
      onOk={handleConfirm}
      onCancel={handleCancel}
      okText="Xác nhận"
      cancelText="Hủy"
    >
      <DatePicker
        showTime
        format="YYYY-MM-DD HH:mm:ss"
        onChange={(date) => setBlockUntil(date)}
        placeholder="Chọn thời gian hết hạn"
        style={{ width: "100%" }}
        disabledDate={(current) => current && current < moment().startOf("day")}
      />
    </Modal>
  );
};

export default BlockUserModal;
