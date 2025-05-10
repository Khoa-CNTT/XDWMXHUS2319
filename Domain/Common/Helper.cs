using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Common
{
    public static class Helper
    {
        public static string FormatUtcToLocal(DateTime dateTimeUtc, string timeZoneId = "SE Asia Standard Time")
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(timeZoneId);
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(dateTimeUtc, timeZone);
            return localTime.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public static string FormatToIso8601(DateTime dateTime)
        {
            return dateTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        }

    }
}
