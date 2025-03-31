using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Common
{
    public static class Helpers
    {
        public static string TimeAgo(DateTime notificationTime)
        {
            DateTime localTime = notificationTime.ToLocalTime(); // Chuyển từ UTC sang Local
            TimeSpan timeDifference = DateTime.Now - localTime;

            if (timeDifference.TotalSeconds < 60)
                return $"{(int)timeDifference.TotalSeconds} giây trước";
            if (timeDifference.TotalMinutes < 60)
                return $"{(int)timeDifference.TotalMinutes} phút trước";
            if (timeDifference.TotalHours < 24)
                return $"{(int)timeDifference.TotalHours} giờ trước";
            if (timeDifference.TotalDays == 1)
                return "hôm qua";
            if (timeDifference.TotalDays < 7)
                return $"{(int)timeDifference.TotalDays} ngày trước";
            if (timeDifference.TotalDays < 30)
                return $"{(int)(timeDifference.TotalDays / 7)} tuần trước";
            if (timeDifference.TotalDays < 365)
                return $"{(int)(timeDifference.TotalDays / 30)} tháng trước";

            return $"{(int)(timeDifference.TotalDays / 365)} năm trước";
        }


    }
}
