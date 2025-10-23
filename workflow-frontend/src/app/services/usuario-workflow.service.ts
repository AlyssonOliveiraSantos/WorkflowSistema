// services/usuario-workflow.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioWorkflow } from '../models/UsuarioWorkflow';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class UsuarioWorkflowService {
  private baseUrl = 'http://localhost:5000/api/UsuarioWorkflow';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }
  
 getUsuarios(query: string = ''): Observable<UsuarioWorkflow[]> {
    return this.http.get<UsuarioWorkflow[]>(`${this.baseUrl}?nome=${query}`, this.getHeaders());
  }

  getUsuario(id: number): Observable<UsuarioWorkflow> {
    return this.http.get<UsuarioWorkflow>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  criarUsuario(usuario: UsuarioWorkflow): Observable<UsuarioWorkflow> {
    return this.http.post<UsuarioWorkflow>(this.baseUrl, usuario, this.getHeaders());
  }

  atualizarUsuario(id: number, usuario: UsuarioWorkflow): Observable<UsuarioWorkflow> {
    return this.http.put<UsuarioWorkflow>(`${this.baseUrl}/${id}`, usuario, this.getHeaders());
  }

  deletarUsuario(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}



