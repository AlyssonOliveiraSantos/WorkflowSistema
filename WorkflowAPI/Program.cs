using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using Workflow.Shared.Data.Banco;
using Workflow.Shared.Data.Modelos;
using Workflow.Shared.Data.Seed;
using Workflow.Shared.Modelos.Modelos;
using WorkflowAPI.Helper;
using WorkflowAPI.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular",
        policy => policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod());
});



builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.Configure<Microsoft.AspNetCore.Http.Json.JsonOptions>(options => options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles);
builder.Services.AddDbContext<WorkflowDbContext>(options => 
    options.UseSqlServer(builder.Configuration.GetConnectionString("WorkflowDatabase"))
           .UseLazyLoadingProxies());

builder.Services.AddIdentity<PessoaComAcesso, PerfilDeAcesso>()
    .AddEntityFrameworkStores<WorkflowDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddScoped<DAL<PessoaComAcesso>>();
builder.Services.AddScoped<DAL<PerfilDeAcesso>>();
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<TokenService>();
builder.Services.AddTransient<DAL<Area>>();
builder.Services.AddTransient<DAL<Programa>>();
builder.Services.AddTransient<DAL<UsuarioWorkflow>>();
builder.Services.AddTransient<DAL<SolicitacaoAcessoPrograma>>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

builder.Services.AddSwaggerGen(c =>
{
    c.SchemaFilter<EnumWithValuesSchemaFilter>();
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Minha API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Digite 'Bearer {seu token}' no campo abaixo."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["SymmetricSecurityKey"])
        ),
        ValidateAudience = false,
        ValidateIssuer = false,
        ClockSkew = TimeSpan.Zero,
        RoleClaimType = "perfil"
    };
});
builder.Services.AddAuthorization();
var app = builder.Build();

app.UseCors("AllowAngular");

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WorkflowDbContext>();
    db.Database.Migrate();

    {
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<PerfilDeAcesso>>();
        await RoleSeeder.SeedRoles(roleManager);

        var usuarioService = scope.ServiceProvider.GetRequiredService<UsuarioService>();
        await usuarioService.CriaUsuarioInicial(
            "Admin",
            "admin@teste.com",
            "Admin123#!"
        );

    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
