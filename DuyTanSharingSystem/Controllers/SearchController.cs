using Application.CQRS.Queries.Search;
using Application.Interface;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading;

namespace DuyTanSharingSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly IMediator _mediator;
        public SearchController(IMediator mediator)
        {
            _mediator = mediator;
        }
        [HttpGet]
        public async Task<IActionResult> SearchAll([FromQuery] string keyword, [FromQuery] DateTime? fromDate, [FromQuery] DateTime? toDate, [FromQuery] bool? onlyUsers, [FromQuery] bool? onlyPosts, 
            [FromQuery] int? year,
    [FromQuery] int? month,
    [FromQuery] int? day)
        {
            if (string.IsNullOrWhiteSpace(keyword))
                return BadRequest("Keyword cannot be empty");

            var query = new SearchAllQuery
            {
                Keyword = keyword,
                FromDate = fromDate,
                ToDate = toDate,
                Year = year,
                Month = month,
                Day = day,
                OnlyUsers = onlyUsers ?? false,
                OnlyPosts = onlyPosts ?? false
            };

            var result = await _mediator.Send(query);
            return Ok(result);
        }
    }
}
