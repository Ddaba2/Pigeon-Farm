import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Couple } from '../../types';
import { createCouple, updateCouple } from '../../services/coupleService';

interface Props { couple?: Couple; onSave: () => void; onCancel: () => void }

export function CoupleForm({ couple, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    nest_number:    couple?.nest_number    ?? '',
    male_ring:      couple?.male_ring      ?? '',
    female_ring:    couple?.female_ring    ?? '',
    race:           couple?.race           ?? '',
    formation_date: couple?.formation_date ?? today,
    status:         couple?.status         ?? 'actif',
    observations:   couple?.observations   ?? '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.nest_number.trim()) { alert('Le numéro de nid est obligatoire'); return; }
    setSaving(true);
    try {
      if (couple?.id) await updateCouple(couple.id, form as Couple);
      else            await createCouple(form as Omit<Couple, 'id'>);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-500">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {couple ? 'Modifier le couple' : 'Nouveau couple'}
        </h2>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">N° de nid <span className="text-red-500">*</span></span>
          <input className="input mt-1" type="text" value={form.nest_number} onChange={set('nest_number')} placeholder="ex: 01" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Bague mâle ♂</span>
            <input className="input mt-1" type="text" value={form.male_ring} onChange={set('male_ring')} placeholder="ML-001" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Bague femelle ♀</span>
            <input className="input mt-1" type="text" value={form.female_ring} onChange={set('female_ring')} placeholder="FL-001" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Race</span>
          <input className="input mt-1" type="text" value={form.race} onChange={set('race')} placeholder="ex: Mondain, Carneau…" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Date de formation</span>
          <input className="input mt-1" type="date" value={form.formation_date} onChange={set('formation_date')} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Statut</span>
          <select className="input mt-1" value={form.status} onChange={set('status')}>
            <option value="actif">✅ Actif</option>
            <option value="reproduction">🔄 En reproduction</option>
            <option value="inactif">❌ Inactif</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Observations</span>
          <textarea className="input mt-1 resize-none" rows={3} value={form.observations} onChange={set('observations')} placeholder="Notes…" />
        </label>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
          <Save size={20} />
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
