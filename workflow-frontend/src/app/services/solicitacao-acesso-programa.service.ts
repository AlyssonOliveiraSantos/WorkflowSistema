// services/solicitacao-acesso.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of, map, switchMap, catchError } from 'rxjs';
import { AuthService } from '../auth.service';
import { SolicitacaoAcessoPrograma } from '../models/Solicitacao-acesso-programa';
import { UsuarioWorkflowService } from './usuario-workflow.service';
import { ProgramaService } from './programa.service';

@Injectable({ providedIn: 'root' })
export class SolicitacaoAcessoService {
  private baseUrl = 'http://localhost:5000/api/SolicitacaoAcessoPrograma';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private usuarioService: UsuarioWorkflowService,
    private programaService: ProgramaService
  ) {}

  getSolicitacoes(): Observable<SolicitacaoAcessoPrograma[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

    return this.http.get<SolicitacaoAcessoPrograma[]>(this.baseUrl, { headers }).pipe(
      switchMap(solicitacoes => {
        if (!solicitacoes || solicitacoes.length === 0) return of([]);

        const requests = solicitacoes.map(solicitacao =>
          forkJoin([
            this.usuarioService.getUsuario(solicitacao.usuarioWorkflowId).pipe(
              catchError(() => of({ nome: 'Usuário não encontrado' }))
            ),
            this.programaService.getPrograma(solicitacao.programaId).pipe(
              catchError(() => of({ nome: 'Programa não encontrado' }))
            ),
            this.usuarioService.getUsuario(solicitacao.solicitanteId).pipe(
              catchError(() => of({ nome: 'Solicitante não encontrado' }))
            )
          ]).pipe(
            map(([usuario, programa, solicitante]) => {
              const usuarioObj = Array.isArray(usuario) ? usuario[0] : usuario;
              const programaObj = Array.isArray(programa) ? programa[0] : programa;
              const solicitanteObj = Array.isArray(solicitante) ? solicitante[0] : solicitante;

              solicitacao.usuarioWorkflowNome = usuarioObj?.nome ?? 'Não encontrado';
              solicitacao.programaNome = programaObj?.nome ?? 'Não encontrado';
              solicitacao.solicitanteWorkflowNome = solicitanteObj?.nome ?? 'Não encontrado';
              return solicitacao;
            })
          )
        );

        return forkJoin(requests);
      })
    );
  }

 getSolicitacoesPendentes(): Observable<SolicitacaoAcessoPrograma[]> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  const url = `${this.baseUrl}/solicitacoes-pendentes-aprovacao`;

  return this.http.get<SolicitacaoAcessoPrograma[]>(url, { headers }).pipe(
    switchMap(solicitacoes => {
      if (!solicitacoes || solicitacoes.length === 0) return of([]);

      const requests = solicitacoes.map(solicitacao =>
        forkJoin([
          this.usuarioService.getUsuario(solicitacao.usuarioWorkflowId).pipe(
            catchError(() => of({ nome: 'Usuário não encontrado' }))
          ),
          this.programaService.getPrograma(solicitacao.programaId).pipe(
            catchError(() => of({ nome: 'Programa não encontrado' }))
          ),
          this.usuarioService.getUsuario(solicitacao.solicitanteId).pipe(
            catchError(() => of({ nome: 'Solicitante não encontrado' }))
          )
        ]).pipe(
          map(([usuario, programa, solicitante]) => {
            const usuarioObj = Array.isArray(usuario) ? usuario[0] : usuario;
            const programaObj = Array.isArray(programa) ? programa[0] : programa;
            const solicitanteObj = Array.isArray(solicitante) ? solicitante[0] : solicitante;

            solicitacao.usuarioWorkflowNome = usuarioObj?.nome ?? 'Não encontrado';
            solicitacao.programaNome = programaObj?.nome ?? 'Não encontrado';
            solicitacao.solicitanteWorkflowNome = solicitanteObj?.nome ?? 'Não encontrado';
            return solicitacao;
          })
        )
      );

      return forkJoin(requests);
    })
  );
}

decidirSolicitacao(id: number, tipo: number, aprovado: boolean, observacao: string): Observable<any> {
  const url = `${this.baseUrl}/${id}/decisao`;
  const body = { tipo, aprovado, observacao };
  const token = localStorage.getItem('token'); // ou de onde você guarda
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
  return this.http.put(url, body, { headers });
}

  criarSolicitacao(dados: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };

    return this.http.post('http://localhost:5000/api/SolicitacaoAcessoPrograma', dados, headers);
  }
}
function getSolicitacoesPendentes() {
  throw new Error('Function not implemented.');
}



