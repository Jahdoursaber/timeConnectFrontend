import { Injectable } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoginService } from '../user/login.service';
import { ToastUtilService } from '../toastUtil/toast-util.service';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
const TITLE_BY_TYPE: Record<string, string> = {
  acompte: 'Demande d’acompte',
  other_request: 'Autre demande',
  conge: 'Demande de congé',
};

const ICON_BY_TYPE: Record<string, string> = {
  acompte: 'dollar-sign',
  other_request: 'message-square',
  conge: 'calendar',
};
export interface UiNotif {
  id?: string;
  type?: string;
  message: string;
  url?: string | null;
  icon?: string | null;
  read?: boolean;        // pour la liste
  created_at?: string;   // ISO string
  _raw?: any;
}
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private subscribedRh = false;
  private echo: Echo<any>;
  private notificationsSubject = new BehaviorSubject<any[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private latestSubject = new BehaviorSubject<UiNotif[]>([]);
  public latest$ = this.latestSubject.asObservable();
  private syncing = false;
private syncTimer: any = null;
  constructor(
    private loginService: LoginService,
    private toast: ToastUtilService,
    private http: HttpClient,
  ) {
    (window as any).Pusher = Pusher;

    this.echo = new Echo({
      broadcaster: 'pusher',
      key: 'aa0f124c1124847f4126',
      cluster: 'eu',
      forceTLS: true,
      authorizer: (channel: any, options: any) => {
        return {
          authorize: (socketId: string, callback: any) => {
            fetch(`${environment.apiUrl}broadcasting/auth`, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({
                socket_id: socketId,
                channel_name: channel.name,
              }),
            })
              .then(async (res) => {
                if (!res.ok) {
                  const err = await res.text();
                  throw new Error(err || `Auth failed: ${res.status}`);
                }
                return res.json();
              })
              .then((data) => callback(false, data))
              .catch((err) => callback(true, err));
          },
        };
      },
    });
  }

//   public startRhChannel(): void {
//   if (this.subscribedRh) return;
//   this.subscribedRh = true;

//   const channel = this.echo.private('role.rh');

//   // Nettoyage d'éventuels anciens handlers
//   channel.stopListening('.advance.requested.created');
//   channel.stopListening('.other-request.created');
//   // (A) Notifications Laravel (si tu en diffuses encore ailleurs)
//   channel.notification((raw: any) => {
//     const notif = this.normalizeNotification(raw);
//     const title = TITLE_BY_TYPE[notif.type] ?? 'Notification';
//     this.notificationsSubject.next([notif, ...this.notificationsSubject.value]);
//     this.toast.showInfo(notif.message, title);
//   });

//   // (B) TON Event de l’observer (nom=AdvanceRequested ou alias)
//   channel.listen('.advance.requested.created', (payload: any) => {

//     const notif = this.normalizeNotification(payload);
//     const title = TITLE_BY_TYPE[notif.type] ?? 'Notification';
//     this.notificationsSubject.next([notif, ...this.notificationsSubject.value]);
//     this.toast.showInfo(notif.message, title);
//   });

//   channel.listen('.other-request.created', (payload: any) => {
//     const notif = this.normalizeNotification(payload); // payload.data
//     const title = TITLE_BY_TYPE[notif.type] ?? 'Notification';
//     this.notificationsSubject.next([notif, ...this.notificationsSubject.value]);
//     this.toast.showInfo(notif.message, title);
//   });
// }

//   private normalizeNotification(raw: any) {
//     const data = raw?.data ?? raw ?? {};
//     return {
//       type: data.type ?? null,
//       message: data.message ?? raw?.message ?? 'Nouvelle notification',
//       url: data.url ?? null,
//       icon: data.icon ?? null,
//       _raw: raw,
//     };
//   }

  clear() {
    this.notificationsSubject.next([]);
  }

  async init(): Promise<void> {
  await this.syncFromServer();
  this.subscribeRealtime();
}

  async refreshUnreadCount(): Promise<void> {

    const r = await fetch(`${environment.baseUrl}notifications/unread-count`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const j = await r.json();
    this.unreadCountSubject.next(j.unread ?? 0);
  }

  async refreshLatest(limit = 5): Promise<void> {
    const r = await fetch(`${environment.baseUrl}notifications?limit=${limit}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });
    const j = await r.json();
    this.latestSubject.next(j.items ?? []);
  }

  async markAsRead(id: string): Promise<void> {
  await firstValueFrom(
    this.http.patch(
      `${environment.baseUrl}notifications/${id}/read`,
      {},                                   // body vide
      { withCredentials: true }             // cookies envoyés
    )
  );

  // MàJ locale
  const list = this.latestSubject.value.map(n => n.id === id ? { ...n, read: true } : n);
  this.latestSubject.next(list);
  this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
}
  private subscribeRealtime(): void {
  if (this.subscribedRh) return;
  this.subscribedRh = true;

  const channel = this.echo.private('role.rh');

  // Make sure we don't have old listeners
  channel.stopListening('.advance.requested.created');
  channel.stopListening('.other-request.created');

  const onIncoming = (payload: any) => {
    // 1) Show toast immediately
    const data = payload?.data ?? payload ?? {};
    this.toast.showInfo(
      data.message || 'Nouvelle notification',
      this.titleByType(data.type)
    );

    // 2) Soft-debounce a full sync from server (counter + latest 5)
    this.queueSyncFromServer();
  };

  channel.listen('.advance.requested.created', onIncoming);
  channel.listen('.other-request.created', onIncoming);
}

/** Debounced sync: refresh unread count + latest 5 from backend */
private queueSyncFromServer(delayMs = 200) {
  if (this.syncTimer) clearTimeout(this.syncTimer);
  this.syncTimer = setTimeout(() => this.syncFromServer(), delayMs);
}

private async syncFromServer() {
  if (this.syncing) return; // serialize syncs
  this.syncing = true;
  try {
    await this.refreshUnreadCount();
    await this.refreshLatest(5);
  } finally {
    this.syncing = false;
  }
}

  private titleByType(type?: string) {
    if (type === 'acompte') return 'Demande d’acompte';
    if (type === 'other_request') return 'Autre demande';
    if (type === 'conge') return 'Demande de congé';
    return 'Notification';
  }

}
