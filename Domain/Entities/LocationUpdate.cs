using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class LocationUpdate
    {
        public Guid Id { get; private set; }
        public Guid RideId { get; private set; }
        public double Latitude { get; private set; }//vĩ độ
        public double Longitude { get; private set; }//kinh độ
        public DateTime Timestamp { get; private set; }//thời gian
        public User? User { get;private set; }
        // tạo constructor với các tham số sau:
        public LocationUpdate(Guid rideId, double latitude, double longitude)
        {
            Id = Guid.NewGuid();
            RideId = rideId;
            Latitude = latitude;
            Longitude = longitude;
            Timestamp = DateTime.UtcNow;
        }
        //tạo phương thức update kinh độ và vĩ độ mỗi 1 phút
        public void UpdateLocation(double latitude, double longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
            Timestamp = DateTime.UtcNow;
        }
    }
}
