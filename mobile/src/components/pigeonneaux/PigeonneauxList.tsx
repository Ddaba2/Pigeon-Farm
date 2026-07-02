import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Bird, Search } from 'lucide-react';
import { Pigeonneau } from '../../types';
import { getPigeonneaux, deletePigeonneau } from '../../services/pigeonneauService';
import { PigeonneauForm } from './PigeonneauForm';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';

const STATUS_COLORS: Record<string, string> = {
  vivant: 'bg-green-100 text-green-700',
  vendu:  'bg-blue-100 text-blue-700',
  decede: 'bg-gray-100 text-gray-500',
};

const SEX_LABELS: Record<string, string> = { male: '♂ Mâle', femelle: '♀ Femelle', inconnu: '? Inconnu' };

export function PigeonneauxList() {
  const [list, setList]           = useState<Pigeonneau[]>([]);
  const [editing, setEditing]     = useState<Pigeonneau | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [filter, setFilter]       = useState<'tous' | 'vivant' | 'vendu' | 'decede'>('tous');
  const [filterSex, setFilterSex] = useState<'tous' | 'male' | 'femelle' | 'inconnu'>('tous');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const { refreshStats }           = useApp();
  const { canEdit, canDelete }     = usePermissions();

  const load = useCallback(async () => { setLoading(true); setList(await getPigeonneaux()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = list.filter(p => {
    if (filter    !== 'tous' && p.status !== filter)               return false;
    if (filterSex !== 'tous' && (p.sex ?? 'inconnu') !== filterSex) return false;
    const q = search.toLowerCase();
    return !q ||
      (p.ring_number ?? '').toLowerCase().includes(q) ||
      (p.couple_nest ?? '').toLowerCase().includes(q) ||
      (p.buyer_name  ?? '').toLowerCase().includes(q) ||
      (SEX_LABELS[p.sex ?? 'inconnu']).toLowerCase().includes(q);
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce pigeonneau ?')) return;
    await deletePigeonneau(id); load(); refreshStats();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); refreshStats(); };

  if (showForm || editing) {
    return <PigeonneauForm pigeonneau={editing ?? undefined} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Pigeonneaux</h2>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white rounded-full p-3 shadow-lg active:scale-95 transition-transform">
            <Plus size={22} />
          </button>
        )}
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 text-sm"
          placeholder="Rechercher bague, nid, acheteur…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtre statut */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
        {(['tous', 'vivant', 'vendu', 'decede'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Filtre sexe */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([
          { v: 'tous',    l: 'Tous sexes' },
          { v: 'male',    l: '♂ Mâle' },
          { v: 'femelle', l: '♀ Femelle' },
          { v: 'inconnu', l: '? Inconnu' },
        ] as const).map(({ v, l }) => (
          <button key={v} onClick={() => setFilterSex(v)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterSex === v ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}>
            {l}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center shrink-0">{filtered.length}</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bird size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 mb-6">{search ? 'Aucun résultat' : 'Aucun pigeonneau'}</p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold">
              Ajouter
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <div key={p.id} className="card">
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 dark:text-gray-100">
                      {p.ring_number ? `Bague ${p.ring_number}` : `Pigeonneau #${p.id}`}
                    </span>
                    <span className={`badge ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    {!p.synced && <span className="badge bg-orange-100 text-orange-600">Non sync.</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    Nid #{p.couple_nest ?? p.couple_id} • {SEX_LABELS[p.sex ?? 'inconnu']}
                    {p.weight ? ` • ${p.weight}g` : ''}
                  </p>
                  {p.birth_date && <p className="text-xs text-gray-400 mt-0.5">Né le {new Date(p.birth_date).toLocaleDateString('fr-FR')}</p>}
                  {p.status === 'vendu' && p.sale_price && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      Vendu {p.sale_price.toLocaleString('fr-FR')} FCFA
                      {p.buyer_name ? ` à ${p.buyer_name}` : ''}
                    </p>
                  )}
                </div>
                {(canEdit || canDelete) && (
                  <div className="flex gap-1.5 ml-2 shrink-0">
                    {canEdit   && <button onClick={() => setEditing(p)} className="btn-icon text-blue-500 bg-blue-50 dark:bg-blue-900/30"><Edit2 size={17} /></button>}
                    {canDelete && <button onClick={() => p.id && handleDelete(p.id)} className="btn-icon text-red-500 bg-red-50 dark:bg-red-900/30"><Trash2 size={17} /></button>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
