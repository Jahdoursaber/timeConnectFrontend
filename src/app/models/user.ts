export interface User {
  id: number;
  matricule: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  code_tel: string;
  address: string;
  postal_address: string;
  entry_date: string;
  is_active: boolean;
  vital_card: File | null;
  bank_details: File | null;
  company_id: number | null;
  job_id: number | null;
  activity_id: number | null;
  change_password_at: Date | null;
  job_title: string;
  activity_name: string;
  company_name: string;
  supervisor_name: string;
  deleted_at: string;
  roles: string[];
}


