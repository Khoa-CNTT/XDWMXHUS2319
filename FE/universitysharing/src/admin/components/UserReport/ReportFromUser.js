import React, { useState } from "react";
import AvatarDefaut from "../../../assets/AvatarDefaultFill.png";
import "../../styles/ReportFromUserContainer.scss";

const AllReportFromUser = () => {
  const userReport = [
    {
      id: 1,
      name: "Nguyễn  Thị Mộng Lý",
      reason: "Hahaha",
      avtart: AvatarDefaut,
    },
    {
      id: 2,
      name: "Nguyễn  Thị Mộng Lý",
      reason: "Hahaha",
      avtart: AvatarDefaut,
    },
    {
      id: 3,
      name: "Nguyễn  Thị Mộng Lý",
      reason: "Hahaha",
      avtart: AvatarDefaut,
    },
    {
      id: 3,
      name: "Nguyễn  Thị Mộng Lý",
      reason: "Hahaha",
      avtart: AvatarDefaut,
    },
    {
      id: 3,
      name: "Nguyễn  Thị Mộng Lý",
      reason: "Hahaha",
      avtart: AvatarDefaut,
    },
    {
      id: 3,
      name: "Nguyễn  Thị Mộng Lý",
      reason: "Hahaha",
      avtart: AvatarDefaut,
    },
  ];

  return (
    <div className="report-user-site">
      <div className="accept-reject-btn">
        <button className="accept-report">Xóa bài viết</button>
        <button className="reject-report">Từ chối xóa</button>
      </div>
      <div className="report-container">
        {userReport.map((report, index) => (
          <div key={report.id} className="report-card">
            <img
              src={report.avtart}
              alt="anh dai dien"
              className="avatar"
            ></img>
            <div className="name-reason">
              <strong className="name-user-report">{report.name}</strong>
              <p className="reason-report">{report.reason}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AllReportFromUser;
