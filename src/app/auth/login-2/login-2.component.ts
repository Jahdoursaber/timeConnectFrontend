import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';
import { LoginService } from '../../services/user/login.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../models/user';
import { first } from 'rxjs';

@Component({
  selector: 'app-login-2',
  templateUrl: './login-2.component.html',
  styleUrl: './login-2.component.scss',
  standalone: false,
})
export class Login2Component implements OnInit, OnDestroy {
  public routes = routes;
  password: boolean[] = [false, false];
  loginForm!: FormGroup;
  errorMessage = '';
  loading = false;
  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private loginService: LoginService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'bg-white');
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
    
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'bg-white');
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.errorMessage = '';
    this.loading = true; // Indiquer que la connexion est en cours
    const { email, password } = this.loginForm.value;

    this.loginService
      .login(email, password)
      .pipe(first())
      .subscribe({
        next: (user: User) => {
          console.log(user.change_password_at);
          if (user.change_password_at === null) {
            this.router.navigate(['/reset-password-2']);
          } else if (user.roles?.includes('responsablePV')) {
            this.router.navigate(['/vehicle-manager/dashboard']);
          } else if (user.roles?.includes('RH')) {
            this.router.navigate(['/rh/dashboard']);
          } else if (user.roles?.includes('superviseur')) {
            this.router.navigate(['/superviseur/dashboard']);
          } else {

            this.router.navigate(['/login-2']);
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Erreur brute lors de la requête de login :', err);
          console.error('Code HTTP :', err.status);
          console.error('Contenu complet de err.error :', err.error);

          this.errorMessage = err.error?.message || 'Erreur de connexion.';
          this.loading = false;
          setTimeout(() => this.errorMessage = '', 6000);
        },
        complete: () => {
          this.loading = false;
        },
      });
  }
}
