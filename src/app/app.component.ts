import { Component, OnInit } from '@angular/core';
import { Router, Event as RouterEvent, NavigationStart } from '@angular/router';
import { CommonService } from './shared/common/common.service';
import { url } from './shared/models/models';
import { setTheme } from 'ngx-bootstrap/utils';
import { LoginService } from './services/user/login.service';
import { NotificationService } from './services/notification/notification.service';
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit{
  title = 'Timeconnect';
  base = '';
  page = '';
  last = '';
  notifications: any[] = [];
  constructor(
    private common: CommonService,
    private router: Router,
    private auth:LoginService,
    private notificationService: NotificationService
  ) {
    setTheme('bs5');
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.last.subscribe((res: string) => {
      this.last = res;
    });
    this.router.events.subscribe((data: RouterEvent) => {
      if (data instanceof NavigationStart) {
        this.getRoutes(data);
      }
    });
  }
  ngOnInit(): void {
    this.auth.fetchUser().subscribe();
    this.notificationService.notifications$.subscribe(data => {
    this.notifications = data;
  });

  // Ajoute ceci juste pour tester l'affichage d'un toast
  setTimeout(() => {
    // Importer ton service ToastUtilService puis :
    // this.toast.showInfo('Test PrimeNG Toast', 'Test');
  }, 9000);
  }
  public getRoutes(events: url) {
    const splitVal = events.url.split('/');
    this.common.base.next(splitVal[1]);
    this.common.page.next(splitVal[2]);
    this.common.last.next(splitVal[3]);
  }
}
