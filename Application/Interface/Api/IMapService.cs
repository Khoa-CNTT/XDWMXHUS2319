using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interface.Api
{
    public interface IMapService
    {
        //phương thức lấy tọa độ từ địa chỉ
        /// <summary>
        /// 📌 Chức năng:
        ///Chuyển đổi địa chỉ thành tọa độ GPS(latitude, longitude).
        ///📥 Tham số đầu vào:
        ///address: tên địa điểm do người dùng nhập(VD: "Đại học Bách Khoa Đà Nẵng").
        ///📤 Giá trị trả về:
        ///(double lat, double lng): tọa độ GPS của địa chỉ.
        ///📌 Khi nào dùng?
        ///✔ Khi người dùng nhập một địa chỉ vào ô tìm kiếm, bạn cần lấy tọa độ để hiển thị trên bản đồ.
        ///✔ Khi đặt xe, bạn cần lấy tọa độ từ địa chỉ nhập vào để tính quãng đường.
        /// </summary>
        Task<(double lat, double lng)> GetCoordinatesAsync(string address);
        //phương thức lấy khoảng cách và thời gian từ 2 địa chỉ
        /// <summary>
        /// 📌 Chức năng:
        ///Tính khoảng cách(km) và thời gian dự kiến(phút) giữa hai địa điểm.
        ///📥 Tham số đầu vào:
        ///origin: điểm xuất phát (có thể là địa chỉ hoặc tọa độ dạng string).
        ///destination: điểm đến(có thể là địa chỉ hoặc tọa độ dạng string).
        ///📤 Giá trị trả về:
        ///(double distanceKm, int durationMinutes):
        ///distanceKm: khoảng cách giữa hai điểm(km).
        ///durationMinutes: thời gian dự kiến(phút).
        ///📌 Khi nào dùng?
        ///✔ Khi bạn muốn hiển thị khoảng cách và thời gian dự kiến của chuyến đi.
        ///✔ Khi tính toán chi phí di chuyển dựa trên quãng đường.
        /// </summary>
        Task<(double distanceKm, int durationMinutes)> GetDistanceAndTimeAsync(string origin, string destination);
        //phương thức lấy địa chỉ từ tọa độ
        /// <summary>
        /// 📌 Chức năng:
        ///Chuyển đổi tọa độ(latitude, longitude) thành địa chỉ cụ thể.
        ///📥 Tham số đầu vào:
        ///lat, lng: tọa độ GPS(được lấy từ thiết bị của người dùng hoặc từ Google Maps).
        ///📤 Giá trị trả về:
        ///string?: địa chỉ đầy đủ tương ứng với tọa độ.
        ///📌 Khi nào dùng?
        ///✔ Khi bạn có tọa độ(VD: từ GPS của người dùng) nhưng cần hiển thị địa chỉ dễ đọc.
        ///✔ Khi người dùng chọn một điểm trên bản đồ, nhưng bạn cần hiển thị địa chỉ của nó.
        /// </summary>
        Task<string?> GetAddressFromCoordinatesAsync(double lat, double lng);
        //phương thức tính tổng quãng đường đã đi
       
    }
}
