using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Workflow.Shared.Modelos.Enums
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    [Flags]
    public enum Permissao
    {
        Nenhuma = 0,
        [EnumMember(Value = "Permissão para incluir registros")]
        Incluir = 1 << 0,
        [EnumMember(Value = "Permissão para consultar registros")]
        Consultar = 1 << 1,
        [EnumMember(Value = "Permissão para modificar registros")]
        Modificar = 1 << 2,
        [EnumMember(Value = "Permissão para excluir registros")]
        Excluir = 1 << 3     
    }
}
