import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { HealthRecord } from '../../types';
import { createHealthRecord, updateHealthRecord } from '../../services/healthService';

interface Props { record?: HealthRecord; onSave: () => void; onCancel: () => void }

export function HealthForm({ record, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    type:        record?.type        ?? 'vaccination',
    target_type: record?.target_type ?? 'tous',
    date:        record?.date        ?? today,
    product:     record?.product     ?? '',
    dose:        record?.dose        ?? '',
    next_due:    record?.next_due    ?? '',
    notes:       record?.notes       ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      if (record?.id) await updateHealthRecord(record.id, form as Partial<HealthRecord>);
      else             await createHealthRecord(form as Omit<HealthRecord, 'id'>);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-500"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-800">{record ? 'Modifier' : 'Nouveau soin'}</h2>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Type</span>
            <select className="input mt-1" value={form.type} onChange={set('type')}>
              <option value="vaccination">Vaccination</option>
              <option value="traitement">Traitement</option>
              <option value="prevention">Prévention</option>
              <option value="suivi">Suivi</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Cible</span>
            <select className="input mt-1" value={form.target_type} onChange={set('target_type')}>
              <option value="tous">Tous les pigeons</option>
              <option value="couple">Un couple</option>
              <option value="pigeonneau">Un pigeonneau</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Date du soin</span>
          <input className="input mt-1" type="date" value={form.date} onChange={set('date')} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Produit</span>
            <input className="input mt-1" type="text" value={form.product} onChange={set('product')} placeholder="Nom du vaccin…" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Dose</span>
            <input className="input mt-1" type="text" value={form.dose} onChange={set('dose')} placeholder="ex: 0.5 ml" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Prochain rappel</span>
          <input className="input mt-1" type="date" value={form.next_due} onChange={set('next_due')} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Notes</span>
          <textarea className="input mt-1 resize-none" rows={3} value={form.notes} onChange={set('notes')} placeholder="Observations…" />
        </label>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
          <Save size={20} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
