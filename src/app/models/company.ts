export interface Company {
  id: number;
  company_name: string;
  address: string;
  num_siret: string;
  email: string;
  collective_title: string;
  collective_idcc ?: string;
  code_ape: string;
  label_ape: string;
  collective_id: number;
  ape_id: number;
}
