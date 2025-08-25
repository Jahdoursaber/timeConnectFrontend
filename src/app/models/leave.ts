export interface Leave {
  id:number,
  leave_type:string,
  leave_type_id:number,
  status:string,
  start:string,
  end:string,
  nb_of_days:number,
  created_at:string,
  message:string,
  reply:string,
  file_path:File  | null;
  all_day:string,
  color:string,
  full_name:string,
  label?: string;
  value?: string;
}
