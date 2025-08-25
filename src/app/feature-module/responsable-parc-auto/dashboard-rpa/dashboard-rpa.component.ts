import { Component, OnInit, ViewChild } from '@angular/core';
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
import { breadCrumbItems, pageSelection } from '../../../shared/models/models';
import { routes } from '../../../shared/routes/routes';
import { VehicleService } from '../../../services/vehicle/vehicle.service';
import { VehicleAssigment } from '../../../models/vehicleAssigment';
import { MatTableDataSource } from '@angular/material/table';
import { PaginationService, tablePageSize } from '../../../shared/custom-pagination/pagination.service';
import { Subscription } from 'rxjs';
import { Sort } from '@angular/material/sort';
import { User } from '../../../models/user';
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
@Component({
  selector: 'app-dashboard-rpa',
  standalone: false,
  templateUrl: './dashboard-rpa.component.html',
  styleUrl: './dashboard-rpa.component.scss',
})
export class DashboardRpaComponent {
  public routes = routes;
  @ViewChild('chart') chart!: ChartComponent;
  public revenue_income: Partial<ChartOptions> | any;
  public companyChart: Partial<ChartOptions> | any;
  public planOverview: Partial<ChartOptions> | any;
  public Areachart: Partial<ChartOptions> | any;
  public Areachart2: Partial<ChartOptions> | any;
  public Areachart3: Partial<ChartOptions> | any;
  public Areachart4: Partial<ChartOptions> | any;
  bsValue = new Date();
  bsRangeValue: Date[];
  maxDate = new Date();
  breadCrumbItems: breadCrumbItems[] = [];
  vehicleStats = {
    total_vehicle: 0,
    assigned_vehicle: 0,
    unassigned_vehicle: 0,
  };
  private tablePageSizeSubscription?: Subscription;
   public pageSize = 10;
  public tableData: VehicleAssigment[] = [];
  public tableDataCopy: VehicleAssigment[] = [];
  public vehicle_assignments: VehicleAssigment[] = [];
  public actualData: VehicleAssigment[] = [];
  public currentPage = 1;
  public skip = 0;
  public limit: number = this.pageSize;
  public serialNumberArray: number[] = [];
  public totalData = 0;
  userAuthentified: User | null = null;
public vehicleStatusLegend: any[] = [];
  loading = false;
  showFilter = false;
  public pageSelection: pageSelection[] = [];
  dataSource!: MatTableDataSource<VehicleAssigment>;
  public searchDataValue = '';
  constructor(private vehicleService: VehicleService,private pagination: PaginationService,private loginService: LoginService) {
    this.maxDate.setDate(this.maxDate.getDate() + 7);
    this.bsRangeValue = [this.bsValue, this.maxDate];
    this.breadCrumbItems = [
      { label: 'Superadmin' },
      { label: 'Dashboard', active: true },
    ];
  }
  ngOnInit(): void {
    this.getUserAuthentified();
    this.loadVehicleStats();
    this.getAllVehicleAssignments();
    this.Areachart = {
      series: [
        {
          name: 'Messages',
          data: [5, 10, 7, 5, 10, 7, 5],
        },
      ],

      chart: {
        type: 'bar',
        width: 70,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        dropShadow: {
          enabled: false,
          top: 3,
          left: 14,
          blur: 4,
          opacity: 0.12,
          color: '#fff',
        },
        sparkline: {
          enabled: !0,
        },
      },
      markers: {
        size: 0,
        colors: ['#F26522'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      plotOptions: {
        bar: {
          horizontal: !1,
          columnWidth: '35%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: !0,
        width: 2.5,
        curve: 'smooth',
      },
      colors: ['#FF6F28'],
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
        ],
        labels: {
          show: false,
        },
      },
      tooltip: {
        show: false,
        theme: 'dark',
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },

        marker: {
          show: false,
        },
      },
    };
    this.Areachart4 = {
      series: [
        {
          name: 'Messages',
          data: [5, 10, 7, 5, 10, 7, 5],
        },
      ],

      chart: {
        type: 'bar',
        width: 70,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        dropShadow: {
          enabled: false,
          top: 3,
          left: 14,
          blur: 4,
          opacity: 0.12,
          color: '#fff',
        },
        sparkline: {
          enabled: !0,
        },
      },
      markers: {
        size: 0,
        colors: ['#F26522'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      plotOptions: {
        bar: {
          horizontal: !1,
          columnWidth: '35%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: !0,
        width: 2.5,
        curve: 'smooth',
      },
      colors: ['#2DCB73'],
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
        ],
        labels: {
          show: false,
        },
      },
      tooltip: {
        show: false,
        theme: 'dark',
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },

        marker: {
          show: false,
        },
      },
    };
    this.Areachart3 = {
      series: [
        {
          name: 'Messages',
          data: [8, 10, 10, 8, 8, 10, 8],
        },
      ],

      chart: {
        type: 'bar',
        width: 70,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        dropShadow: {
          enabled: false,
          top: 3,
          left: 14,
          blur: 4,
          opacity: 0.12,
          color: '#fff',
        },
        sparkline: {
          enabled: !0,
        },
      },
      markers: {
        size: 0,
        colors: ['#F26522'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      plotOptions: {
        bar: {
          horizontal: !1,
          columnWidth: '35%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: !0,
        width: 2.5,
        curve: 'smooth',
      },
      colors: ['#177DBC'],
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
        ],
        labels: {
          show: false,
        },
      },
      tooltip: {
        show: false,
        theme: 'dark',
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },

        marker: {
          show: false,
        },
      },
    };
    this.Areachart2 = {
      series: [
        {
          name: 'Messages',
          data: [5, 3, 7, 6, 3, 10, 5],
        },
      ],

      chart: {
        type: 'bar',
        width: 70,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        dropShadow: {
          enabled: false,
          top: 3,
          left: 14,
          blur: 4,
          opacity: 0.12,
          color: '#fff',
        },
        sparkline: {
          enabled: !0,
        },
      },
      markers: {
        size: 0,
        colors: ['#F26522'],
        strokeColors: '#fff',
        strokeWidth: 2,
        hover: {
          size: 7,
        },
      },
      plotOptions: {
        bar: {
          horizontal: !1,
          columnWidth: '35%',
          endingShape: 'rounded',
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: !0,
        width: 2.5,
        curve: 'smooth',
      },
      colors: ['#4B3088'],
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
        ],
        labels: {
          show: false,
        },
      },
      tooltip: {
        show: false,
        theme: 'dark',
        fixed: {
          enabled: false,
        },
        x: {
          show: false,
        },

        marker: {
          show: false,
        },
      },
    };

