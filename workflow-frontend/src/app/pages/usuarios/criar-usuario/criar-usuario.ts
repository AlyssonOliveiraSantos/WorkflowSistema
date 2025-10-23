import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { UsuarioService } from '../../../services/usuario.service';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service';
import { UsuarioWorkflow } from '../../../models/UsuarioWorkflow';

@Component({
  selector: 'app-criar-usuario',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './criar-usuario.html',
  styleUrls: ['./criar-usuario.scss']
})
export class CriarUsuarioComponent implements OnInit {
  form!: FormGroup;
  loading = false;
  success = false;
  errorMsg = '';

  usuariosWorkflow: UsuarioWorkflow[] = [];
  todasUsuariosWorkflow: UsuarioWorkflow[] = [];
  showWorkflowDropdownEditar = false;
  usuarioWorkflowSelecionado?: UsuarioWorkflow;

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private usuarioWorkflowService: UsuarioWorkflowService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    // Carrega os workflows disponíveis
    this.usuarioWorkflowService.getUsuarios().subscribe({
      next: (wfs) => {
        this.todasUsuariosWorkflow = wfs;
        this.usuariosWorkflow = wfs.slice(0, 5);
      },
      error: err => console.error('Erro ao carregar workflows:', err)
    });
  }

  buscarUsuariosWorkflow(query: string) {
    this.usuariosWorkflow = !query
      ? this.todasUsuariosWorkflow.slice(0, 5)
      : this.todasUsuariosWorkflow.filter(w =>
          w.nome.toLowerCase().includes(query.toLowerCase())
        );
    this.showWorkflowDropdownEditar = true;
  }

  selecionarWorkflowEditar(workflow: UsuarioWorkflow) {
    this.usuarioWorkflowSelecionado = workflow;
    this.showWorkflowDropdownEditar = false;
  }

  getWorkflowNomeEditar(): string {
    return this.usuarioWorkflowSelecionado ? this.usuarioWorkflowSelecionado.nome : '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.errorMsg = 'Preencha todos os campos obrigatórios';
      return;
    }

    if (!this.usuarioWorkflowSelecionado) {
      this.errorMsg = 'Selecione um workflow';
      return;
    }

    this.loading = true;
    this.success = false;
    this.errorMsg = '';

    const payload = {
      username: this.form.value.username,
      password: this.form.value.password,
      confirmPassword: this.form.value.confirmPassword,
      email: this.form.value.email,
      usuarioWorkflowId: this.usuarioWorkflowSelecionado.id
    };

    this.usuarioService.criarUsuario(payload).subscribe({
      next: () => {
        this.success = true;
        this.form.reset();
        this.usuarioWorkflowSelecionado = undefined;
        this.loading = false;
      },
      error: (err: unknown) => {
        console.error(err);
        this.errorMsg = 'Erro ao criar usuário';
        this.loading = false;
      }
    });
  }
}
