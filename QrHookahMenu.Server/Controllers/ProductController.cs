using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QrHookahMenu.Server.Contexts;
using QrHookahMenu.Server.Models;

namespace QrHookahMenu.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public ProductController(AppDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        } // Tüm ürünleri listeleme
        [HttpGet]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _context.Products.Include(p => p.Category).ToListAsync();
            return Ok(products);
        }

        // Yeni ürün ekleme (resim dosyası destekli)
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromForm] Product product, IFormFile? file)
        {
            if (file != null && file.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

                // Dosyayı kaydet
                using (var stream = new FileStream(uploadPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                product.ImageUrl = $"/uploads/{fileName}"; // Resim yolu kaydediliyor
            }

            var category = await _context.Categories.FindAsync(product.CategoryId);
            if (category == null)
            {
                return NotFound("Category not found.");
            }

            _context.Products.Add(product);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetAllProducts), new { id = product.Id }, product);
        }

        // Ürün güncelleme
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] Product updatedProduct, IFormFile? file)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            if (file != null && file.Length > 0)
            {
                var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                var uploadPath = Path.Combine(_environment.WebRootPath, "uploads", fileName);

                // Dosyayı kaydet
                using (var stream = new FileStream(uploadPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                updatedProduct.ImageUrl = $"/uploads/{fileName}";
            }

            product.Name = updatedProduct.Name;
            product.Description = updatedProduct.Description;
            product.Price = updatedProduct.Price;
            product.ImageUrl = updatedProduct.ImageUrl;
            product.IsAvailable = updatedProduct.IsAvailable;
            product.CategoryId = updatedProduct.CategoryId;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Ürün silme
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            // Eski resmi silme
            if (!string.IsNullOrEmpty(product.ImageUrl))
            {
                var filePath = Path.Combine(_environment.WebRootPath, product.ImageUrl.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
