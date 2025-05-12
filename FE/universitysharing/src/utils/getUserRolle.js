import jwtDecode from "jwt-decode";

// Hàm lấy thông tin người dùng từ token và kiểm tra thời gian hết hạn
const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);

    // Lấy thời gian hết hạn từ token (exp: expiration)
    const expirationTime = decoded.exp * 1000; // chuyển sang ms
    const currentTime = Date.now(); // thời gian hiện tại

    // Nếu token đã hết hạn, trả về null
    if (currentTime >= expirationTime) {
      localStorage.removeItem("token"); // Xóa token trong localStorage
      return null; // Token đã hết hạn, trả về null
    }

    // Trả về thông tin người dùng bao gồm userId và role
    return {
      userId:
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ],
      role: decoded[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ],
      name: decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
      ],
    };
  } catch (error) {
    console.error("Token không hợp lệ", error);
    return null;
  }
};

export default getUserInfoFromToken;
