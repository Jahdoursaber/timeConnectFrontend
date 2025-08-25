import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared-module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Login2Component } from './auth/login-2/login-2.component';
import { ResetPassword2Component } from './auth/reset-password-2/reset-password-2.component';
import { ForgotPassword2Component } from './auth/forgot-password-2/forgot-password-2.component';
import { Success2Component } from './auth/success-2/success-2.component';
import { Error404Component } from './auth/error-404/error-404.component';
import { Error500Component } from './auth/error-500/error-500.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { httpInterceptor } from './interceptor/http.interceptor';
import { DOCUMENT } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@NgModule({
  declarations: [
    AppComponent,
    Login2Component,
    ResetPassword2Component,
    ForgotPassword2Component,
    Success2Component,

    Error404Component,
    Error500Component,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    NgScrollbarModule,
    BrowserAnimationsModule,
    ToastModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: httpInterceptor, multi: true },
    { provide: Document, useExisting: DOCUMENT },
    MessageService,
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
