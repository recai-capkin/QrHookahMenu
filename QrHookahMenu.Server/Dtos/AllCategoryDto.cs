namespace QrHookahMenu.Server.Dtos
{
    public class AllCategoryDto
    {
        public int? Id { get; set; }
        public int? ParentId { get; set; } // NULL ise ana kategoridir
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public string? ImageUrl { get; set; }
        public string ParentName { get; set; }
    }
}
