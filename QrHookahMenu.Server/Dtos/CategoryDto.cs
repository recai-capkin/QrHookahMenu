using System.Text.Json.Serialization;

namespace QrHookahMenu.Server.Dtos
{
    public class CategoryDto
    {
        public int? Id { get; set; }
        public int? ParentId { get; set; } // NULL ise ana kategoridir
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? SortOrder { get; set; }
        public string? ImageUrl { get; set; }
        [JsonIgnore]
        public List<CategoryDto>? SubCategories { get; set; } = new List<CategoryDto>();
        public List<ProductDto> Products { get; set; } = new List<ProductDto>();
    }
}
