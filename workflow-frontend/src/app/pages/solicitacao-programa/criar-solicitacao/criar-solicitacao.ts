import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { SolicitacaoAcessoService } from '../../../services/solicitacao-acesso-programa.service';
import { UsuarioWorkflowService } from '../../../services/usuario-workflow.service';
import { ProgramaService } from '../../../services/programa.service';
import { AuthService } from '../../../auth.service';

interface Usuario {
  id: number;
  nome: string;
}

interface Programa {
  id: number;
  nome: string;
}

@Component({
  selector: 'app-criar-solicitacao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './criar-solicitacao.html',
  styleUrls: ['./criar-solicitacao.scss']
})
export class CriarSolicitacaoComponent {
  form!: FormGroup;
  loading = false;
  success = false;
  errorMsg = '';

  usuarios: Usuario[] = [];
  todosUsuarios: Usuario[] = [];
  programas: Programa[] = [];
  todosProgramas: Programa[] = [];

  showUsuariosDropdown = false;
  showProgramasDropdown = false;

  permissoesList = [
    { label: 'Incluir', value: 1 },
    { label: 'Consultar', value: 2 },
    { label: 'Modificar', value: 4 },
    { label: 'Excluir', value: 8 }
  ];
  permissoesSelecionadas: number[] = [];
  showPermissoesDropdown = false;

  constructor(
    private fb: FormBuilder,
    private solicitacaoService: SolicitacaoAcessoService,
    private usuarioService: UsuarioWorkflowService,
    private programaService: ProgramaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      usuarioWorkflowId: ['', Validators.required],
      programaId: ['', Validators.required],
      observacao: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.carregarUsuarios();
    this.carregarProgramas();
  }


  carregarUsuarios() {
    this.usuarioService.getUsuarios('').subscribe(res => {
      this.todosUsuarios = res;
      this.usuarios = res.slice(0, 5);
    });
  }

  buscarUsuarios(query: string) {
    if (!query) {
      this.usuarios = this.todosUsuarios.slice(0, 5);
    } else {
      this.usuarios = this.todosUsuarios.filter(u =>
        u.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showUsuariosDropdown = true;
  }

  selecionarUsuario(usuario: Usuario) {
    this.form.patchValue({ usuarioWorkflowId: usuario.id });
    this.showUsuariosDropdown = false;
  }

  getUsuarioNome(): string {
    const usuario = this.todosUsuarios.find(u => u.id === this.form.value.usuarioWorkflowId);
    return usuario ? usuario.nome : '';
  }


  carregarProgramas() {
    this.programaService.getProgramas('').subscribe(res => {
      this.todosProgramas = res;
      this.programas = res.slice(0, 5);
    });
  }

  buscarProgramas(query: string) {
    if (!query) {
      this.programas = this.todosProgramas.slice(0, 5);
    } else {
      this.programas = this.todosProgramas.filter(p =>
        p.nome.toLowerCase().includes(query.toLowerCase())
      );
    }
    this.showProgramasDropdown = true;
  }

  selecionarPrograma(programa: Programa) {
    this.form.patchValue({ programaId: programa.id });
    this.showProgramasDropdown = false;
  }

  getProgramaNome(): string {
    const programa = this.todosProgramas.find(p => p.id === this.form.value.programaId);
    return programa ? programa.nome : '';
  }


  togglePermissao(value: number) {
    const index = this.permissoesSelecionadas.indexOf(value);
    if (index > -1) this.permissoesSelecionadas.splice(index, 1);
    else this.permissoesSelecionadas.push(value);
  }

  isSelecionado(value: number): boolean {
    return this.permissoesSelecionadas.includes(value);
  }

  calcularPermissoes(): number {
    return this.permissoesSelecionadas.reduce((acc, curr) => acc + curr, 0);
  }

  get permissoesTexto(): string {
    return this.permissoesList
      .filter(p => this.isSelecionado(p.value))
      .map(p => p.label)
      .join(', ');
  }


  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.success = false;
    this.errorMsg = '';

    const payload = {
      usuarioWorkflowId: this.form.value.usuarioWorkflowId,
      programaId: this.form.value.programaId,
      observacao: this.form.value.observacao,
      permissoes: this.calcularPermissoes()
    };

    this.solicitacaoService.criarSolicitacao(payload).subscribe({
      next: () => {
        const token = this.authService.getToken();
        const headers = { headers: new HttpHeaders({ 'Authorization': `Bearer ${token}` }) };
        this.success = true;
        this.form.reset();
        this.permissoesSelecionadas = [];
        this.loading = false;
      },
      error: (err: unknown) => {
        this.errorMsg = 'Erro ao salvar solicitação';
        console.error(err);
        this.loading = false;
      }
    });
  }
}
