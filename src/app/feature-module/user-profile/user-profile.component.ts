import { Component, OnInit } from '@angular/core';
import { breadCrumbItems } from '../../shared/models/models';
import { LoginService } from '../../services/user/login.service';
import { User } from '../../models/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { UserService } from '../../services/user/user.service';
import { ToastUtilService } from '../../services/toastUtil/toast-util.service';
@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  breadCrumbItems: breadCrumbItems[] = [];
  userAuthentified: User | null = null;
  profileForm!: FormGroup;
  isLoading = false;
  user$!: Observable<User | null>;
  private destroy$ = new Subject<void>();
  public password: boolean[] = [false, false, false];
  togglePassword(index: number) {
    this.password[index] = !this.password[index];
  }
  constructor(
    private loginService: LoginService,
    private fb: FormBuilder,
    private userService: UserService,
    private toast: ToastUtilService
  ) {
    this.breadCrumbItems = [{ label: 'Profile', active: true }];
  }
  ngOnInit() {
    this.profileForm = this.fb.group({
      first_name: [''],
      last_name: [''],
      email: ['', [Validators.email]],
      phone: [''],
      address: [''],
      postal_address: [''],
    });
    this.getUserAuthentified();
    this.getUserAuthentified();
  }

  getUserAuthentified() {
    this.loginService.user$
      .pipe(
        filter((user): user is User => !!user), // n'applique que si user n'est pas null
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.profileForm.patchValue(user);
      });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.isLoading = true;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.toast.showSuccess('Modification effectuée avec succès ✅');
        this.isLoading = false;
      },
      error: () => {
        console.log('Erreur lors de la mise à jour du profil');
        this.isLoading = false;
      },
    });
  }
}
