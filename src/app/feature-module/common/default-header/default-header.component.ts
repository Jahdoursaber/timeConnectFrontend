import { Component, OnInit } from '@angular/core';
import { MainMenu, Menu } from '../../../shared/models/models';
import { DataService } from '../../../shared/data/data.service';
import { CommonService } from '../../../shared/common/common.service';
import { NavigationEnd, Router } from '@angular/router';
import { SideBarService } from '../../../shared/side-bar/side-bar.service';
import { routes } from '../../../shared/routes/routes';
import { LoginService } from '../../../services/user/login.service';
import { User } from '../../../models/user';
import { NotificationService, UiNotif } from '../../../services/notification/notification.service';

@Component({
    selector: 'app-default-header',
    templateUrl: './default-header.component.html',
    styleUrl: './default-header.component.scss',
    standalone: false
})
export class DefaultHeaderComponent implements OnInit{
  showSubMenusTab = true;
  public multilevel: boolean[] = [false, false, false];
  openMenuItem: any = null;
  openSubmenuOneItem: any = null;
  base = 'dashboard';
  public page = '';
  last = '';
  public routes = routes;
  public miniSidebar = false;
  public baricon = false;
  side_bar_data: MainMenu[] = [];
  userAuthentified: User | null = null;
  unread = 0;
  latest: UiNotif[] = [];
  constructor(
    private data: DataService,
    private sideBar: SideBarService,
    private common: CommonService,
    private router: Router,
    private loginService: LoginService,
    private notif: NotificationService

  ) {
    this.common.base.subscribe((res: string) => {
      this.base = res;
    });
    this.common.page.subscribe((res: string) => {
      this.page = res;
    });
    this.common.page.subscribe((res: string) => {
      this.last = res;
    });
    this.sideBar.toggleSideBar.subscribe((res: string) => {
      if (res === 'true') {
        this.miniSidebar = true;
      } else {
        this.miniSidebar = false;
      }
    });
    router.events.subscribe((event: object) => {
      if (event instanceof NavigationEnd) {
        const splitVal = event.url.split('/');
        this.base = splitVal[1];
        this.page = splitVal[2];
        if (
          this.base === 'components' ||
          this.page === 'tasks' ||
          this.page === 'email'
        ) {
          this.baricon = false;
          localStorage.setItem('baricon', 'false');
        } else {
          this.baricon = true;
          localStorage.setItem('baricon', 'true');
        }
      }
    });
    if (localStorage.getItem('baricon') == 'true') {
      this.baricon = true;
    } else {
      this.baricon = false;
    }

  }
  async ngOnInit() {
    this.getUserAuthentified();

    await this.notif.init();
  this.notif.unreadCount$.subscribe(c => this.unread = c);
  this.notif.latest$.subscribe(list => this.latest = list);
  }
  async openItem(n: UiNotif) {
    if (n.id) {
      await this.notif.markAsRead(n.id);
    }
    if (n.url) {
      this.router.navigateByUrl(n.url);
    }
  }
  public toggleSideBar(): void {
    this.sideBar.switchSideMenuPosition();
  }
  elem = document.documentElement;

  public togglesMobileSideBar(): void {
    this.sideBar.switchMobileSideBarPosition();
  }
  public menuToggle() {
    this.showSubMenusTab = !this.showSubMenusTab;
  }
  public expandSubMenus(menu: Menu): void {
    sessionStorage.setItem('menuValue', menu.menuValue);
    this.side_bar_data.map((mainMenus: MainMenu) => {
      mainMenus.menu.map((resMenu: Menu) => {
        // collapse other submenus which are open
        if (resMenu.menuValue === menu.menuValue) {
          menu.showSubRoute = !menu.showSubRoute;
          if (menu.showSubRoute === false) {
            sessionStorage.removeItem('menuValue');
          }
        } else {
          resMenu.showSubRoute = false;
        }
      });
    });
  }
    public miniSideBarMouseHover(position: string): void {
      this.sideBar.toggleSideBar.subscribe((res: string) => {
        if (res === 'true' || res === 'true') {
          if (position === 'over') {
            this.sideBar.expandSideBar.next(true);
            this.showSubMenusTab = false;
          } else {
            this.sideBar.expandSideBar.next(false);
            this.showSubMenusTab = true;
          }
        }
      });
    }
    ngOnDestroy(): void {

    }
    miniSideBarBlur(position: string) {
      if (position === 'over') {
        this.sideBar.expandSideBar.next(true);
      } else {
        this.sideBar.expandSideBar.next(false);
      }
    }

    miniSideBarFocus(position: string) {
      if (position === 'over') {
        this.sideBar.expandSideBar.next(true);
      } else {
        this.sideBar.expandSideBar.next(false);
      }
    }
    public submenus = false;
    openSubmenus() {
      this.submenus = !this.submenus;
    }

    openMenu(menu: any): void {
      if (this.openMenuItem === menu) {
        this.openMenuItem = null;
      } else {
        this.openMenuItem = menu;
      }
    }
    openSubmenuOne(subMenus: any): void {
      if (this.openSubmenuOneItem === subMenus) {
        this.openSubmenuOneItem = null;
      } else {
        this.openSubmenuOneItem = subMenus;
      }
    }
    getUserAuthentified(): void {
    this.loginService.user$.subscribe(user => {
    this.userAuthentified = user;
    // Tu peux aussi faire d'autres traitements ici (ex: stocker le rôle, etc.)
  });


}
onLogout() {
    this.loginService.logout().subscribe({
      next: () => {
        // Nettoie si tu as du stockage local en plus
        // localStorage.removeItem('user');
        // Redirige l’utilisateur par exemple sur la page de login
        this.router.navigate(['/login-2']);
      },
      error: () => {
        // Optionnel: afficher un message d’erreur
        alert('Erreur lors de la déconnexion');
      }
    });
  }

}
