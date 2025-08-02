import { AppData } from '../types/types';

async function sendHealthAlertEmail(alertText: string, to: string) {
  await fetch('http://localhost:3001/send-health-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject: 'Alerte santé PigeonFarm',
      text: alertText,
      to
    })
  });
}

export function getDashboardAlerts(data: AppData, userEmail: string): string[] {
  const alerts: string[] = [];
  const now = new Date();

  // Soins sanitaires à venir (dans les 7 prochains jours)
  (data.healthRecords || []).forEach(record => {
    if (record.nextDue) {
      const due = new Date(record.nextDue);
      const diff = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (diff >= 0 && diff <= 7) {
        const alert = `Rappel sanitaire : ${record.type} pour ${record.targetType}${record.targetId ? ' #' + record.targetId : ''} prévu le ${due.toLocaleDateString()}`;
        alerts.push(alert);
        sendHealthAlertEmail(alert, userEmail); // Envoi email personnalisé
      }
    }
  });

  // Œufs proches d'éclosion (œuf pondu il y a 16-18 jours, pas encore éclos)
  (data.eggs || []).forEach(egg => {
    const egg1Date = new Date(egg.egg1Date);
    const diff1 = (now.getTime() - egg1Date.getTime()) / (1000 * 60 * 60 * 24);
    if (!egg.success1 && diff1 >= 16 && diff1 <= 18) {
      alerts.push(`Éclosion imminente : œuf 1 du couple #${egg.coupleId} (pondu le ${egg1Date.toLocaleDateString()})`);
    }
    if (egg.egg2Date) {
      const egg2Date = new Date(egg.egg2Date);
      const diff2 = (now.getTime() - egg2Date.getTime()) / (1000 * 60 * 60 * 24);
      if (!egg.success2 && diff2 >= 16 && diff2 <= 18) {
        alerts.push(`Éclosion imminente : œuf 2 du couple #${egg.coupleId} (pondu le ${egg2Date.toLocaleDateString()})`);
      }
    }
  });

  // Pigeonneaux à sevrer (vivants, âge > 28 jours, pas de date de sevrage)
  (data.pigeonneaux || []).forEach(p => {
    if (p.status === 'alive' && !p.weaningDate) {
      const birth = new Date(p.birthDate);
      const age = (now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24);
      if (age >= 28) {
        alerts.push(`Sevrage à prévoir : pigeonneau #${p.id} (né le ${birth.toLocaleDateString()})`);
      }
    }
  });

  return alerts;
} 