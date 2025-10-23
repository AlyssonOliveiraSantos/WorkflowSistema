// services/programa.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { Programa } from '../models/Programa';
import { Area } from '../models/Area';
import { AuthService } from '../auth.service';
import { AreaService } from './area.service';

@Injectable({ providedIn: 'root' })
export class ProgramaService {
  private baseUrl = 'http://localhost:5000/api/Programa';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private areaService: AreaService
  ) {}

  private getHeaders() {
    const token = this.authService.getToken();
    return { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  }

  // Retorna programas com áreaNome já mapeado
  getProgramas(query: string = ''): Observable<Programa[]> {
    return forkJoin({
      programas: this.http.get<Programa[]>(`${this.baseUrl}?nome=${query}`, this.getHeaders()),
      areas: this.areaService.getAreas()
    }).pipe(
      map(({ programas, areas }) => 
        programas.map(p => {
          const area = areas.find(a => a.id === p.areaId);
          return {
            ...p,
            areaNome: area ? area.nome : 'Não definida'
          };
        })
      ),
      catchError(err => {
        console.error('Erro ao buscar programas:', err);
        return of([]);
      })
    );
  }

  getPrograma(id: number): Observable<Programa> {
    return this.http.get<Programa>(`${this.baseUrl}/${id}`, this.getHeaders());
  }

  criarPrograma(dados: Partial<Programa>) {
  const token = this.authService.getToken();
  const headers = { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  return this.http.post('http://localhost:5000/api/Programa', dados, headers);
  }

  atualizarPrograma(id: number, programa: Programa): Observable<Programa> {
    return this.http.put<Programa>(`${this.baseUrl}/${id}`, programa, this.getHeaders());
  }

  deletarPrograma(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, this.getHeaders());
  }
}
