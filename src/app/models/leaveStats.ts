export interface LeaveStatsDTO {
  total: number;
  counts: {
    pending: number;
    approved: number;
    other_date: number;
    rejected: number;
  };
}
