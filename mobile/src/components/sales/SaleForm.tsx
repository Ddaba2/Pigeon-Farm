import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Sale, Couple, Pigeonneau } from '../../types';
import { createSale, updateSale } from '../../services/saleService';
import { getCouples } from '../../services/coupleService';
import { getPigeonneaux } from '../../services/pigeonneauService';

interface Props { sale?: Sale; onSave: () => void; onCancel: () => void }

const TARGET_TYPES = [
  { value: 'pigeonneau', label: '🐦 Pigeonneau' },
  { value: 'male',       label: '♂ Mâle adulte' },
  { value: 'femelle',    label: '♀ Femelle adulte' },
  { value: 'couple',     label: '💑 Couple' },
  { value: 'oeuf',       label: '🥚 Œuf' },
];

export function SaleForm({ sale, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split('T')[0];
  const [couples, setCouples]       = useState<Couple[]>([]);
  const [pigeonneaux, setPigeonneaux] = useState<Pigeonneau[]>([]);
  const [form, setForm] = useState({
    target_type:    (sale?.target_type    ?? 'pigeonneau') as Sale['target_type'],
    target_id:      sale?.target_id       ?? '',
    date:           sale?.date            ?? today,
    quantity:       sale?.quantity?.toString()   ?? '1',
    unit_price:     sale?.unit_price?.toString() ?? '',
    buyer_name:     sale?.buyer_name      ?? '',
    payment_method: sale?.payment_method  ?? 'especes',
    notes:          sale?.notes           ?? '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCouples().then(setCouples);
    getPigeonneaux().then(p => setPigeonneaux(p.filter(x => x.status === 'vivant')));
  }, []);

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }));

  const setTargetType = (v: Sale['target_type']) =>
    setForm(f => ({ ...f, target_type: v, target_id: '' }));

  const total = (Number(form.quantity) || 0) * (Number(form.unit_price) || 0);

  const handleSave = async () => {
    if (!form.unit_price || !form.quantity) { alert('Prix et quantité obligatoires'); return; }
    setSaving(true);
    const payload = {
      target_type:    form.target_type,
      target_id:      form.target_id || undefined,
      date:           form.date,
      quantity:       Number(form.quantity),
      unit_price:     Number(form.unit_price),
      buyer_name:     form.buyer_name || undefined,
      payment_method: form.payment_method as Sale['payment_method'],
      notes:          form.notes || undefined,
    };
    try {
      if (sale?.id) await updateSale(sale.id, { ...payload, amount: total });
      else           await createSale(payload);
      onSave();
    } finally { setSaving(false); }
  };

  // Rendu du sélecteur de cible selon le type
  const renderTargetSelector = () => {
    if (form.target_type === 'couple') {
      return (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Couple vendu</span>
          <select className="input mt-1" value={form.target_id} onChange={set('target_id')}>
            <option value="">— Choisir un couple —</option>
            {couples.map(c => (
              <option key={c.id} value={String(c.id)}>
                Nid #{c.nest_number}{c.race ? ` – ${c.race}` : ''}
              </option>
            ))}
          </select>
        </label>
      );
    }
    if (form.target_type === 'pigeonneau') {
      return (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Pigeonneau vendu</span>
          <select className="input mt-1" value={form.target_id} onChange={set('target_id')}>
            <option value="">— Choisir un pigeonneau —</option>
            {pigeonneaux.map(p => (
              <option key={p.id} value={String(p.id)}>
                {p.ring_number ? `Bague ${p.ring_number}` : `Pigeonneau #${p.id}`}
                {p.couple_nest ? ` (Nid #${p.couple_nest})` : ''}
              </option>
            ))}
          </select>
        </label>
      );
    }
    if (form.target_type === 'male' || form.target_type === 'femelle') {
      return (
        <label className="block">
          <span className="text-sm font-medium text-gray-700">
            Bague du {form.target_type === 'male' ? 'mâle' : 'femelle'}
          </span>
          <select className="input mt-1" value={form.target_id} onChange={set('target_id')}>
            <option value="">— Choisir —</option>
            {couples.map(c => {
              const ring = form.target_type === 'male' ? c.male_ring : c.female_ring;
              if (!ring) return null;
              return (
                <option key={c.id} value={ring}>
                  {ring} (Nid #{c.nest_number})
                </option>
              );
            })}
          </select>
        </label>
      );
    }
    // oeuf
    return (
      <label className="block">
        <span className="text-sm font-medium text-gray-700">Couple concerné (optionnel)</span>
        <select className="input mt-1" value={form.target_id} onChange={set('target_id')}>
          <option value="">— Choisir un couple —</option>
          {couples.map(c => (
            <option key={c.id} value={String(c.id)}>Nid #{c.nest_number}</option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <div className="p-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onCancel} className="p-2 -ml-2 text-gray-500"><ArrowLeft size={24} /></button>
        <h2 className="text-xl font-bold text-gray-800">{sale ? 'Modifier la vente' : 'Nouvelle vente'}</h2>
      </div>

      <div className="space-y-4">
        {/* Type d'article vendu */}
        <div>
          <span className="text-sm font-medium text-gray-700 block mb-2">
            Qu'est-ce qui a été vendu ? <span className="text-red-500">*</span>
          </span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {TARGET_TYPES.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTargetType(t.value as Sale['target_type'])}
                className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-colors text-left ${
                  form.target_type === t.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sélecteur de cible selon le type */}
        {renderTargetSelector()}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Date de vente</span>
          <input className="input mt-1" type="date" value={form.date} onChange={set('date')} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Quantité <span className="text-red-500">*</span></span>
            <input className="input mt-1" type="number" min="1" value={form.quantity} onChange={set('quantity')} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Prix unitaire (FCFA) <span className="text-red-500">*</span></span>
            <input className="input mt-1" type="number" min="0" value={form.unit_price} onChange={set('unit_price')} placeholder="0" />
          </label>
        </div>

        {total > 0 && (
          <div className="bg-primary-50 rounded-xl px-4 py-3 text-center">
            <p className="text-sm text-primary-700">Total</p>
            <p className="text-2xl font-bold text-primary-800">{total.toLocaleString('fr-FR')} FCFA</p>
          </div>
        )}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Nom de l'acheteur</span>
          <input className="input mt-1" type="text" value={form.buyer_name} onChange={set('buyer_name')} placeholder="Nom…" />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Mode de paiement</span>
          <select className="input mt-1" value={form.payment_method} onChange={set('payment_method')}>
            <option value="especes">💵 Espèces</option>
            <option value="mobile_money">📱 Mobile Money (Orange, Wave…)</option>
            <option value="virement">🏦 Virement bancaire</option>
            <option value="cheque">📄 Chèque</option>
            <option value="credit">⏳ Crédit (à terme)</option>
            <option value="autre">— Autre</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Notes</span>
          <textarea className="input mt-1 resize-none" rows={2} value={form.notes} onChange={set('notes')} placeholder="Remarques…" />
        </label>

        <button onClick={handleSave} disabled={saving} className="btn-primary mt-2">
          <Save size={20} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>
    </div>
  );
}
