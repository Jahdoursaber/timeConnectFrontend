import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginService } from '../user/login.service';
import { ToastUtilService } from '../toastUtil/toast-util.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
    private echo: Echo<any>;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  constructor(private loginService:LoginService,private toast: ToastUtilService ) {

    (window as any).Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'aa0f124c1124847f4126',
      cluster: 'eu',
      forceTLS: true,

    });

    // this.loginService.user$.subscribe(user => {
    //   if (user?.id) {
    //     this.listenToUserChannel(user.id);
    //   }
    // });
   this.listenForPublicNotifications();
  }

//  listenToUserChannel(userId: number) {
//     this.echo.private(`role.superviseur`).notification((notification: any) => {
//       // Ajoute la notification à la liste
//       const current = this.notificationsSubject.value;
//       this.notificationsSubject.next([notification, ...current]);
//       const msg =
//         notification.data?.message ||
//         notification.message ||
//         'Nouvelle notification !';
//       this.toast.showInfo(msg, 'Notification');
//     });
//   }
  // clear() {
  //   this.notificationsSubject.next([]);
  // }
   private listenForPublicNotifications() {
    this.echo.channel('test-public')
      .listen('TestPublicEvent', (data: any) => {
        // Ajoute la notif à l'historique
        console.log('Notification reçue via Echo:', data);
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([data, ...current]);
    const msg = data.message || 'Nouvelle notification publique !';
    this.toast.showInfo(msg, 'Notification publique');
      });
  }
   clear() {
    this.notificationsSubject.next([]);
  }
}
