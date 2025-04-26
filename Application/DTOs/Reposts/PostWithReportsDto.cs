namespace Application.DTOs.Reposts
{
    public class PostWithReportsDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string? FullName { get; set; }
        public string? ProfilePicture { get; set; }
        public string? Content { get; set; }
        public string? ImageUrl { get; set; }
        public string? VideoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdateAt { get; set; }
        public PostTypeEnum PostType { get; set; }
        public ScopeEnum Scope { get; set; }
        public int CommentCount { get; set; }
        public int LikeCount { get; set; }
        public int ShareCount { get; set; }
        public bool HasLiked { get; set; }
        public List<ReportDto> Reports { get; set; } = new();
    }
}
