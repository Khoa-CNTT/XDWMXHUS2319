using Application.Interface.Api;
using Infrastructure.Maps;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Helper
{
    public class MapServiceFactory
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _configuration;

        public MapServiceFactory(IServiceProvider serviceProvider, IConfiguration configuration)
        {
            _serviceProvider = serviceProvider;
            _configuration = configuration;
        }

        public IMapService Create()
        {
            var provider = _configuration["MapService:Provider"];
            return provider == "Google"
                ? _serviceProvider.GetRequiredService<GoogleMapsService>()
                : _serviceProvider.GetRequiredService<HereMapService>();
        }
    }
}
