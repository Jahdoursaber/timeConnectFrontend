
import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class ToastUtilService {
  constructor(private messageService: MessageService) {}

  showSuccess(detail: string, summary: string = 'Succès') {
    this.messageService.add({
      severity: 'success',
      summary,
      detail,
      styleClass: 'success-light-popover'
    });
  }

  showError(detail: string, summary: string = 'Erreur') {
    this.messageService.add({
      severity: 'error',
      summary,
      detail,
      styleClass: 'danger-light-popover'
    });
  }

  showInfo(detail: string, summary: string = 'Info') {
    this.messageService.add({
      severity: 'info',
      summary,
      detail,
      styleClass: 'info-light-popover'
    });
  }
}
