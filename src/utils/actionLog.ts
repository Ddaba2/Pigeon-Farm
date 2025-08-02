import { AppData, ActionLog } from '../types/types';

export function addActionLog(
  setData: (data: AppData) => void,
  data: AppData,
  log: Omit<ActionLog, 'id' | 'date'>,
) {
  const newLog: ActionLog = {
    ...log,
    id: Date.now(),
    date: new Date().toISOString(),
  };
  setData({
    ...data,
    actionLogs: [...(data.actionLogs || []), newLog],
  });
} 