import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { Egg } from '../../types';
import { getEggs, deleteEgg } from '../../services/eggService';
import { EggForm } from './EggForm';
import { useApp } from '../../context/AppContext';
import { usePermissions } from '../../hooks/usePermissions';

function incubationDays(egg1Date?: string): string {
  if (!egg1Date) return '';
  const diff = Math.floor((Date.now() - new Date(egg1Date).getTime()) / 86400000);
  if (diff < 0) return '';
  if (diff > 21) return 'Éclos / dépassé';
  return `J+${diff} / 21`;
}

export function EggsList() {
  const [eggs, setEggs]       = useState<Egg[]>([]);
  const [editing, setEditing] = useState<Egg | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState<'tous' | 'en_cours' | 'ecloses' | 'echec'>('tous');
  const [loading, setLoading] = useState(true);
  const { refreshStats }      = useApp();
  const { canEdit, canDelete } = usePermissions();

  const load = useCallback(async () => { setLoading(true); setEggs(await getEggs()); setLoading(false); }, []);
  useEffect(() => { load(); }, [load]);

  const getStatus = (e: Egg) => {
    if (e.success1 || e.success2) return 'ecloses';
    if (e.hatch_date && new Date(e.hatch_date) < new Date()) return 'echec';
    return 'en_cours';
  };

  const filtered = eggs.filter(e => {
    const matchFilter = filter === 'tous' || getStatus(e) === filter;
    const q = search.toLowerCase();
    const matchSearch = !search || (e.couple_nest ?? '').toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette ponte ?')) return;
    await deleteEgg(id); load(); refreshStats();
  };

  const handleSaved = () => { setShowForm(false); setEditing(null); load(); refreshStats(); };

  if (showForm || editing) {
    return <EggForm egg={editing ?? undefined} onSave={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />;
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Pontes & Œufs</h2>
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
          placeholder="Rechercher par nid…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {([
          { v: 'tous',     l: 'Tous' },
          { v: 'en_cours', l: '🥚 En cours' },
          { v: 'ecloses',  l: '✓ Éclos' },
          { v: 'echec',    l: '✗ Échec' },
        ] as const).map(({ v, l }) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === v ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🥚</p>
          <p className="text-gray-400 mb-6">{search ? 'Aucun résultat' : 'Aucune ponte enregistrée'}</p>
          {!search && (
            <button onClick={() => setShowForm(true)} className="bg-primary-600 text-white px-8 py-3 rounded-full font-semibold">
              Enregistrer une ponte
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const days = incubationDays(e.egg1_date);
            return (
              <div key={e.id} className="card">
                <div className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-800">Nid #{e.couple_nest ?? e.couple_id}</span>
                      {days && (
                        <span className={`badge ${days.includes('dépassé') ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-700'}`}>
                          {days}
                        </span>
                      )}
                      {!e.synced && <span className="badge bg-orange-100 text-orange-600">Non sync.</span>}
                    </div>
                    <div className="flex gap-4 mt-1 flex-wrap">
                      {e.egg1_date && <span className="text-xs text-gray-500">🥚 {new Date(e.egg1_date).toLocaleDateString('fr-FR')}</span>}
                      {e.egg2_date && <span className="text-xs text-gray-500">🥚 {new Date(e.egg2_date).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    <div className="flex gap-2 mt-1.5">
                      <span className={`badge ${e.success1 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                        Œuf 1 {e.success1 ? '✓ Éclos' : '✗'}
                      </span>
                      <span className={`badge ${e.success2 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                        Œuf 2 {e.success2 ? '✓ Éclos' : '✗'}
                      </span>
                    </div>
                    {e.hatch_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Éclosion prévue : {new Date(e.hatch_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                  </div>
                  {(canEdit || canDelete) && (
                    <div className="flex gap-1.5 ml-2 shrink-0">
                      {canEdit   && <button onClick={() => setEditing(e)} className="btn-icon text-blue-500 bg-blue-50"><Edit2 size={17} /></button>}
                      {canDelete && <button onClick={() => e.id && handleDelete(e.id)} className="btn-icon text-red-500 bg-red-50"><Trash2 size={17} /></button>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
