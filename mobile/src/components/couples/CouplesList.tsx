import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Users, Search, History } from 'lucide-react';
import { Couple } from '../../types';
import { getCouples, deleteCouple } from '../../services/coupleService';
import { CoupleForm } from './CoupleForm';
import { CoupleHistory } from './CoupleHistory';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';

export function CouplesList() {
  const [couples, setCouples]         = useState<Couple[]>([]);
  const [editing, setEditing]         = useState<Couple | null>(null);
  const [showForm, setShowForm]       = useState(false);
  const [viewHistory, setViewHistory] = useState<Couple | null>(null);
  const [search, setSearch]           = useState('');
  const [filter, setFilter]           = useState<'tous' | 'actif' | 'inactif'>('tous');
  const [loading, setLoading]         = useState(true);
  const { refreshStats }              = useApp();
  const { canEdit, canDelete }        = usePermissions();

  const load = useCallback(async () => {
    setLoading(true);
    setCouples(await getCouples());
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = couples.filter(c => {
    const matchFilter = filter === 'tous' || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !search ||
      c.nest_number.toLowerCase().includes(q) ||
      (c.race ?? '').toLowerCase().includes(q) ||
      (c.male_ring ?? '').toLowerCase().includes(q) ||
      (c.female_ring ?? '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce couple et toutes ses données ?')) return;
    await deleteCouple(id); load(); refreshStats();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); refreshStats(); };

  if (viewHistory) {
    return <CoupleHistory couple={viewHistory} onBack={() => setViewHistory(null)} />;
  }
  if (showForm || editing) {
    return <CoupleForm couple={editing ?? undefined} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Couples reproducteurs</h2>
        {canEdit && (
          <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white rounded-full p-3 shadow-lg active:scale-95 transition-transform">
            <Plus size={22} />
          </button>
        )}
      </div>

      {/* Recherche */}
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 text-sm"
          placeholder="Rechercher nid, race, bague…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-4">
        {(['tous', 'actif', 'inactif'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} résultat(s)</span>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Users size={56} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 mb-6">{search ? 'Aucun résultat' : 'Aucun couple enregistré'}</p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold">
              Ajouter un couple
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <div key={c.id} className="card">
              <div className="flex items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800 dark:text-gray-100">Nid #{c.nest_number}</span>
                    <span className={`badge ${c.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {c.status}
                    </span>
                    {!c.synced && <span className="badge bg-orange-100 text-orange-600">Non sync.</span>}
                  </div>
                  {c.race && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Race : {c.race}</p>}
                  <div className="flex gap-4 mt-1">
                    {c.male_ring   && <span className="text-xs text-blue-600">♂ {c.male_ring}</span>}
                    {c.female_ring && <span className="text-xs text-pink-600">♀ {c.female_ring}</span>}
                  </div>
                  {c.formation_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Formé le {new Date(c.formation_date).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5 ml-2 shrink-0">
                  <button onClick={() => setViewHistory(c)} className="btn-icon text-purple-500 bg-purple-50 dark:bg-purple-900/30" title="Historique">
                    <History size={17} />
                  </button>
                  {canEdit && (
                    <button onClick={() => setEditing(c)} className="btn-icon text-blue-500 bg-blue-50 dark:bg-blue-900/30">
                      <Edit2 size={17} />
                    </button>
                  )}
                  {canDelete && (
                    <button onClick={() => c.id && handleDelete(c.id)} className="btn-icon text-red-500 bg-red-50 dark:bg-red-900/30">
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
