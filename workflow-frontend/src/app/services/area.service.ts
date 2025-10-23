import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Area } from '../models/Area';
import { AuthService } from '../auth.service';
import { UsuarioWorkflowService } from './usuario-workflow.service';

@Injectable({ providedIn: 'root' })
export class AreaService {
  private baseUrl = 'http://localhost:5000/api/area';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private usuarioService: UsuarioWorkflowService
  ) {}

getAreas(): Observable<Area[]> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

  return this.http.get<Area[]>(this.baseUrl, { headers }).pipe(
    switchMap(areas => {
      if (!areas || areas.length === 0) return of([]);

      const requests = areas.map(area => {
        if (!area.responsavelAreaId) {
          
          return of({ ...area, responsavelAreaNome: 'Não definido' });
        }

        return this.usuarioService.getUsuario(area.responsavelAreaId).pipe(
          map(usuario => {
            const usuarioObj = Array.isArray(usuario) ? usuario[0] : usuario;
            return {
              ...area,
              responsavelAreaNome: usuarioObj?.nome ?? 'Não encontrado'
            };
          }),
          catchError(() => of({ ...area, responsavelAreaNome: 'Não encontrado' }))
        );
      });

      return forkJoin(requests);
    }),
    catchError(err => {
      console.error('Erro ao buscar áreas:', err);
      return of([]);
    })
  );
}

criarArea(dados: Partial<Area>) {
  const token = this.authService.getToken();
  const headers = { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
  return this.http.post('http://localhost:5000/api/Area', dados, headers);
}



atualizarArea(id: number, area: Area): Observable<Area> {
  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });

  return this.http.put<Area>(`${this.baseUrl}/${id}`, area, { headers });
}


deletarArea(id: number): Observable<void> {
      const token = this.authService.getToken();
  const headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  });
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers });
  }

}