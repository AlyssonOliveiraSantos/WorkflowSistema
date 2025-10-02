// src/app/pages/login/login.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.error = '';
    if (!this.username || !this.password) {
      this.error = 'Preencha usuário e senha';
      return;
    }

    this.auth.login(this.username, this.password).subscribe({
      next: (res: LoginResponse) => {
        console.log('Login bem-sucedido');
        console.log('Token:', res.token);
        console.log('RefreshToken:', res.refreshToken);
        console.log('Perfil:', this.auth.getPerfil());

        // Redireciona para a página de dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error = 'Usuário ou senha inválidos';
        console.error(err);
      }
    });
  }
}
