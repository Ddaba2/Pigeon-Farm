import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Egg, Couple } from '../../types';
import { createEgg, updateEgg } from '../../services/eggService';
import { getCouples } from '../../services/coupleService';

interface Props { egg?: Egg; onSave: () => void; onCancel: () => void }

export function EggForm({ egg, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [couples, setCouples] = useState<Couple[]>([]);
  const [form, setForm] = useState({
    couple_id:    egg?.couple_id   ?? 0,
    egg1_date:    egg?.egg1_date   ?? today,
    egg2_date:    egg?.egg2_date   ?? '',
    hatch_date:   egg?.hatch_date  ?? '',
    success1:     egg?.success1    ?? 0,
    success2:     egg?.success2    ?? 0,
    observations: egg?.observations ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { getCouples().then(c => { setCouples(c); if (!egg && c.length) setForm(p => ({ ...p, couple_id: c[0].id! })); }); }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(p => ({ ...p, [k]: e.target.value }));

  const toggle = (k: 'success1' | 'success2') => () => setForm(p => ({ ...p, [k]: p[k] ? 0 : 1 }));

  const handleSave = async () => {
    if (!form.couple_id) { alert('Choisissez un couple'); return; }
    setSaving(true);
    try {
      if (egg?.id) await updateEgg(egg.id, form as Partial<Egg>);
      else         await createEgg(form as Omit<Egg, 'id'>);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-500"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-800">{egg ? 'Modifier la ponte' : 'Nouvelle ponte'}</h2>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Couple <span className="text-red-500">*</span></span>
          <select className="input mt-1" value={form.couple_id} onChange={set('couple_id')}>
            <option value={0}>— Choisir un couple —</option>
            {couples.map(c => <option key={c.id} value={c.id}>Nid #{c.nest_number}{c.race ? ` – ${c.race}` : ''}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Date œuf 1</span>
            <input className="input mt-1" type="date" value={form.egg1_date} onChange={set('egg1_date')} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Date œuf 2</span>
            <input className="input mt-1" type="date" value={form.egg2_date} onChange={set('egg2_date')} />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Date d'éclosion prévue</span>
          <input className="input mt-1" type="date" value={form.hatch_date} onChange={set('hatch_date')} />
        </label>

        <div>
          <span className="text-sm font-medium text-gray-700 block mb-2">Résultat éclosion</span>
          <div className="flex gap-3">
            <button type="button" onClick={toggle('success1')}
              className={`flex-1 py-3 rounded-xl font-medium border-2 transition-colors ${form.success1 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
              Œuf 1 {form.success1 ? '✓ Éclos' : '✗ Non éclos'}
            </button>
            <button type="button" onClick={toggle('success2')}
              className={`flex-1 py-3 rounded-xl font-medium border-2 transition-colors ${form.success2 ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-400'}`}>
              Œuf 2 {form.success2 ? '✓ Éclos' : '✗ Non éclos'}
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Observations</span>
          <textarea className="input mt-1 resize-none" rows={3} value={form.observations} onChange={set('observations')} placeholder="Notes…" />
        </label>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
          <Save size={20} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
