
using Application.CQRS.Queries.Search;
using Application.Interface;
using Application.Interface.SearchAI;
using Infrastructure.Qdrant;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DuyTanSharingSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchAIController : Controller
    {
        private readonly ISearchAIService _searchService;
        private readonly IDataAIService _qdrantService;
        private readonly IMediator _mediator;

        public SearchAIController(ISearchAIService searchService, IDataAIService qdrantService,IMediator mediator)
        {
            _searchService = searchService;
            _qdrantService = qdrantService;
            _mediator = mediator;
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> Search([FromQuery] SearchAiQueries queries)
        {
            var results = await _mediator.Send(queries);
            return Ok(results);
        }
        //không được sài
        [HttpPost("import")]
        public async Task<IActionResult> ImportData()
        {
            await _qdrantService.ImportAllDataAsync();
            return Ok("Data imported into Qdrant successfully.");
        }
    }
}
