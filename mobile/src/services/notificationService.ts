import { LocalNotifications } from '@capacitor/local-notifications';
import { getUpcomingDue } from './healthService';

const NOTIF_CHANNEL_ID = 'health-reminders';

async function isSupported(): Promise<boolean> {
  try {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

export async function scheduleHealthReminders(): Promise<void> {
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
