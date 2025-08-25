  export interface pageSelection {
  skip: number;
  limit: number;
}

export interface adminSidebar {
  tittle: string;
  showAsTab: boolean;
  separateRoute: boolean;
  menu: adminMenu[];
}
export interface adminMenu {
  menuValue: string;
  hasSubRoute: boolean;
  showSubRoute: boolean;
  route?: string;
  subMenus?: adminSubMenus[];
  base?: string;
  boxIcon?: string;
}
export interface adminSubMenus {
  menuValue?: string;
  route?: string;
}
export interface url {
  url: string;
}


export interface adminSidebar {
  tittle: string;
  showAsTab: boolean;
  separateRoute: boolean;
  menu: adminMenu[];
}
export interface adminMenu {
  menuValue: string;
  hasSubRoute: boolean;
  showSubRoute: boolean;
  route?: string;
  subMenus?: adminSubMenus[];
  base?: string;
  boxIcon?: string;
}
export interface adminSubMenus {
  menuValue?: string;
  route?: string;
}
export interface url {
  url: string;
}


export class passwordResponce {
  passwordResponceText?: string;
  passwordResponceImage?: string;
  passwordResponceKey?: string;
}
export interface reportUser {
  isSelected?: boolean;
  id: number;
  name: string;
  phoneNumber: string;
  emailAddress: string;
  reportDate: string;
  reportedBy: string;
  img1: string;
  img2: string;
}

export interface language {
  isSelected?: boolean;
  id: number;
  name: string;
  code: string;
  total: string;
  done: string;
  progress: number;
  img: string;
}
export interface languageadmin {
  isSelected?: boolean;
  id: number;
  medium: string;
  file: string;
  total: string;
  complete: string;
  progress: number;
}
export interface languageapp {
  isSelected?: boolean;
  id: number;
  medium: string;
  file: string;
  total: string;
  complete: string;
  progress: number;
}
export interface languagetranslate {
  isSelected?: boolean;
  id: number;
  medium: string;
  file: string;
  total: string;
  complete: string;
  progress: number;
}
export interface languageweb {
  isSelected?: boolean;
  moduleName: string;
  id: number;
  total: number;
  complete: number;
  progress: number;
}

export interface chatSidebar {
  boxIcon: string;
  tooltip: string;
  route: string;
  class?: string;
}

export interface PackageList {
  sNo?: number;
  isSelected: boolean;
  Plan_Name: string;
  Plan_Type: string;
  Total_Subscribers: string; // Alternatively, use number if you want a numerical type
  Price: string; // Alternatively, use number if you want to remove the "$" symbol
  Created_Date: string; // Alternatively, use Date if you want to store it as a Date object
  Status: string;
}
export interface dataTables {
  isSelected: boolean;
  sNo?: number;
  name?: string;
  position?: string;
  office?: string;
  age?: string;
  salary?: string;
  startDate?: string;
  id?: string;
}
export interface Star {
  show?: boolean;
  half?: boolean;
}
export interface SideBarMenu {
  showMyTab?: boolean;
  menuValue: string;
  route?: string;
  hasSubRoute?: boolean;
  showSubRoute: boolean;
  icon: string;
  base?: string;
  base2?:string;
  base3?:string;
  base4?:string;
  base5?:string;
  base7?:string;
  base8?:string;
  base9?:string;
  base10?:string;
  last1?: string;
  last?: string;
  page?: string;
  last2?: string;
  materialicons?: string;
  subMenus: SubMenu[];
  dot?: boolean;
  changeLogVersion?: boolean;
  hasSubRouteTwo?: boolean;
  page1?: string;
  roles?: string[];
}
export interface breadCrumbItems {
  label: string;
  active?: boolean;
}
export interface SubMenu {
  menuValue: string;
  route?: string;
  base?: string;
  page?: string;
  page1?: string;
  page2?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  base7?: string;
  base8?: string;
  dot?:boolean;
  currentActive?: boolean;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenu[];
  roles?: string[];

}
export interface SubMenusTwo {
  menuValue: string;
  route?: string;
  base?: string;
  page?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  base7?: string;
  base8?: string;
  currentActive?: boolean;
  materialicons?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
}

export interface SideBar {
  showMyTab?: boolean;
  tittle: string;
  icon?: string;
  showAsTab: boolean;
  base?:string;
  base2?:string;
  separateRoute: boolean;
  materialicons?: string;
  menu: SideBarMenu[];
  hasSubRoute?: boolean;
  roles?: string[];
}

export interface SubMenuTwo {
  menuValue: string;
  route: string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
}

export interface SubMenu2 {
  menuValue: string;
  route?: string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  hasSubRoute?: boolean;
  showSubRoute?: boolean;
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenuTwo[];
}

export interface Menu {
  menuValue: string;
  hasSubRouteTwo?: boolean;
  showSubRoute?: boolean;
  hasSubRoute?: boolean;
  icon?: string;
  base?: string;
  base1?: string;
  base2?: string;
  base3?: string;
  base4?: string;
  base5?: string;
  base6?: string;
  base7?: string;
  base8?: string;
  base9?: string;
  base10?: string;
  subMenus?: SubMenu2[];
  customSubmenuTwo?: boolean;
  subMenusTwo?: SubMenuTwo[];
}

export interface MainMenu {
  title: string;
  showAsTab: boolean;
  separateRoute: boolean;
  menu: Menu[];
}








































