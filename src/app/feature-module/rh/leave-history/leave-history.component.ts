
import { Component, OnInit } from '@angular/core';
import { routes } from '../../../shared/routes/routes';
import { ActivatedRoute } from '@angular/router';
import { LeaveService } from '../../../services/leave/leave.service';
import { Leave } from '../../../models/leave';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user/user.service';
import { User } from '../../../models/user';
import { LeaveBalance } from '../../../models/leaveBalance';
import { AdvanceRequest } from '../../../models/advanceRequest';
import { OtherRequest } from '../../../models/otherRequest';
import { RequestAdvanceService } from '../../../services/request-advance/request-advance.service';
import { OtherRequestService } from '../../../services/other-request/other-request.service';
import { LoginService } from '../../../services/user/login.service';

@Component({
  selector: 'app-leave-history',
  standalone: false,
  templateUrl: './leave-history.component.html',
  styleUrl: './leave-history.component.scss',
})
export class LeaveHistoryComponent implements OnInit {
  public routes = routes;
  employeeId!: number;
  //leaves: Leave[] = [];
  loading = true;
  user!: User;
  error: string | null = null;
  leaveBalance!: LeaveBalance;
  loadingBalance = false;
  constructor(
    private route: ActivatedRoute,
    private leaveService: LeaveService,
    private userService: UserService,
    private advanceService: RequestAdvanceService,
    private otherRequestService: OtherRequestService,
    private authService: LoginService,
  ) {}
  leaves$!: Observable<Leave[]>;
  advances$!: Observable<AdvanceRequest[]>;
  otherRequest$!: Observable<OtherRequest[]>;
  userRole: string = '';
  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.userRole = user?.role || '';
    });
    this.employeeId = +this.route.snapshot.paramMap.get('id')!;
    // this.fetchLeaveHistory();
    this.leaves$ = this.leaveService.getLeaveHistoryByUser(this.employeeId);
    this.advances$ = this.advanceService.getAdvanceHistoryByUser(
      this.employeeId
    );
    this.otherRequest$ = this.otherRequestService.getOtherRequestHistoryByUser(
      this.employeeId
    );
    this.loadUserById(this.employeeId);
    this.fetchLeaveBalance(this.employeeId);
  }
  // fetchLeaveHistory() {
  //   this.loading = true;
  //   this.leaveService.getLeaveHistoryByUser(this.employeeId).subscribe({
  //     next: (leaves) => {
  //     this.leaves = leaves;
  //     this.loading = false;
  //   },
  //     error: (err) => {
  //       this.error = "Erreur lors de la récupération des congés";
  //       this.loading = false;
  //     }
  //   });
  // }
  formatDateFR(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    const dateObj = new Date(`${year}-${month}-${day}`);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }
  loadUserById(id: number): void {
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.user = user;
      },
      error: (err) => {
        console.error('Erreur lors du chargement :', err);
      },
    });
  }
  fetchLeaveBalance(userId: number) {
    this.loadingBalance = true;
    this.leaveService.getLeaveBalanceByUser(userId).subscribe({
      next: (data) => {
        this.leaveBalance = data;
        this.loadingBalance = false;
      },
      error: () => {
        this.loadingBalance = false;
      },
    });
  }
}
