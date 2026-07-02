import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Pigeonneau, Couple } from '../../types';
import { createPigeonneau, updatePigeonneau } from '../../services/pigeonneauService';
import { getCouples } from '../../services/coupleService';

interface Props { pigeonneau?: Pigeonneau; onSave: () => void; onCancel: () => void }

export function PigeonneauForm({ pigeonneau: p, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [couples, setCouples] = useState<Couple[]>([]);
  const [form, setForm] = useState({
    couple_id:    p?.couple_id    ?? 0,
    birth_date:   p?.birth_date   ?? today,
    sex:          p?.sex          ?? 'inconnu',
    weight:       p?.weight?.toString() ?? '',
    ring_number:  p?.ring_number  ?? '',
    status:       p?.status       ?? 'vivant',
    weaning_date: p?.weaning_date ?? '',
    sale_price:   p?.sale_price?.toString() ?? '',
    sale_date:    p?.sale_date    ?? '',
    buyer_name:   p?.buyer_name   ?? '',
    observations: p?.observations ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { getCouples().then(c => { setCouples(c); if (!p && c.length) setForm(f => ({ ...f, couple_id: c[0].id! })); }); }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.couple_id) { alert('Choisissez un couple'); return; }
    setSaving(true);
    const payload = {
      ...form,
      couple_id: Number(form.couple_id),
      weight:     form.weight     ? Number(form.weight)     : undefined,
      sale_price: form.sale_price ? Number(form.sale_price) : undefined,
    } as Pigeonneau;
    try {
      if (p?.id) await updatePigeonneau(p.id, payload);
      else        await createPigeonneau(payload);
      onSave();
    } finally { setSaving(false); }
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-500"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-800">{p ? 'Modifier' : 'Nouveau pigeonneau'}</h2>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Couple <span className="text-red-500">*</span></span>
          <select className="input mt-1" value={form.couple_id} onChange={set('couple_id')}>
            <option value={0}>— Choisir un couple —</option>
            {couples.map(c => <option key={c.id} value={c.id}>Nid #{c.nest_number}</option>)}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Date de naissance</span>
            <input className="input mt-1" type="date" value={form.birth_date} onChange={set('birth_date')} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Sexe</span>
            <select className="input mt-1" value={form.sex} onChange={set('sex')}>
              <option value="inconnu">Inconnu</option>
              <option value="male">Mâle</option>
              <option value="femelle">Femelle</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Poids (g)</span>
            <input className="input mt-1" type="number" value={form.weight} onChange={set('weight')} placeholder="ex: 350" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">N° bague</span>
            <input className="input mt-1" type="text" value={form.ring_number} onChange={set('ring_number')} placeholder="ex: P-001" />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Statut</span>
          <select className="input mt-1" value={form.status} onChange={set('status')}>
            <option value="vivant">Vivant</option>
            <option value="vendu">Vendu</option>
            <option value="decede">Décédé</option>
          </select>
        </label>

        {form.status === 'vendu' && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Prix de vente (FCFA)</span>
                <input className="input mt-1" type="number" value={form.sale_price} onChange={set('sale_price')} placeholder="0" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-gray-700">Date de vente</span>
                <input className="input mt-1" type="date" value={form.sale_date} onChange={set('sale_date')} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Nom de l'acheteur</span>
              <input className="input mt-1" type="text" value={form.buyer_name} onChange={set('buyer_name')} placeholder="Nom…" />
            </label>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Observations</span>
          <textarea className="input mt-1 resize-none" rows={2} value={form.observations} onChange={set('observations')} placeholder="Notes…" />
        </label>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
          <Save size={20} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
