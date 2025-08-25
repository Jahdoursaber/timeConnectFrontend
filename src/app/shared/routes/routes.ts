export class routes {
    private static Url = '';

  public static get baseUrl(): string {
    return this.Url;
  }


public static get resetPassword(): string {
  return this.baseUrl + '/reset-password';
}
public static get forgotPassword(): string {
  return this.baseUrl + '/forgot-password';
}

public static get success2(): string {
  return this.baseUrl + '/success-2';
}

public static get index(): string {
  return  this.baseUrl + '/dashboard/index';
}

public static get dashboardRH(): string{
  return this.baseUrl + '/rh/dashboard'
}
public static get dashboardSup(): string{
  return this.baseUrl + '/superviseur/dashboard'
}
public static get dashboardRPA(): string{
  return this.baseUrl + '/vehicle-manager/dashboard'
}



public static get activities(): string {
  return this.baseUrl + '/rh/activity';
}
public static get companies(): string {
  return this.baseUrl + '/rh/companies';
}
public static get jobs(): string {
  return this.baseUrl + '/rh/jobss';
}
public static get collectives(): string {
  return this.baseUrl + '/rh/collectives-agreements';
}
public static get apes(): string {
  return this.baseUrl + '/rh/apes';
}
//--------------Personnels-------------//
public static get rhs(): string {
  return this.baseUrl + '/rh/rhs';
}
public static get techniciens(): string {
  return this.baseUrl + '/rh/techniciens';
}
public static get superviseurs(): string {
  return this.baseUrl + '/rh/superviseurs';
}
public static get responsablePv(): string {
  return this.baseUrl + '/rh/responsables-parc-auto';
}
public static get technicienSuperviseur(): string {
  return this.baseUrl + '/superviseur/techniciens'
}
public static get archiveUser():string {
  return this.baseUrl + '/rh/archive-user';
}

public static get leavesCalendar():string {
  return this.baseUrl + 'leaves/calendar'
}

public static get technicianHistory():string {
  return this.baseUrl + 'technicians/history';
}

//---------------------------------------//

//---------------Demandes----------------//
public static get otherRequest():string {
  return this.baseUrl + '/rh/other-request';
}
public static get advanceRequest():string {
  return this.baseUrl + '/rh/advance-request'
}
public static get LeaveRH():string {
  return this.baseUrl + '/rh/leaves';
}
public static get LeaveSuperviseur():string {
  return this.baseUrl + '/superviseur/leaves'
}

//---------------------------------------//


//---------------vehicles----------------//
public static get vehicle():string {
  return this.baseUrl + '/vehicle-manager/vehicles';
}
public static get vehicleType():string {
  return this.baseUrl + '/vehicle-manager/vehicle-types';
}
public static get vehicleBrand():string {
  return this.baseUrl + '/vehicle-manager/vehicle-brands';
}
public static get VehicleModel():string {
  return this.baseUrl + '/vehicle-manager/vehicle-models';
}
public static get vehicleArchive():string {
  return this.baseUrl + '/vehicle-manager/archives/vehicles';
}
public static get vehicleTypeArchive():string {
  return this.baseUrl + '/vehicle-manager/archives/vehicle-types';
}
public static get vehicleBrandArchive():string {
  return this.baseUrl + '/vehicle-manager/archives/vehicle-brands';
}
public static get VehicleModelArchive():string {
  return this.baseUrl + '/vehicle-manager/archives/vehicle-models';
}
public static get VehicleAssigmentHistory():string {
  return this.baseUrl + '/vehicle-manager/vehicle-assigments';
}
//--------------------------------------//



public static get login2(): string {
  return this.baseUrl + '/login-2';
}

public static get forgotpassword2(): string {
  return this.baseUrl + '/forgot-password-2';
}


public static get resetpassword(): string {
  return this.baseUrl + '/reset-password';
}
public static get resetpassword2(): string {
  return this.baseUrl + '/reset-password-2';
}

public static get error(): string {
  return this.baseUrl + '/error-404';
}
public static get errors(): string {
  return this.baseUrl + '/error-500';
}


public static get changePassword(): string {
  return this.baseUrl + '/change-password';
}


public static get profile(): string {
  return this.baseUrl + '/user-profile';
}

}
