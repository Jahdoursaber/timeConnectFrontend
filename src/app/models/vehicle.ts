export interface Vehicle {
    id:number;
    plaque_immatriculation:string;
    mileage:number;
    gearbox:string;
    date_immatriculation:string;
    date_achat:string;
    status:number;
    status_label:string;
    brand_name:string;
    model_name:string;
    type_name:string;
    fuel_type_name:string;
    gray_card:File | null;
    green_card:File | null;
    deleted_at:string;
    brand_id:number | null;
    model_id:number | null;
    type_id:number | null;
    fuel_type_id:number | null;
}
