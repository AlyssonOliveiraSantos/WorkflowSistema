// services/programa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Programa } from '../models/Programa';
import { AuthService } from '../auth.service';

@Injectable({ providedIn: 'root' })
export class ProgramaService {
  private baseUrl = 'http://localhost:5000/api/Programa';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

getPrograma(id: number): Observable<Programa> {
    return this.http.get<Programa>(`${this.baseUrl}/${id}`, this.getHeaders());
}


  criarPrograma(programa: Programa): Observable<Programa> {
    return this.http.post<Programa>(this.baseUrl, programa, this.getHeaders());
  }

  atualizarPrograma(id: number, programa: Programa): Observable<Programa> {
    return this.http.put<Programa>(`${this.baseUrl}/${id}`, programa, this.getHeaders());
  }

  deletarPrograma(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