    this.planOverview = {
      chart: {
        height: 240,
        type: 'donut',
        toolbar: {
          show: false,
        },
      },
      colors: ['#FFC107', '#1B84FF', '#F26522'],
      series: [20, 60, 20],
      labels: ['Enterprise', 'Premium', 'Basic'],
      plotOptions: {
        pie: {
          donut: {
            size: '50%',
            labels: {
              show: false,
            },
            borderRadius: 30,
          },
        },
      },
      stroke: {
        lineCap: 'round',
        show: true,
        width: 0, // Space between donut sections
        colors: '#fff',
      },
      dataLabels: {
        enabled: false,
      },
      legend: { show: false },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              height: 180,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
    this.loadVehicleStatusStats();

  }
  ngOnDestroy(): void {
    if (this.tablePageSizeSubscription) {
      this.tablePageSizeSubscription.unsubscribe();
    }
  }
   loadVehicleStatusStats(): void {
    this.vehicleService.getVehicleStatusStats().subscribe({
    next: (res) => {
      if (res && res.success && Array.isArray(res.data)) {
        this.planOverview = {
          chart: {
            height: 240,
            type: 'donut',
            toolbar: { show: false }
          },
          colors: res.data.map((e: any) => e.color),
          series: res.data.map((e: any) => e.value),
          labels: res.data.map((e: any) => e.label),
          plotOptions: {
            pie: {
              donut: {
                size: '50%',
                labels: { show: false },
                borderRadius: 30
              },
            },
          },
          stroke: {
            lineCap: 'round',
            show: true,
            width: 0,
            colors: '#fff',
          },
          dataLabels: { enabled: false },
          legend: { show: false },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: { height: 180 },
              legend: { position: 'bottom' }
            },
          }],
        };
        // Pour la légende
        this.vehicleStatusLegend = res.data;
      }
    },
    error: (err) => {
      console.error('Erreur stats véhicule:', err);
    }
  });
}
  loadVehicleStats(): void {
    this.vehicleService.getVehicleStats().subscribe({
      next: (stats) => {
        console.log(stats);
        this.vehicleStats = stats;
      },
      error: (err) => {
        console.log('Error loading vehicle stats', err);
      },
    });
  }
  private getAllVehicleAssignments(): void {
      this.loading = true;
      this.vehicleService.getVehiclesAssignments().subscribe((vehicle_assignments: VehicleAssigment[]) => {
        this.actualData = vehicle_assignments;
        this.totalData = vehicle_assignments.length;
        this.tableDataCopy = [...this.actualData];
        if (this.tablePageSizeSubscription) {
          this.tablePageSizeSubscription.unsubscribe();
        }
        this.tablePageSizeSubscription = this.pagination.tablePageSize.subscribe((res: tablePageSize) => {
          this.getTableData({ skip: res.skip, limit: res.limit });
          this.pageSize = res.pageSize;
        });
        this.loading = false;
      });
    }

    private getTableData(pageOption: pageSelection): void {
      this.tableData = [];
      this.serialNumberArray = [];
      this.actualData.forEach((vehicle_assignment: VehicleAssigment, index: number) => {
        const serialNumber = index + 1;
        if (index >= pageOption.skip && serialNumber <= pageOption.limit) {
          (vehicle_assignment as any).sNo = serialNumber;
          this.tableData.push(vehicle_assignment);
        }
      });

      // Met à jour le dataSource sans le recréer
      if (!this.dataSource) {
        this.dataSource = new MatTableDataSource<VehicleAssigment>(this.tableData);
      } else {
        this.dataSource.data = this.tableData;
      }

      this.pagination.calculatePageSize.next({
        totalData: this.totalData,
        pageSize: this.pageSize,
        tableData: this.tableData,
        tableDataCopy: this.tableDataCopy,
        serialNumberArray: this.serialNumberArray,
      });
    }

    public searchData(value: string): void {
      if (value == '') {
        this.tableData = [...this.tableDataCopy];;
      } else {
        this.dataSource.filter = value.trim().toLowerCase();
        this.tableData = this.dataSource.filteredData;
      }
    }

    public sortData(sort: Sort) {
      const data = this.tableData.slice();

      if (!sort.active || sort.direction === '') {
        this.tableData = data;
      } else {
        this.tableData = data.sort((a, b) => {
          const aValue = (a as never)[sort.active];

          const bValue = (b as never)[sort.active];
          return (aValue < bValue ? -1 : 1) * (sort.direction === 'asc' ? 1 : -1);
        });
      }
    }
    public changePageSize(pageSize: number): void {
      this.pageSelection = [];
      this.limit = pageSize;
      this.skip = 0;
      this.currentPage = 1;
      this.pagination.tablePageSize.next({
        skip: this.skip,
        limit: this.limit,
        pageSize: this.pageSize,
      });
    }

    getUserAuthentified(): void {
    this.loginService.user$.subscribe(user => {
    this.userAuthentified = user;
    });
    }
}
