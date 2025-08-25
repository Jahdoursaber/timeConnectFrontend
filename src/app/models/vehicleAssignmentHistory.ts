export interface VehicleAssignmentHistory {
  id: number;
  vehicule_id: number;
  technicien_id: number;
  date_affectation: string;
  date_depot: string | null;
  nom_responsable: string;
  prenom_responsable: string;
  nom_technicien: string;
  prenom_technicien: string;
  plaque_immatriculation: string;
  activity_name: string;
  company_name: string;
  date_demande_depot:string |null;
}
