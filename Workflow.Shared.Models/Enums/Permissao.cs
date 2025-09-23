using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Workflow.Shared.Modelos.Enums
{
    public enum Permissao
    {
        Nenhuma = 0,
        Incluir = 1 << 0,    
        Modificar = 1 << 1,  
        Consultar = 1 << 2,  
        Excluir = 1 << 3     
    }
}
