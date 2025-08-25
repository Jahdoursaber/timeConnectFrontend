import { Injectable } from '@angular/core';
import { routes } from '../routes/routes';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { MainMenu, SideBar, SideBarMenu } from '../models/models';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private collapseSubject = new BehaviorSubject<boolean>(false);
  collapse$ = this.collapseSubject.asObservable();

  toggleCollapse() {
    this.collapseSubject.next(!this.collapseSubject.value);
  }
  constructor(private http: HttpClient) {}
 

  public sideBar: SideBar[] = [
    {
      tittle: 'Main',
      icon: 'airplay',
      showAsTab: true,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Dashboard',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'smart-home',
          base: 'dashboard',
          route: routes.dashboardRH,
          roles: ['RH'],
          materialicons: 'start',
          dot: true,
          subMenus: [],
        },
        {
          menuValue: 'Dashboard',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'smart-home',
          base: 'dashboard',
          route: routes.dashboardSup,
          roles: ['superviseur'],
          materialicons: 'start',
          dot: true,
          subMenus: [],
        },
        {
          menuValue: 'Dashboard',
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'smart-home',
          base: 'dashboard',
          route: routes.dashboardRPA,
          roles: ['responsablePV'],
          materialicons: 'start',
          dot: true,
          subMenus: [],
        },

      ],
    },


    {
      tittle: 'Personnels',
      icon: 'file',
      showAsTab: false,
      roles: ['RH', 'superviseur'],
      separateRoute: false,
      menu: [
        {
          menuValue: 'Personnels',
          hasSubRoute: true,
          showSubRoute: false,
          roles: ['RH', 'superviseur'],
          icon: 'users',
          base: 'personnels',
          materialicons: 'people',
          subMenus: [
            {
              menuValue: 'Rhs',
              route: routes.rhs,
              base: 'rhs',
              roles: ['RH'],
            },
            {
              menuValue: 'Superviseurs',
              route: routes.superviseurs,
              base: 'superviseurs',
              roles: ['RH', 'superviseur'],
            },
            {
              menuValue: 'Techniciens',
              route: routes.technicienSuperviseur,
              base: 'techniciens',
              roles: ['superviseur'],
            },
            {
              menuValue: 'Techniciens',
              route: routes.techniciens,
              base: 'techniciens',
              roles: ['RH'],
            },
            {
              menuValue: 'Responsables parc',
              route: routes.responsablePv,
              base: 'responsables-parc-auto',
              roles: ['RH', 'superviseur'],
            },
          ],
        },
      ],
    },
    //personnel superviseurs
    {
      tittle: 'Entreprise/Activités',
      icon: 'file',
      roles: ['RH'],
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Entreprise/Activités',
          hasSubRoute: true,
          roles: ['RH'],
          showSubRoute: false,
          icon: 'building',
          base: 'entreprises',
          materialicons: 'people',
          subMenus: [
            {
              menuValue: 'Entreprises',
              route: routes.companies,
              base: 'companies',
            },
            {
              menuValue: 'Activités',
              route: routes.activities,
              base: 'activity',
            },
            {
              menuValue: 'Convention collectives',
              route: routes.collectives,
              base: 'collectives-agreements',
            },
            {
              menuValue: 'Postes de travail',
              route: routes.jobs,
              base: 'jobss',
            },
            {
              menuValue: 'Codes Apes',
              route: routes.apes,
              base: 'apes',
            },
          ],
        },
      ],
    },
    {
      tittle: 'Pointage/Congés',
      icon: 'file',
      roles: ['RH', 'superviseur'],
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Pointage/Congés',
          hasSubRoute: true,
          roles: ['RH', 'superviseur'],
          showSubRoute: false,
          icon: 'building',
          base: 'pointage',
          materialicons: 'people',
          subMenus: [
            {
              menuValue: 'Pointages',
              route: '',
              base: '',
            },
            {
              menuValue: 'Congés',
              route: routes.leavesCalendar,
              base: 'activity',
            },
          ],
        },
      ],
    },

    {
      tittle: 'Demandes',
      icon: 'file',
      showAsTab: false,
      roles: ['RH'],
      separateRoute: false,
      menu: [
        {
          menuValue: 'Demandes',
          hasSubRoute: true,
          showSubRoute: false,
          roles: ['RH'],
          icon: 'file-text',
          base: 'demandes',
          materialicons: 'description',
          subMenus: [
            {
              menuValue: "Demandes d'acomptes",
              route: routes.advanceRequest,
              base: 'advance-request',
            },
            {
              menuValue: 'Autres Demandes',
              route: routes.otherRequest,
              base: 'other-request',
            },
            {
              menuValue: 'Demandes de congés',
              route: routes.LeaveRH,
              base: 'leave-rh',
            },
          ],
        },
      ],
    },
    {
      tittle: 'Demandes',
      showAsTab: false,
      separateRoute: false,
      roles: ['superviseur'],
      menu: [
        {
          menuValue: 'Demandes de congés',
          route: routes.LeaveSuperviseur,
          base: 'profile',
          roles: ['superviseur'],
          hasSubRoute: false,
          showSubRoute: false,
          icon: 'user-circle',
          subMenus: [],
        },
      ],
    },
    {
      tittle: 'Historique des techniciens',
      icon: 'layers',
      showAsTab: false,
      roles: ['RH', 'superviseur'],
      separateRoute: false,
      menu: [
        {
          menuValue: 'Historique des techniciens',
          route: routes.technicianHistory,
          hasSubRoute: false,
          showSubRoute: false,
          roles: ['RH', 'superviseur'],
          icon: 'users-group',
          base: 'technicians-history',
          materialicons: 'person',
          subMenus: [],
        },

      ],
    },
    {
      tittle: 'Archives',
      icon: 'file',
      showAsTab: false,
      roles: ['RH'],
      separateRoute: false,
      menu: [
        {
          menuValue: 'Archives',
          hasSubRoute: true,
          showSubRoute: false,
          roles: ['RH'],
          icon: 'file-text',
          base: 'archives',
          materialicons: 'description',
          subMenus: [
            {
              menuValue: 'Ancien Personnels',
              route: routes.archiveUser,
              base: 'archive-user',
            },
          ],
        },
      ],
    },


    {
      tittle: 'Parc automobile',
      icon: 'file',
      roles: ['responsablePV'],
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Parc automobile',
          hasSubRoute: true,
          roles: ['responsablePV'],
          showSubRoute: false,
          icon: 'car',
          base: 'véhicules',
          materialicons: 'people',
          subMenus: [
            {
              menuValue: 'Véhicules',
              route: routes.vehicle,
              base: 'vehicles',
            },
            {
              menuValue: 'Marques',
              route: routes.vehicleBrand,
              base: 'vehicle-brands',
            },
            {
              menuValue: 'Modéles',
              route: routes.VehicleModel,
              base: 'vehicle-models',
            },
            {
              menuValue: 'Type de véhicules',
              route: routes.vehicleType,
              base: 'vehicle-types',
            },
          ],
        },
      ],
    },
    {
      tittle: 'Archives',
      icon: 'file',
      roles: ['responsablePV'],
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Archives',
          hasSubRoute: true,
          roles: ['responsablePV'],
          showSubRoute: false,
          icon: 'trashed',
          base: 'archives',
          materialicons: 'people',
          subMenus: [
            {
              menuValue: 'Véhicules',
              route: routes.vehicleArchive,
              base: 'vehicles',
            },
            {
              menuValue: 'Marques',
              route: routes.vehicleBrandArchive,
              base: 'vehicle-brands',
            },
            {
              menuValue: 'Modéles',
              route: routes.VehicleModelArchive,
              base: 'vehicle-models',
            },
            {
              menuValue: 'Type de véhicules',
              route: routes.vehicleTypeArchive,
              base: 'vehicle-types',
            },
          ],
        },
      ],
    },
    {
      tittle: 'Historique d\'affectations',
      icon: 'layers',
      showAsTab: false,
      roles: ['responsablePV'],
      separateRoute: false,
      menu: [
        {
          menuValue: 'Historique d\'affectations',
          route: routes.VehicleAssigmentHistory,
          hasSubRoute: false,
          showSubRoute: false,
          roles: ['responsablePV'],
          icon: 'users-group',
          base: 'vehicle-assigments',
          materialicons: 'person',
          subMenus: [],
        },

      ],
    },

  ];
  public getSideBarData: BehaviorSubject<SideBar[]> = new BehaviorSubject<
    SideBar[]
  >(this.sideBar);
  public resetData(): void {
    this.sideBar.map((res: SideBar) => {
      res.showAsTab = false;
      res.menu.map((menus: SideBarMenu) => {
        menus.showSubRoute = false;
      });
    });
  }
}
