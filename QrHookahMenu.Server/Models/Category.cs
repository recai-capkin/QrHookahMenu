namespace QrHookahMenu.Server.Models
{
    public class Category
    {
        public int Id { get; set; }
        public int? ParentId { get; set; } // NULL ise ana kategoridir
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int? SortOrder { get; set; }

        public virtual Category? Parent { get; set; }
        public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();
        public virtual ICollection<Product> Products { get; set; } = new List<Product>();
    }
}
