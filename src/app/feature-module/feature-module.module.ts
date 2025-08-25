import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureModuleRoutingModule } from './feature-module-routing.module';
import { FeatureModuleComponent } from './feature-module.component';
import { SharedModule } from '../shared/shared-module';
import { FormsModule } from '@angular/forms';
import { ResetPasswordComponent } from '../auth/reset-password/reset-password.component';
import { DefaultSidebarComponent } from './common/default-sidebar/default-sidebar.component';
import { DefaultHeaderComponent } from './common/default-header/default-header.component';
import { ThemeSettingsComponent } from './common/theme-settings/theme-settings.component';
import { PasswordStrengthComponent } from '../auth/password-strength/password-strength.component';
import { MessageService } from 'primeng/api';
import { CalendarComponent } from './calendar/calendar.component';
import { TechnicienHistoryComponent } from './technicien-history/technicien-history.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NotificationComponent } from './notification/notification/notification.component';





@NgModule({
  declarations: [
    FeatureModuleComponent,
    ResetPasswordComponent,
    DefaultSidebarComponent,
    DefaultHeaderComponent,

    ThemeSettingsComponent,
    PasswordStrengthComponent,

    CalendarComponent,
    TechnicienHistoryComponent,
    UserProfileComponent,
    NotificationComponent,
  ],
  imports: [
    CommonModule,
    FeatureModuleRoutingModule,
    SharedModule,
    FormsModule,



  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class FeatureModuleModule { }
