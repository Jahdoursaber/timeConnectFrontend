import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  HostListener,
  RendererFactory2,
} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ChartComponent,
} from 'ng-apexcharts';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { Editor, Toolbar, Validators } from 'ngx-editor';
import { breadCrumbItems } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';
import { CommonService } from '../../../shared/common/common.service';
import { SettingService } from '../../../shared/settings/settings.service';
import { TechnicianLocation } from '../../../models/technicianLocation';
import { AttendanceService } from '../../../services/attendance/attendance.service';
import * as L from 'leaflet';
import { User } from '../../../models/user';
import { DashboardRhService } from '../../../services/dashboardRh/dashboard-rh.service';
import { LoginService } from '../../../services/user/login.service';
import { DashboardSupService } from '../../../services/dashboardSup/dashboard-sup.service';
export interface ChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
}

Chart.register(...registerables);
@Component({
  selector: 'app-dashboard-sup',
  standalone: false,
  templateUrl: './dashboard-sup.component.html',
  styleUrl: './dashboard-sup.component.scss',
})
export class DashboardSupComponent implements OnInit, OnDestroy {
  routes = routes;

  locations: TechnicianLocation[] = [];
  attendances: TechnicianLocation[] = [];
  userAuthentified: User | null = null;
  nbTotalPointages = 0;
  requestsTotal = 0;
  loading = false;
  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic', 'format_clear'],
    ['underline', 'strike'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['image'],
  ];
  private attendanceChart?: Chart;
  dashStats = {
    technician_without_activity: 0,
    technician_with_activity: 0,
    technician_on_leave: 0,
  };
  breadCrumbItems: breadCrumbItems[] = [];
  requestsLegend: Array<{ label: string; valuePct: number; color: string }> = [];
  constructor(
    private dashboard: DashboardSupService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.getUserAuthentified();
    this.breadCrumbItems = [
      { label: 'Dashboards' },
      { label: 'Superviseur Dashboard', active: true },
    ];
    this.editor = new Editor();


    this.loadDashStats();
    this.loadRequestDonut();

    this.fetchTodayAttendances();
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }
  private loadRequestDonut(): void {

    this.dashboard.getRequestStats().subscribe({
      next: ({ total, counts }) => {
        this.requestsTotal = total;

        // labels & couleurs (harmonisés avec ton HTML existant)
        const items = [
          { key: 'pending', label: 'En cours', color: '#03C95A' }, // Present -> vert
          { key: 'approved',   label: 'Accordé',   color: '#0C4B5E' }, // Late -> bleu canard
          { key: 'other_date',   label: 'Nouvelle date',   color: '#FFC107' },
          { key: 'rejected',   label: 'Non accordé',   color: '#ff0000ff' }, // Permission -> jaune
        ] as const;

        const raw = items.map(i => counts[i.key]);
        const denom = total > 0 ? total : 1;
        const percents = raw.map(v => Math.round((v / denom) * 100));

        // Légende dynamique
        this.requestsLegend = items.map((it, idx) => ({
          label: it.label,
          valuePct: percents[idx],
          color: it.color,
        }));

        // (Re)build Chart.js
        const ctxId = 'attendancedoughcharts1';
        if (this.attendanceChart) this.attendanceChart.destroy();

        const config: ChartConfiguration<'doughnut'> = {
          type: 'doughnut',
          data: {
            labels: items.map(i => i.label),
            datasets: [{
              label: 'Semi Donut',
              data: raw, // on donne les comptes bruts; l’angle suit le ratio
              backgroundColor: items.map(i => i.color),
              borderWidth: 5,
              borderRadius: 10,
              borderColor: '#fff',
              hoverBorderWidth: 0,
            }],
          },
          options: {
            cutout: '60%',
            rotation: -100,     // garde ton style semi-donut
            circumference: 200, // idem
            layout: { padding: { top: -20, bottom: -20 } },
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
          },
        };

        this.attendanceChart = new Chart(ctxId, config);
      },
      error: (err) => {
        console.error('Erreur stats demandes', err);

      },
    });
  }
  fetchTodayAttendances() {
    this.loading = true;
    this.dashboard.getTodayAttendancesSup().subscribe({
      next: (res) => {
        this.attendances = res.data || [];
        this.nbTotalPointages = res.nb_total_pointages;
        this.loading = false;
      },
      error: () => {
        this.attendances = [];
        this.nbTotalPointages = 0;
        this.loading = false;
      },
    });
  }
  loadDashStats(): void {
    this.dashboard.getDashboardSupStats().subscribe({
      next: (stats) => {
        console.log(stats);
        this.dashStats = stats;
      },
      error: (err) => {
        console.error('Erreur stats demandes', err);
      },
    });
  }
  getUserAuthentified(): void {
    this.loginService.user$.subscribe(user => {
    this.userAuthentified = user;
    });
    }
}
