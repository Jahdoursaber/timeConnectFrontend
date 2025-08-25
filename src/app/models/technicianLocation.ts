export interface TechnicianLocation {
  user_id: number;
  first_name: string;
  last_name: string;
  position_start: string;
  company_name?: string;
  activity_name?: string;
  start_morning?:string;
  end_morning?:string;
  start_afternoon?:string;
  end_afternoon?:string;
  location?:string;
  nb_total_pointages?:number
}
