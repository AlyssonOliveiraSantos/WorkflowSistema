// services/usuario.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Usuario } from '../models/Usuario';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private baseUrl = 'http://localhost:5000/api/Auth';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  getUsuarios(query: string = ''): Observable<Usuario[]> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Usuario[]>(`${this.baseUrl}?nome=${query}`, { headers });
  }

  getUsuario(id: number): Observable<Usuario> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Usuario>(`${this.baseUrl}?id=${id}`, { headers });
  }

criarUsuario(dados: { username: string; password: string, confirmPassword: string, email: string }): Observable<string> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  return this.http.post<string>(
    'http://localhost:5000/api/Auth/cadastro',
    dados,
    {
      headers,
      responseType: 'text' as 'json' // força o Angular aceitar texto
    }
  );
}

  atualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario, this.getHeaders());
  }

deletarUsuario(id: number): Observable<string> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
  });

  return this.http.delete(`http://localhost:5000/api/Auth/${id}`, { 
    headers,
    responseType: 'text'  // importante para aceitar texto ao invés de JSON
  });
}
}
