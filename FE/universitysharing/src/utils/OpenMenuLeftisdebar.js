import { useEffect } from "react";
export function useSwipeToOpenSidebar(setShowSidebar) {
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      touchEndX = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
      if (touchStartX < 20 && touchEndX - touchStartX > 80) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [setShowSidebar]);
}
// export function useSwipeToOpenSidebar(setShowSidebar) {
//   useEffect(() => {
//     let touchStartX = 0;
//     let touchEndX = 0;

//     const handleTouchStart = (e) => {
//       touchStartX = e.touches[0].clientX;
//     };

//     const handleTouchMove = (e) => {
//       touchEndX = e.touches[0].clientX;
//     };

//     const handleTouchEnd = () => {
//       const isSwipeFromLeft = touchStartX < 20; // Chỉ xử lý khi vuốt từ mép trái
//       const swipeDistance = touchEndX - touchStartX;

//       if (isSwipeFromLeft && swipeDistance > 80) {
//         setShowSidebar(true);
//         // ✅ Không đẩy history, không can thiệp "Back"
//       }
//     };

//     window.addEventListener("touchstart", handleTouchStart);
//     window.addEventListener("touchmove", handleTouchMove);
//     window.addEventListener("touchend", handleTouchEnd);

//     return () => {
//       window.removeEventListener("touchstart", handleTouchStart);
//       window.removeEventListener("touchmove", handleTouchMove);
//       window.removeEventListener("touchend", handleTouchEnd);
//     };
//   }, [setShowSidebar]);
// }

export function useBackButtonToCloseSidebar(showSidebar, setShowSidebar) {
  useEffect(() => {
    const handlePopState = () => {
      if (showSidebar) {
        setShowSidebar(false);
        // Không push thêm state nữa, chỉ đóng menu
      }
    };

    // Chỉ push state khi sidebar được mở
    if (showSidebar) {
      window.history.pushState({ sidebarOpen: true }, "");
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [showSidebar, setShowSidebar]);
}
