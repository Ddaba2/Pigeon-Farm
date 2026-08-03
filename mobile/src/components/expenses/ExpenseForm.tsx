import React, { useState } from 'react';
import { Save, X } from 'lucide-react';
import { Expense, ExpenseCategory } from '../../types';
import { createExpense, updateExpense } from '../../services/expenseService';

const CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'alimentation',  label: 'Alimentation' },
  { value: 'medicaments',   label: 'Médicaments' },
  { value: 'equipement',    label: 'Équipement' },
  { value: 'veterinaire',   label: 'Vétérinaire' },
  { value: 'transport',     label: 'Transport' },
  { value: 'autre',         label: 'Autre' },
];

interface Props {
  expense?: Expense;
  onSave: () => void;
  onCancel: () => void;
}

export function ExpenseForm({ expense, onSave, onCancel }: Props) {
  const [category, setCategory]     = useState<ExpenseCategory>(expense?.category ?? 'alimentation');
  const [date, setDate]             = useState(expense?.date ?? new Date().toISOString().split('T')[0]);
  const [amount, setAmount]         = useState(expense?.amount?.toString() ?? '');
  const [description, setDescription] = useState(expense?.description ?? '');
  const [notes, setNotes]           = useState(expense?.notes ?? '');
  const [saving, setSaving]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;
    setSaving(true);
    try {
      const data = { category, date, amount: parseFloat(amount), description: description.trim() || undefined, notes: notes.trim() || undefined };
      if (expense?.id) {
        await updateExpense(expense.id, data);
      } else {
        await createExpense(data);
      }
      onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {expense ? 'Modifier la dépense' : 'Nouvelle dépense'}
        </h2>
        <button onClick={onCancel} className="btn-icon text-gray-400 bg-gray-100 dark:bg-gray-800">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Catégorie</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value as ExpenseCategory)}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Date</label>
          <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} required />
        </div>

        <div>
          <label className="label">Montant (FCFA)</label>
          <input
            type="number"
            className="input"
            placeholder="Ex : 5000"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="1"
            step="1"
            required
          />
        </div>

        <div>
          <label className="label">Description</label>
          <input
            className="input"
            placeholder="Ex : Sacs de mil, Vermifuge…"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Informations complémentaires…"
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={saving || !amount} className="btn-primary mt-2">
          <Save size={18} />
          {saving ? 'Enregistrement…' : expense ? 'Modifier' : 'Enregistrer'}
        </button>
      </form>
    </div>
  );
}
