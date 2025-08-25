export interface LeaveBalance {
  TotalLeave: number;
  LeaveTaken: number;
  LeaveLeft: number;
  ReferencePeriod: { start: string; end: string };
}
