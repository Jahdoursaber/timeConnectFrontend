export interface AttendanceEmployee {
  id: number;
  date: string;             // '2024-07-14'
  check_in: string | null;  // '08:03:00'
  check_out: string | null; // '17:10:00'
  break: number | null; // Pause (en minutes)
  work_hours: number;     // Total minutes travaillées
  work_hours_number: number;
  late: number | null;  // Retard (en minutes)
  location: string;
  work_production: string;
  overtime: string; 
}
