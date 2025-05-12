using Application.DTOs.Reposts;
using Domain.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class RideReportService  : IRideReportService
    {
        private readonly IRideReportRepository _rideReportRepository;
        public RideReportService(IRideReportRepository rideReportRepository)
        {
            _rideReportRepository = rideReportRepository;
        }
        public  async Task<List<RideReportDto>> GetFilteredReportsAsync()
        {
            var filterTypes = new List<AlertTypeEnums>
            {
                AlertTypeEnums.DriverGPSOff,
                AlertTypeEnums.TripDelayed
            };

            var reports = await _rideReportRepository.GetReportsByAlertTypesAsync(filterTypes);
            return reports.Select(Mapping.RideReportwithAdmin).ToList();
        }        
    }
    
}
