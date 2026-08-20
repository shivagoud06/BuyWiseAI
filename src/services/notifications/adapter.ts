import { SmartNotification } from "./types";

export interface NotificationAdapter {
  name: string;
  sendNotification(notification: SmartNotification): Promise<boolean>;
}

/**
 * Safe In-Memory Mock Notification Adapter
 * Default adapter used in development, testing, and production until a real provider is linked.
 * Completely free, safe, and stores all dispatched notifications for inspection.
 */
export class MockNotificationAdapter implements NotificationAdapter {
  public name = "mock_adapter";
  private sentNotifications: SmartNotification[] = [];

  async sendNotification(notification: SmartNotification): Promise<boolean> {
    this.sentNotifications.push({ ...notification, delivered: true });

    if (process.env.NODE_ENV === "development") {
      // console.debug(`[MockNotificationAdapter] Delivered: [${notification.triggerType}] ${notification.title}`);
    }
    return true;
  }

  getSentNotifications(): SmartNotification[] {
    return [...this.sentNotifications];
  }

  clear(): void {
    this.sentNotifications = [];
  }
}

/**
 * Browser HTML5 Web Notification Adapter
 * Uses the standard Web Notification API if permitted by the user.
 */
export class BrowserNotificationAdapter implements NotificationAdapter {
  public name = "browser_push";

  async sendNotification(notification: SmartNotification): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    if (window.Notification.permission !== "granted") {
      return false;
    }

    try {
      const n = new window.Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
        tag: notification.dedupKey,
      });

      if (notification.targetUrl) {
        n.onclick = () => {
          window.focus();
          window.location.href = notification.targetUrl!;
        };
      }

      return true;
    } catch {
      return false;
    }
  }
}

let activeAdapter: NotificationAdapter = new MockNotificationAdapter();

export function getActiveNotificationAdapter(): NotificationAdapter {
  return activeAdapter;
}

export function setActiveNotificationAdapter(adapter: NotificationAdapter): void {
  activeAdapter = adapter;
}
