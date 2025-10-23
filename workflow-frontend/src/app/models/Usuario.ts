export interface Usuario {
  id: number;
  userName?: string;
  password?: string;
  confirmpassword?: string;
  email?: string;
  usuarioWorkflowId?: number;
  usuarioWorkflowNome?: string;
}