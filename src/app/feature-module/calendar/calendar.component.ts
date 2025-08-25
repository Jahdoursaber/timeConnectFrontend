import { Component, OnInit } from '@angular/core';
import { CalendarResource } from '../../models/CalendarResource';
import { LeaveEvent } from '../../models/LeaveEvent';
import { LeaveService } from '../../services/leave/leave.service';
import { Router } from '@angular/router';
import { EventClickArg } from '@fullcalendar/core/index.js';
import { routes } from '../../shared/routes/routes';
@Component({
  selector: 'app-calendar',
  standalone: false,
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit{

    routes = routes;
    showEventDetailsModal = false;
    eventDetails = { title: '' };
    date: Date[] | undefined;
    dropdownOpen = false;
    selectedTime: Date = new Date();
    addtime2: Date | undefined;
    addtime: Date | undefined;
    bsInlineValue = new Date()
    employees: CalendarResource[] = [];
    events: LeaveEvent[] = [];

    view: 'month' | 'week' = 'week';
    currentDate: Date = new Date();
    visibleDays: { date: Date, label: string, dayName: string }[] = [];

    constructor(private leaveService: LeaveService, private router: Router) { }
    ngOnInit() {
      this.loadCalendarData();
      this.updateVisibleDays();
    }


    daysOfWeek: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    weekDates: { date: Date; label: string }[] = [];
    monthDays: { date: Date; label: string; dayName: string }[] = [];
    // Open the dropdown
    openDropdown() {
      this.dropdownOpen = true;
    }

    // Close the dropdown
    closeDropdown() {
      this.dropdownOpen = false;
    }

    // Update displayed time when selection changes
    onTimeChange() {
      this.closeDropdown(); // Close dropdown after time selection
    }

   changeView(mode: 'month' | 'week') {
    this.view = mode;
    this.updateVisibleDays();
    this.loadCalendarData();
  }


    getPeriodLabel(): string {
      if (this.view === 'week') {
        const weekStart = this.getWeekStart(this.currentDate);
        return `Semaine du ${weekStart.getDate()} ${weekStart.toLocaleString('fr-FR', { month: 'long' })} ${weekStart.getFullYear()}`;
      }
      return `${this.currentDate.toLocaleString('fr-FR', { month: 'long' })} ${this.currentDate.getFullYear()}`;
    }





    loadCalendarData() {
      // Calcule le début et la fin selon la vue (ici exemple pour le mois)
      let start: string, end: string;
      if (this.view === 'month') {
        const y = this.currentDate.getFullYear();
        const m = this.currentDate.getMonth();
        start = new Date(y, m, 1).toISOString().slice(0, 10); // yyyy-mm-dd
        end = new Date(y, m + 1, 0).toISOString().slice(0, 10);
      } else {
        // Pour la semaine : du lundi au dimanche
        const weekStart = this.getWeekStart(this.currentDate);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        start = weekStart.toISOString().slice(0, 10);
        end = weekEnd.toISOString().slice(0, 10);
      }
      console.log('APPEL API avec start', start, 'end', end);
      this.leaveService.getLeaveCalendar(start, end).subscribe(res => {
        this.employees = res.resources;
        this.events = res.events;
      });
    }

     updateVisibleDays() {
      this.visibleDays = [];
      if (this.view === 'week') {
        const weekStart = this.getWeekStart(this.currentDate);
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          this.visibleDays.push({
            date,
            label: date.getDate().toString(),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
          });
        }
      } else {
        // Tous les jours du mois
        const y = this.currentDate.getFullYear();
        const m = this.currentDate.getMonth();
        const nbDays = new Date(y, m + 1, 0).getDate();
        for (let i = 1; i <= nbDays; i++) {
          const date = new Date(y, m, i);
          this.visibleDays.push({
            date,
            label: i.toString(),
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' })
          });
        }
      }
    }

    navigate(direction: 'prev' | 'next') {
    if (this.view === 'month') {
      this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1);
    } else {
      this.currentDate = new Date(this.currentDate);
      this.currentDate.setDate(this.currentDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    this.loadCalendarData();
    this.updateVisibleDays();

  }

    getWeekStart(date: Date): Date {
      const d = new Date(date);
      const day = d.getDay();
      const monday = new Date(d);
      monday.setDate(d.getDate() - ((day + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      return monday;
    }

    updateWeekDates() {
      this.weekDates = [];
      if (this.view === 'week') {
        const start = this.getWeekStart(this.currentDate);
        for (let i = 0; i < 7; i++) {
          const date = new Date(start);
          date.setDate(start.getDate() + i);
          this.weekDates.push({
            date,
            label: date.getDate().toString()
          });
        }
      }
    }

    getInitials(name: string): string {
      return name.split(' ').map(n => n[0]).join('');
    }
    formatDateLocal(date: Date): string {
    // YYYY-MM-DD en local
    return date.getFullYear() + '-' +
      String(date.getMonth() + 1).padStart(2, '0') + '-' +
      String(date.getDate()).padStart(2, '0');
  }

  getEventForCell(employeeId: number, date: Date): LeaveEvent | null {
    const dateStr = this.formatDateLocal(date);
    return this.events.find(
      e =>
        e.resourceId === employeeId &&
        e.start <= dateStr &&
        e.end >= dateStr
    ) || null;
  }
    handleEventClick(info: EventClickArg) {
      this.eventDetails = {
        title: info.event.title
      };
      this.showEventDetailsModal = true;
    }
    handleEventDetailsClose() {
      this.showEventDetailsModal = false;
    }

    goToEmployeeHistory(employeeId: number) {
      this.router.navigate(['/rh/leave-history', employeeId]);
    }

}
