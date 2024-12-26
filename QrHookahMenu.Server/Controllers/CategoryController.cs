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

        // Tüm kategorileri listeleme
        [HttpGet]
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

        // Yeni kategori oluşturma (resim dosyası destekli)
        [HttpPost]
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
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] Category updatedCategory, IFormFile? file)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                return NotFound();
            }

            // Eğer yeni bir resim yüklendiyse eski resmi sil ve yeni resmi kaydet
            if (file != null && file.Length > 0)
            {
                // Eski resmi sil
                if (!string.IsNullOrEmpty(category.ImageUrl))
                {
                    var oldImagePath = Path.Combine(_environment.WebRootPath, category.ImageUrl.TrimStart('/'));
                    if (System.IO.File.Exists(oldImagePath))
                    {
                        System.IO.File.Delete(oldImagePath);
                    }
                }

                // Yeni resmi kaydet
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

                using (var stream = new FileStream(uploadPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                updatedCategory.ImageUrl = $"/uploads/{fileName}";
            }

            // Kategori bilgilerini güncelle
            category.Name = updatedCategory.Name;
            category.Description = updatedCategory.Description;
            category.ImageUrl = updatedCategory.ImageUrl;
            category.SortOrder = updatedCategory.SortOrder;
            category.ParentId = updatedCategory.ParentId;

            await _context.SaveChangesAsync();
            return NoContent();
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

    }
}
