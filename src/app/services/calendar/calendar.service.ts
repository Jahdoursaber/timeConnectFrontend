import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Leave } from '../../models/leave.model';
import { Employee } from '../../models/employee';

@Injectable({ providedIn: 'root' })
export class CalendarService {
   private employees$ = new BehaviorSubject<Employee[]>([
    { id: 1, name: 'John Doe', department: 'Engineering', initials:'JD' },
    { id: 2, name: 'Jane Smith', department: 'Marketing',initials:'JD'  },
    { id: 3, name: 'Mike Johnson', department: 'Sales', initials:'JD'  },
    { id: 4, name: 'Sarah Wilson', department: 'HR', initials:'JD'  },
    { id: 5, name: 'Tom Brown', department: 'Finance',initials:'JD'  },
    { id: 6, name: 'Lisa Davis', department: 'Design',initials:'JD'  },
    { id: 7, name: 'Alex Chen', department: 'Engineering',initials:'JD'  },
    { id: 8, name: 'Emma White', department: 'Marketing',initials:'JD'  },
    // ... autres employés jusqu'à 24
  ]);

  private leaves$ = new BehaviorSubject<Leave[]>([
    {
      id: 1,
      employeeId: 1,
      type: 'Annual',
      start: new Date(2025, 10, 15),
      end: new Date(2025, 10, 17),
      status: 'Approved',
      color: '#1976d2'
    },
    {
      id: 2,
      employeeId: 3,
      type: 'Exception',
      start: new Date(2025, 10, 20),
      end: new Date(2025, 10, 22),
      status: 'Approved',
      color: '#f44336'
    }
    // ... autres congés
  ]);

  getEmployees() {
    return this.employees$.asObservable();
  }

  getLeaves() {
    return this.leaves$.asObservable();
  }

  addLeave(leave: Leave) {
    const currentLeaves = this.leaves$.value;
    this.leaves$.next([...currentLeaves, leave]);
  }

  changeLeaveStatus(leaveId: number, status: 'Approved' | 'Rejected') {
    const updatedLeaves = this.leaves$.value.map(leave =>
      leave.id === leaveId ? { ...leave, status } : leave
    );
    this.leaves$.next(updatedLeaves);
  }

  // Tu peux ajouter add/update/remove ici !
}
