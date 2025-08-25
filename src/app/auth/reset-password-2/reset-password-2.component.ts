import { Component, Renderer2 } from '@angular/core';
import { routes } from '../../shared/routes/routes';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoginService } from '../../services/user/login.service';

@Component({
    selector: 'app-reset-password-2',
    templateUrl: './reset-password-2.component.html',
    styleUrl: './reset-password-2.component.scss',
    standalone: false
})

export class ResetPassword2Component {
  public routes = routes;
  errors: any = {};
  loading = false;
  success = false;
  public Object = Object;
  passwordForm: FormGroup;

  constructor(
    private router: Router,
    private renderer:Renderer2,
    private fb: FormBuilder,
    private authService: LoginService,

  ){
    this.passwordForm = this.fb.group({
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      new_password_confirmation: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

   // Validation personnalisée pour vérifier que les mots de passe correspondent
   passwordMatchValidator(form: FormGroup) {
    const password = form.get('new_password')?.value;
    const confirmPassword = form.get('new_password_confirmation')?.value;

    if (password !== confirmPassword) {
      form.get('new_password_confirmation')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  navigation(){
    this.router.navigate([routes.success2])
  }

  password: boolean[] = [false, false]; // Add more as needed

  togglePassword(index: number): void {
    this.password[index] = !this.password[index];
  }
  ngOnInit():void{
    this.renderer.addClass(document.body,'bg-white');
  }
  ngOnDestroy():void{
    this.renderer.removeClass(document.body,'bg-white');
  }
  passwordValue: string = '';
  strengthLevel: string = '';
  passwordInfoMessage: string | null = null;
  passwordInfoColor: string = '';

  private poorRegExp = /[a-z]/;
  private weakRegExp = /(?=.*?[0-9])/;
  private strongRegExp = /(?=.*?[#?!@$%^&*-])/;
  private whitespaceRegExp = /^$|\s+/;

  checkPasswordStrength(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const password = inputElement.value;
    this.passwordValue = password;

    const passwordLength = password.length;
    const hasPoor = this.poorRegExp.test(password);
    const hasWeak = this.weakRegExp.test(password);
    const hasStrong = this.strongRegExp.test(password);
    const hasWhitespace = this.whitespaceRegExp.test(password);

    if (password === '') {
      this.resetStrength();
      return;
    }

    if (hasWhitespace) {
      this.passwordInfoMessage = 'Whitespaces are not allowed';
      this.passwordInfoColor = 'red';
      this.strengthLevel = '';
      return;
    }

    if (passwordLength < 8) {
      this.strengthLevel = 'poor';
      this.passwordInfoMessage = 'Weak. Must contain at least 8 characters.';
      this.passwordInfoColor = 'red';
    } else if (hasPoor || hasWeak || hasStrong) {
      this.strengthLevel = 'weak';
      this.passwordInfoMessage = 'Average. Must contain at least 1 letter or number.';
      this.passwordInfoColor = '#FFB54A';
    }

    if (passwordLength >= 8 && hasPoor && (hasWeak || hasStrong)) {
      this.strengthLevel = 'strong';
      this.passwordInfoMessage = 'Almost strong. Must contain a special symbol.';
      this.passwordInfoColor = '#1D9CFD';
    }

    if (passwordLength >= 8 && hasPoor && hasWeak && hasStrong) {
      this.strengthLevel = 'heavy';
      this.passwordInfoMessage = 'Awesome! You have a secure password.';
      this.passwordInfoColor = '#159F46';
    }
  }


  private resetStrength(): void {
    this.strengthLevel = '';
    this.passwordInfoMessage = null;
  }

  submitForm() {
    this.errors = {};
    this.success = false;

    if (this.passwordForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.passwordForm.controls).forEach(key => {
        this.passwordForm.get(key)?.markAsTouched();
      });

      // Ajouter des erreurs de validation frontales si nécessaire
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.errors.new_password_confirmation = ['Les mots de passe ne correspondent pas'];
      }

      if (this.passwordForm.get('new_password')?.hasError('minlength')) {
        this.errors.new_password = ['Le mot de passe doit contenir au moins 8 caractères'];
      }

      return;
    }

    this.loading = true;

    const { new_password, new_password_confirmation } = this.passwordForm.value;

    this.authService.changePassword(new_password, new_password_confirmation)
      .subscribe({
        next: () => {
          this.loading = false;
          this.success = true;
          // Rediriger vers la page de succès après un bref délai
          setTimeout(() => {
            this.router.navigate([this.routes.success2]);
          }, 2000);
        },
        error: (errors) => {
          this.loading = false;
          this.errors = errors;
          console.error('Erreurs:', errors);
        }
      });
  }


}
