import React, { useState, useEffect } from 'react';
import { ArrowLeft, Egg, Bird, Heart, ShoppingCart } from 'lucide-react';
import { Couple, Egg as EggType, Pigeonneau, HealthRecord, Sale } from '../../types';
import { getEggs } from '../../services/eggService';
import { getPigeonneaux } from '../../services/pigeonneauService';
import { getHealthRecords } from '../../services/healthService';
import { getSales } from '../../services/saleService';
import { TARGET_LABELS } from '../sales/SalesList';

interface Props { couple: Couple; onBack: () => void }

type Tab = 'pontes' | 'pigeonneaux' | 'sante' | 'ventes';

const SEX_LABELS: Record<string, string> = { male: '♂ Mâle', femelle: '♀ Femelle', inconnu: '? Inconnu' };
const TYPE_LABELS_H: Record<string, string> = {
  vaccination: '💉 Vaccination',
  traitement:  '💊 Traitement',
  prevention:  '🛡 Prévention',
  suivi:       '📋 Suivi',
};

export function CoupleHistory({ couple, onBack }: Props) {
  const [tab, setTab]           = useState<Tab>('pontes');
  const [eggs, setEggs]         = useState<EggType[]>([]);
  const [pigeons, setPigeons]   = useState<Pigeonneau[]>([]);
  const [health, setHealth]     = useState<HealthRecord[]>([]);
  const [sales, setSales]       = useState<Sale[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [allEggs, allPigeons, allHealth, allSales] = await Promise.all([
        getEggs(), getPigeonneaux(), getHealthRecords(), getSales(),
      ]);
      const cid = couple.id!;
      setEggs(allEggs.filter(e => e.couple_id === cid));
      setPigeons(allPigeons.filter(p => p.couple_id === cid));
      setHealth(allHealth.filter(h =>
        (h.target_type === 'couple' && h.target_id === cid) ||
        h.target_type === 'tous'
      ));
      setSales(allSales.filter(s =>
        s.target_id === String(cid) && (s.target_type === 'couple' || s.target_type === 'oeuf')
      ));
      setLoading(false);
    })();
  }, [couple.id]);

  const TABS: { id: Tab; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'pontes',     label: 'Pontes',     icon: Egg,          count: eggs.length },
    { id: 'pigeonneaux',label: 'Pigeonneaux',icon: Bird,         count: pigeons.length },
    { id: 'sante',      label: 'Santé',      icon: Heart,        count: health.length },
    { id: 'ventes',     label: 'Ventes',     icon: ShoppingCart, count: sales.length },
  ];

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 dark:text-gray-300">
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Nid #{couple.nest_number}
          </h2>
          {couple.race && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{couple.race}</p>
          )}
        </div>
        <span className={`ml-auto badge ${couple.status === 'actif' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {couple.status}
        </span>
      </div>

      {/* Infos couple */}
      <div className="card mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <div className="grid grid-cols-2 gap-2 text-sm">
          {couple.male_ring   && <div><span className="text-blue-600">♂</span> {couple.male_ring}</div>}
          {couple.female_ring && <div><span className="text-pink-600">♀</span> {couple.female_ring}</div>}
          {couple.formation_date && (
            <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400">
              Formé le {new Date(couple.formation_date).toLocaleDateString('fr-FR')}
            </div>
          )}
          {couple.observations && (
            <div className="col-span-2 text-xs text-gray-500 dark:text-gray-400 italic">
              {couple.observations}
            </div>
          )}
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Icon size={14} />
            {label}
            <span className={`text-xs rounded-full px-1.5 ${tab === id ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Chargement…</div>
      ) : (
        <>
          {/* PONTES */}
          {tab === 'pontes' && (
            eggs.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Aucune ponte enregistrée</div>
            ) : (
              <div className="space-y-3">
                {eggs.map(e => (
                  <div key={e.id} className="card">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {e.egg1_date && <span className="text-xs text-gray-500">🥚 {new Date(e.egg1_date).toLocaleDateString('fr-FR')}</span>}
                      {e.egg2_date && <span className="text-xs text-gray-500">🥚 {new Date(e.egg2_date).toLocaleDateString('fr-FR')}</span>}
                    </div>
                    <div className="flex gap-2">
                      <span className={`badge ${e.success1 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                        Œuf 1 {e.success1 ? '✓' : '✗'}
                      </span>
                      <span className={`badge ${e.success2 ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-400'}`}>
                        Œuf 2 {e.success2 ? '✓' : '✗'}
                      </span>
                    </div>
                    {e.hatch_date && (
                      <p className="text-xs text-gray-400 mt-1">
                        Éclosion : {new Date(e.hatch_date).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {e.observations && <p className="text-xs text-gray-400 mt-1 italic">{e.observations}</p>}
                  </div>
                ))}
              </div>
            )
          )}

          {/* PIGEONNEAUX */}
          {tab === 'pigeonneaux' && (
            pigeons.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Aucun pigeonneau</div>
            ) : (
              <div className="space-y-3">
                {pigeons.map(p => (
                  <div key={p.id} className="card">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {p.ring_number ? `Bague ${p.ring_number}` : `Pigeonneau #${p.id}`}
                      </span>
                      <span className={`badge ${p.status === 'vivant' ? 'bg-green-100 text-green-700' : p.status === 'vendu' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {SEX_LABELS[p.sex ?? 'inconnu']}
                      {p.weight ? ` · ${p.weight}g` : ''}
                      {p.birth_date ? ` · Né le ${new Date(p.birth_date).toLocaleDateString('fr-FR')}` : ''}
                    </p>
                    {p.status === 'vendu' && p.sale_price && (
                      <p className="text-xs text-blue-600 mt-1">
                        Vendu {p.sale_price.toLocaleString('fr-FR')} FCFA
                        {p.buyer_name ? ` à ${p.buyer_name}` : ''}
                        {p.sale_date ? ` le ${new Date(p.sale_date).toLocaleDateString('fr-FR')}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )
          )}

          {/* SANTÉ */}
          {tab === 'sante' && (
            health.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Aucun soin enregistré</div>
            ) : (
              <div className="space-y-3">
                {health.map(h => (
                  <div key={h.id} className="card">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="badge bg-blue-100 text-blue-700">{TYPE_LABELS_H[h.type] ?? h.type}</span>
                      {h.product && <span className="font-semibold text-sm text-gray-800 dark:text-gray-100">{h.product}</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(h.date).toLocaleDateString('fr-FR')}</span>
                      {h.dose && <span>Dose : {h.dose}</span>}
                      <span className="badge bg-gray-100 text-gray-500">{h.target_type ?? 'tous'}</span>
                    </div>
                    {h.next_due && (
                      <p className="text-xs text-primary-600 mt-1">
                        Rappel : {new Date(h.next_due).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {h.notes && <p className="text-xs text-gray-400 mt-1 italic truncate">{h.notes}</p>}
                  </div>
                ))}
              </div>
            )
          )}

          {/* VENTES */}
          {tab === 'ventes' && (
            sales.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Aucune vente liée à ce couple</div>
            ) : (
              <div className="space-y-3">
                {sales.map(s => (
                  <div key={s.id} className="card">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="badge bg-primary-100 text-primary-700">
                        {TARGET_LABELS[s.target_type] ?? s.target_type}
                      </span>
                      <span className="font-bold text-gray-800 dark:text-gray-100">
                        {s.amount.toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {s.quantity} × {s.unit_price.toLocaleString('fr-FR')} FCFA
                    </p>
                    <div className="flex gap-3 text-xs text-gray-400 mt-1">
                      <span>{new Date(s.date).toLocaleDateString('fr-FR')}</span>
                      {s.buyer_name && <span>Acheteur : {s.buyer_name}</span>}
                    </div>
                  </div>
                ))}
                <div className="card bg-primary-50 dark:bg-primary-900/20 border-primary-100">
                  <p className="text-sm text-primary-700 dark:text-primary-300">Total ventes</p>
                  <p className="font-bold text-primary-800 dark:text-primary-200 text-lg">
                    {sales.reduce((s, v) => s + v.amount, 0).toLocaleString('fr-FR')} FCFA
                  </p>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
