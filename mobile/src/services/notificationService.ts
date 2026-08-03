import { LocalNotifications } from '@capacitor/local-notifications';
import { getUpcomingDue } from './healthService';
import { getSetting, setSetting } from './userService';

const NOTIF_CHANNEL_ID = 'health-reminders';
const REMINDERS_ENABLED_KEY = 'health_reminders_enabled';

async function isSupported(): Promise<boolean> {
  try {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

// Activés par défaut : seule une désactivation explicite dans les réglages
// (valeur 'false' stockée) désactive les rappels.
export async function areHealthRemindersEnabled(): Promise<boolean> {
  return (await getSetting(REMINDERS_ENABLED_KEY)) !== 'false';
}

export async function setHealthRemindersEnabled(enabled: boolean): Promise<void> {
  await setSetting(REMINDERS_ENABLED_KEY, enabled ? 'true' : 'false');
  if (enabled) {
    await scheduleHealthReminders();
  } else {
    try { await LocalNotifications.cancel(await LocalNotifications.getPending()); } catch { /* ignore */ }
  }
}

// Permet à l'UI de réagir au tap sur une notification (navigation vers la fiche santé).
export async function initHealthReminderTapListener(onTap: (recordId: number) => void): Promise<void> {
  try {
    await LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const recordId = action.notification.extra?.recordId;
      if (recordId != null) onTap(Number(recordId));
    });
  } catch {
    // API non disponible (ex: web) — best-effort, silencieux
  }
}

export async function scheduleHealthReminders(): Promise<void> {
  if (!(await areHealthRemindersEnabled())) return;

  const supported = await isSupported();
  if (!supported) return;

  try {
    // Crée le canal Android (ignoré sur iOS)
    await LocalNotifications.createChannel({
      id: NOTIF_CHANNEL_ID,
      name: 'Rappels sanitaires',
      description: 'Notifications pour les vaccinations et traitements à venir',
      importance: 4,
      visibility: 1,
      vibration: true,
    });

    // Annule les anciennes notifications programmées
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const records = await getUpcomingDue();
    if (records.length === 0) return;

    const today = new Date();
    const notifications = records
      .filter(r => r.next_due)
      .map((r, i) => {
        const dueDate = new Date(r.next_due!);
        // Programmer à 8h le jour du rappel (ou dans 1 min si passé)
        dueDate.setHours(8, 0, 0, 0);
        const scheduleAt = dueDate < today ? new Date(today.getTime() + 60000) : dueDate;

        return {
          id: 1000 + i,
          title: '🩺 Rappel sanitaire',
          body: r.product
            ? `${r.product} prévu pour ${new Date(r.next_due!).toLocaleDateString('fr-FR')}`
            : `Rappel ${r.type} prévu pour ${new Date(r.next_due!).toLocaleDateString('fr-FR')}`,
          channelId: NOTIF_CHANNEL_ID,
          schedule: { at: scheduleAt },
          extra: { recordId: r.id, type: r.type },
        };
      });

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
  } catch (err) {
    console.warn('Notifications non disponibles:', err);
  }
}
