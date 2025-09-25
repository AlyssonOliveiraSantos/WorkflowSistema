using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace WorkflowAPI.Helper
{
    public class EnumWithValuesSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type.IsEnum)
            {
                schema.Enum.Clear(); 
                foreach (var name in Enum.GetNames(context.Type))
                {
                    var value = (int)Enum.Parse(context.Type, name);
                    schema.Enum.Add(new Microsoft.OpenApi.Any.OpenApiString($"{name} = {value}"));
                }
            }
        }
    }
}
