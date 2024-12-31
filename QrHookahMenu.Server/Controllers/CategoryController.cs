using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrHookahMenu.Server.Contexts;
using QrHookahMenu.Server.Dtos;
using QrHookahMenu.Server.Models;

namespace QrHookahMenu.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public CategoryController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }
        [Authorize]
        [HttpGet("get-category-by-id/{categoryId}")]
        public async Task<IActionResult> GetCategoryById(int categoryId)
        {
            var categories = await _context.Categories.Where(x => x.Id == categoryId).FirstOrDefaultAsync();
            var newCategories = MapToCategoryDto(categories);
            return Ok(newCategories);
        }
        [Authorize]
        [HttpGet("get-all-categories")]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await GetAllCategoriesWithParentAsync(); // Service katmanını çağırıyoruz
            return Ok(categories);
        }
        // Tüm kategorileri listeleme
        [HttpGet("all-categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
         .Include(c => c.SubCategories)
         .Include(c => c.Products)
         .ToListAsync();

            var categoryDtos = categories
                .Where(c => c.ParentId == null) // Ana kategorileri seçiyoruz
                .Select(c => MapToCategoryDto(c))
                .ToList();

            return Ok(categoryDtos);
        }
        [HttpGet("get-by-id-categories")]
        public async Task<IActionResult> GetByIdCategories(int categoryId)
        {
            var categories = await _context.Categories
          .Include(c => c.SubCategories)
          .Include(c => c.Products)
          .Where(c => c.ParentId == categoryId)
          .ToListAsync();
            var categoryDtos = categories
               .Select(c => MapToCategoryDto(c))
               .ToList();

            return Ok(categoryDtos);
        }
        [HttpGet("get-by-category-id-products")]
        public async Task<IActionResult> GetByIdCategoryIdProducts(int categoryId)
        {
            var products = await _context.Products.Where(x => x.CategoryId == categoryId)
                .Select(x => new ProductDto
            {
                Id = x.Id,
                Name = x.Name,
                Description = x.Description,
                Price = x.Price,
                ImageUrl = x.ImageUrl,
                IsAvailable = x.IsAvailable,
                CategoryId = x.CategoryId
            }).ToListAsync();
            return Ok(products);
        }
        // Yeni kategori oluşturma (resim dosyası destekli)
        [Authorize]
        [HttpPost("CreateCategory")]
        public async Task<IActionResult> CreateCategory([FromForm] CategoryDto category, IFormFile? file)
        {
            if (file != null && file.Length > 0)
            {
                // Benzersiz bir dosya adı oluştur
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

                // Resim dosyasını kaydet
                using (var stream = new FileStream(uploadPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Resim URL'sini kategoriye ata
                category.ImageUrl = $"/uploads/{fileName}";
            }
            var newCategory = new Category()
            {
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                ParentId = category.ParentId,
                SortOrder = category.SortOrder,

            };
            _context.Categories.Add(newCategory);
            await _context.SaveChangesAsync();
            // Alt kategorilerin ParentId'sini güncelle
            if (category.SubCategories != null && category.SubCategories.Any())
            {
                foreach (var subCategoryDto in category.SubCategories)
                {
                    var subCategory = await _context.Categories.FindAsync(subCategoryDto.Id);
                    if (subCategory != null)
                    {
                        subCategory.ParentId = newCategory.Id; // Alt kategorilerin ParentId'sini güncelle
                    }
                }

                await _context.SaveChangesAsync(); // Güncellemeleri kaydet
            }
            return CreatedAtAction(nameof(GetAllCategories), new { id = newCategory.Id }, category);
        }

        // Kategori güncelleme (resim dosyası destekli)
        [Authorize]
        [HttpPut("UpdateCategory/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] CategoryDto category, IFormFile? file)
        {
            // Kategoriyi veritabanından al
            var existingCategory = await _context.Categories.FindAsync(id);
            if (existingCategory == null)
            {
                return NotFound("Kategori bulunamadı.");
            }

            // Eğer yeni bir resim yüklenmişse, eski resmi sil ve yenisini kaydet
            if (file != null && file.Length > 0)
            {
                // Mevcut resmi sil
                if (!string.IsNullOrEmpty(existingCategory.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_environment.WebRootPath, existingCategory.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // Yeni dosya adı oluştur ve kaydet
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

                using (var stream = new FileStream(uploadPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Yeni resim URL'sini ata
                existingCategory.ImageUrl = $"/uploads/{fileName}";
            }

            // Kategori bilgilerini güncelle
            existingCategory.Name = existingCategory.Name;
            existingCategory.Description = existingCategory.Description;
            existingCategory.SortOrder = existingCategory.SortOrder;
            existingCategory.ParentId = existingCategory.ParentId;

            // Alt kategorilerin ParentId'sini güncelle
            if (category.SubCategories != null && category.SubCategories.Any())
            {
                foreach (var subCategoryDto in category.SubCategories)
                {
                    var subCategory = await _context.Categories.FindAsync(subCategoryDto.Id);
                    if (subCategory != null)
                    {
                        subCategory.ParentId = existingCategory.Id;
                    }
                }
            }

            await _context.SaveChangesAsync(); // Güncellemeleri kaydet
            return NoContent(); // Güncelleme başarılı
        }


        // Kategori silme
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            // Kategoriye bağlı resim dosyasını sil
            if (!string.IsNullOrEmpty(category.ImageUrl))
            {
                var imagePath = Path.Combine(_environment.WebRootPath, category.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(imagePath))
                {
                    System.IO.File.Delete(imagePath);
                }
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        [HttpGet("base-categories")]
        public async Task<IActionResult> GetBaseCategory()
        {
            var baseCategories = await _context.Categories
         .Where(x => x.ParentId == null || !x.Products.Any()) // Ana kategoriler
         .Select(x => new
         {
             x.Id,
             x.Name
         })
         .ToListAsync();

            return Ok(baseCategories); // JSON olarak döner
        }
        // Category -> CategoryDto dönüşüm metodu
        private CategoryDto MapToCategoryDto(Category category)
        {
            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ImageUrl = category.ImageUrl,
                SortOrder = category.SortOrder,
                SubCategories = category.SubCategories
                    .Select(sub => MapToCategoryDto(sub))
                    .ToList(),
                Products = category.Products
                    .Select(p => new ProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Description = p.Description,
                        Price = p.Price,
                        ImageUrl = p.ImageUrl,
                        IsAvailable = p.IsAvailable
                    })
                    .ToList()
            };
        }
        private async Task<List<AllCategoryDto>> GetAllCategoriesWithParentAsync()
        {
            var categories = await _context.Categories
                .Select(category => new AllCategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    Description = category.Description,
                    ImageUrl = category.ImageUrl,
                    SortOrder = category.SortOrder,
                    ParentId = category.ParentId,
                    ParentName = category.Parent != null ? category.Parent.Name : null // Üst kategorinin adını getir
                })
                .ToListAsync();

            return categories;
        }

    }
}
