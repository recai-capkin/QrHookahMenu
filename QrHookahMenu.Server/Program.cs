using Microsoft.EntityFrameworkCore;
using QrHookahMenu.Server.Contexts;
using System;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer(); // API keşfi için gerekli
builder.Services.AddSwaggerGen();          // Swagger'ı ekler

// CORS politikasını ekleyin
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder
            .AllowAnyOrigin() // Tüm domainlerden erişime izin verir
            .AllowAnyMethod() // GET, POST, PUT, DELETE gibi tüm HTTP metodlarına izin verir
            .AllowAnyHeader(); // Her tür HTTP başlığına izin verir
    });
});
var app = builder.Build();

app.UseDefaultFiles();
app.MapStaticAssets();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    
}
app.UseSwagger();    // Swagger JSON dosyasını oluşturur
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "QrHookahMenu API v1");
}); // Swagger arayüzünü sağlar
app.UseStaticFiles();  // Statik dosyalar (örneğin, resim yüklemeleri) için gerekli

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

// CORS middleware'ini ekleyin
app.UseCors("AllowAll");

app.Run();
