using Application.Interface.ContextSerivce;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.CQRS.Commands.Posts
{
    public class CreateReportPostCommandHandler : IRequestHandler<CreateReportPostCommand, ResponseModel<bool>>
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IReportService _reportService;
        private readonly IUserContextService _userContextService;

        public CreateReportPostCommandHandler(IUnitOfWork unitOfWork, IReportService reportService, IUserContextService userContextService)
        {
            _unitOfWork = unitOfWork;
            _reportService = reportService;
            _userContextService = userContextService;
        }

        public async Task<ResponseModel<bool>> Handle(CreateReportPostCommand request, CancellationToken cancellationToken)
        {
            
            try
            {
                var reportId = await _reportService.CreateReportAsync(request.PostId, request.Reason);//ko mo trnasection
                return ResponseFactory.Success(true, "Report created successfully", 200);
            }
            catch (Exception ex)
            {
                return ResponseFactory.Error<bool>("Loi: ",400 , ex);
            }
          
        }
    }
}
