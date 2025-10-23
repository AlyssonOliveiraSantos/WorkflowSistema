export interface SolicitacaoAcessoPrograma {
  id: number;
  solicitanteId: number;
  usuarioWorkflowId: number;
  programaId: number;
  usuarioWorkflowNome?: string;
  solicitanteWorkflowNome?: string;
  programaNome?: string;
  permissao: string;
  finalizado: boolean;
  dataSolicitacao?: string; 
  observacaoSolicitante?: string;
  aprovadoGerente?: boolean;
  observacaoGerente?: string;
  dataAprovacaoGerente?: string;
  aprovadoResponsavelPrograma?: boolean;
  observacaoResponsavelPrograma?: string;
  dataAprovacaoResponsavelPrograma?: string;
  aprovadoTI?: boolean;
  observacaoTI?: string;
  dataAprovacaoTI?: string;
}
