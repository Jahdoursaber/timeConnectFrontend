/* eslint-disable @typescript-eslint/no-explicit-any */
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
  selector: 'app-dashboard-rh',
  standalone: false,
  templateUrl: './dashboard-rh.component.html',
  styleUrl: './dashboard-rh.component.scss'
})
export class DashboardRHComponent implements OnInit, OnDestroy{
    routes = routes;
    map: any;
    locations: TechnicianLocation[] = [];
    attendances: TechnicianLocation[] = [];
    userAuthentified: User | null = null;
    nbTotalPointages = 0;
    loading = false;
    base = '';
    private attendanceChart?: Chart;

    requestsTotal = 0;
    dashStats = {
      total_RH: 0,
      total_Sup: 0,
      total_Technician: 0,
      total_company: 0,
      total_activity: 0

    };
    requestsLegend: Array<{ label: string; valuePct: number; color: string }> = [];
    values: string[] = ['Jerald', 'Andrew', 'Philip', 'Davis'];
    values2: string[] = ['Hendry', 'James'];
    values3: string[] = ['Dwight'];
    @ViewChild('chart') chart!: ChartComponent;
    @ViewChild(BsDatepickerDirective, { static: false })
    datepicker?: BsDatepickerDirective;
    @HostListener('window:scroll')
    onScrollEvent() {
      this.datepicker?.hide();
    }
    public EmpDepartment: Partial<ChartOptions> | any;
    public SalesIncome: Partial<ChartOptions> | any;
    breadCrumbItems: breadCrumbItems[] = [];
    bsConfig: Partial<BsDatepickerConfig>;
    selectedYear: Date | undefined;
    selectedTime: Date = new Date(); // Default time
    dropdownOpen = false;
    editor!: Editor;
    toolbar: Toolbar = [
      ['bold', 'italic', 'format_clear'],
      ['underline', 'strike'],
      [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
      ['image'],
    ];

    form = new FormGroup({
      editorContent: new FormControl('', Validators.required()),
    });
    selectedFieldSet: number[] = [0];
    nextStep() {
      if (this.selectedFieldSet[0] < 13) {
        this.selectedFieldSet[0]++;
      }
    }
    previousStep() {
      if (this.selectedFieldSet[0] > 0) {
        // Move to the previous step
        this.selectedFieldSet[0]--;
      }

    }
    constructor(private common: CommonService,private layout:SettingService,private attendanceService: AttendanceService,private dashboard:DashboardRhService,private loginService:LoginService) {
      this.selectedYear = new Date(new Date().getFullYear(), 0, 1);
      this.bsConfig = {
        minMode: 'year',
        dateInputFormat: 'YYYY',
      };


    }

    openDropdown() {
      this.dropdownOpen = true;
    }

    closeDropdown() {
      this.dropdownOpen = false;
    }

    onTimeChange() {
      this.closeDropdown();
    }
    ngOnInit(): void {
      this.getUserAuthentified();
      this.breadCrumbItems = [
        { label: 'Dashboards' },
        { label: 'Admin Dashboard', active: true },
      ];
      this.editor = new Editor();

      this.SalesIncome = {
        chart: {
          height: 290,
          type: 'bar',
          stacked: true,
          toolbar: {
            show: false,
          },
        },
        colors: ['#FF6F28', '#F8F9FA'],
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0,
              },
            },
          },
        ],
        plotOptions: {
          bar: {
            borderRadius: 5,
            borderRadiusWhenStacked: 'all',
            horizontal: false,
            endingShape: 'rounded',
          },
        },
        series: [
          {
            name: 'Income',
            data: [40, 30, 45, 80, 85, 90, 80, 80, 80, 85, 20, 80],
          },
          {
            name: 'Expenses',
            data: [60, 70, 55, 20, 15, 10, 20, 20, 20, 15, 80, 20],
          },
        ],
        xaxis: {
          categories: [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
          ],
          labels: {
            style: {
              colors: '#6B7280',
              fontSize: '13px',
            },
          },
        },
        yaxis: {
          labels: {
            offsetX: -15,
            style: {
              colors: '#6B7280',
              fontSize: '13px',
            },
          },
        },
        grid: {
          borderColor: '#E5E7EB',
          strokeDashArray: 5,
          padding: {
            left: -8,
          },
        },
        legend: {
          show: false,
        },
        dataLabels: {
          enabled: false, // Disable data labels
        },
        fill: {
          opacity: 1,
        },
      };
      this.loadDashStats();
      this.loadRequestDonut();
      this.initLeavesChart();
      this.loadLeavesMonthly();

      this.attendanceService.getTodayTechnicianLocations().subscribe(locations => {
        this.locations = locations;
        this.initMap();
      });
      this.fetchTodayAttendances();
    }

    private initLeavesChart(): void {
    this.SalesIncome = {
      chart: {
        height: 290,
        type: 'bar',
        stacked: false,               // plus besoin de stacked
        toolbar: { show: false },
      },
      colors: ['#FF6F28'],            // une seule couleur
      responsive: [{ breakpoint: 480, options: { legend: { position: 'bottom', offsetX: -10, offsetY: 0 } } }],
      plotOptions: {
        bar: {
          borderRadius: 5,
          horizontal: false,
          endingShape: 'rounded',
        },
      },
      series: [
        {
          name: 'Demandes',
          data: new Array(12).fill(0), // placeholder
        },
      ],
      xaxis: {
        categories: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        labels: { style: { colors: '#6B7280', fontSize: '13px' } },
      },
      yaxis: {
        labels: { offsetX: -15, style: { colors: '#6B7280', fontSize: '13px' } },
      },
      grid: {
        borderColor: '#E5E7EB',
        strokeDashArray: 5,
        padding: { left: -8 },
      },
      legend: { show: false },
      dataLabels: { enabled: false },
      fill: { opacity: 1 },
    };
  }

  private loadLeavesMonthly(): void {
    this.dashboard.getLeavesMonthlyStats().subscribe({
      next: (res) => {
        // mets à jour catégories et données
        if (res.months?.length === 12) {
          this.SalesIncome.xaxis = { ...this.SalesIncome.xaxis, categories: res.months };
        }
        if (res.totals?.length === 12) {
          this.SalesIncome.series = [{ name: 'Demandes', data: res.totals }];
        }
      },
      error: (err) => {
        console.error('Erreur stats congés mensuels', err);
      },
    });
  }
    private loadRequestDonut(): void {

    this.dashboard.getRequestStats().subscribe({
      next: ({ total, counts }) => {
        this.requestsTotal = total;

        // labels & couleurs (harmonisés avec ton HTML existant)
        const items = [
          { key: 'acompte', label: 'Demande acompte', color: '#03C95A' }, // Present -> vert
          { key: 'conge',   label: 'Demande congé',   color: '#0C4B5E' }, // Late -> bleu canard
          { key: 'autre',   label: 'Autre demande',   color: '#FFC107' }, // Permission -> jaune
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

    ngOnDestroy(): void {
      this.editor.destroy();
    }
    initMap() {
        if (this.map) {
          this.map.remove();
        }
        let lat = 36.8, lng = 10.1; // Par défaut Tunis
        if (this.locations.length && this.locations[0].position_start) {
          const [latS, lngS] = this.locations[0].position_start.split(',').map(Number);
          lat = latS; lng = lngS;
        }

        this.map = L.map('map-popup').setView([lat, lng], 8);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Ajout des marqueurs
        for (const tech of this.locations) {
          if (!tech.position_start) continue;
          const [latT, lngT] = tech.position_start.split(',').map(Number);

          const icon = L.icon({
            iconUrl: 'assets/img/profiles/marker-icon-2x.png', // Mets le chemin vers ton icône
            iconSize: [25, 35],
            iconAnchor: [12, 35],
          });

          const marker = L.marker([latT, lngT], { icon }).addTo(this.map);
          marker.bindPopup(`
            <b>${tech.last_name} ${tech.first_name}</b><br>
            ${tech.company_name ?? ''}<br>
            ${tech.activity_name ?? ''}
          `);
        }
      }
      fetchTodayAttendances() {
      this.loading = true;
      this.attendanceService.getTodayAttendances().subscribe({
        next: res => {
          this.attendances = res.data || [];
          this.nbTotalPointages = res.nb_total_pointages;
          this.loading = false;
        },
        error: () => {
          this.attendances = [];
          this.nbTotalPointages = 0;
          this.loading = false;
        }
      });
    }
    loadDashStats(): void {
  this.dashboard.getDashboardRhStats().subscribe({
    next: (stats) => {
      console.log(stats);
      this.dashStats = stats;

    },
    error: (err) => {
       console.error('Erreur stats demandes', err);
    }
  });
}
getUserAuthentified(): void {
    this.loginService.user$.subscribe(user => {
    this.userAuthentified = user;
    });
    }
}
