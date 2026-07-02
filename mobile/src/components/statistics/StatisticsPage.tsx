import React, { useState, useEffect } from 'react';
import { BarChart3, Download, FileJson, TrendingUp, Users, Egg, Bird, ShoppingCart, Heart } from 'lucide-react';
import { query } from '../../db/DatabaseService';
import { getSales } from '../../services/saleService';
import { getCouples } from '../../services/coupleService';
import { getPigeonneaux } from '../../services/pigeonneauService';
import { getEggs } from '../../services/eggService';
import { getHealthRecords } from '../../services/healthService';
import { downloadJSON, downloadPDF } from '../../utils/exportUtils';
import { TARGET_LABELS } from '../sales/SalesList';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonthRow  { month: string; cnt: number; revenue: number }
interface TypeRow   { target_type: string; cnt: number; revenue: number }
interface PayRow    { payment_method: string; cnt: number; revenue: number }
interface StatusRow { status: string; count: number }
interface TypeCntRow { type: string; count: number }

// ─── Composants graphiques ────────────────────────────────────────────────────

function BarRow({ label, value, max, color, unit = '' }: {
  label: string; value: number; max: number; color: string; unit?: string
}) {
  const pct = max > 0 ? Math.max(2, Math.round((value / max) * 100)) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-600 dark:text-gray-300 truncate max-w-[65%]">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-100 ml-2">
          {value.toLocaleString('fr-FR')}{unit}
        </span>
      </div>
      <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, children }: {
  title: string; icon: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="card mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon size={18} className="text-primary-600 shrink-0" />
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Fév', '03': 'Mar', '04': 'Avr',
  '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Aoû',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Déc',
};

const PAYMENT_LABELS: Record<string, string> = {
  especes:      'Espèces',
  mobile_money: 'Mobile Money',
  cheque:       'Chèque',
  virement:     'Virement',
  credit:       'Crédit',
  autre:        'Autre',
};

// ─── Page principale ──────────────────────────────────────────────────────────

export function StatisticsPage() {
  const [loading, setLoading]       = useState(true);
  const [exporting, setExporting]   = useState(false);
  const [monthlyData, setMonthly]   = useState<MonthRow[]>([]);
  const [salesByType, setSalesByType] = useState<TypeRow[]>([]);
  const [salesByPay, setSalesByPay]   = useState<PayRow[]>([]);
  const [coupleStatus, setCoupleStatus] = useState<StatusRow[]>([]);
  const [pigeonStatus, setPigeonStatus] = useState<StatusRow[]>([]);
  const [healthByType, setHealthByType] = useState<TypeCntRow[]>([]);
  const [eggSuccessRate, setEggRate]    = useState({ total: 0, success: 0 });
  const [globalRevenue, setGlobalRevenue] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [monthly, byType, byPay, coupleS, pigeonS, healthT, eggRows, revRow] = await Promise.all([
        query<MonthRow>(
          `SELECT strftime('%Y-%m', date) as month,
                  COUNT(*) as cnt,
                  COALESCE(SUM(amount),0) as revenue
           FROM sales GROUP BY month ORDER BY month DESC LIMIT 6`
        ),
        query<TypeRow>(
          `SELECT target_type, COUNT(*) as cnt, COALESCE(SUM(amount),0) as revenue
           FROM sales GROUP BY target_type`
        ),
        query<PayRow>(
          `SELECT payment_method, COUNT(*) as cnt, COALESCE(SUM(amount),0) as revenue
           FROM sales GROUP BY payment_method`
        ),
        query<StatusRow>(
          `SELECT status, COUNT(*) as count FROM couples GROUP BY status`
        ),
        query<StatusRow>(
          `SELECT status, COUNT(*) as count FROM pigeonneaux GROUP BY status`
        ),
        query<TypeCntRow>(
          `SELECT type, COUNT(*) as count FROM health_records GROUP BY type`
        ),
        query<{total:number; s1:number; s2:number}>(
          `SELECT COUNT(*) as total,
                  SUM(success1) as s1,
                  SUM(success2) as s2
           FROM eggs`
        ),
        query<{revenue:number}>(
          `SELECT COALESCE(SUM(amount),0) as revenue FROM sales`
        ),
      ]);
      setMonthly(monthly.reverse());
      setSalesByType(byType);
      setSalesByPay(byPay);
      setCoupleStatus(coupleS);
      setPigeonStatus(pigeonS);
      setHealthByType(healthT);
      const eg = eggRows[0] ?? { total: 0, s1: 0, s2: 0 };
      setEggRate({ total: (eg.total ?? 0) * 2, success: (eg.s1 ?? 0) + (eg.s2 ?? 0) });
      setGlobalRevenue(revRow[0]?.revenue ?? 0);
      setLoading(false);
    })();
  }, []);

  const handleExportJSON = async () => {
    setExporting(true);
    const [couples, pigeonneaux, eggs, sales, health] = await Promise.all([
      getCouples(), getPigeonneaux(), getEggs(), getSales(), getHealthRecords(),
    ]);
    downloadJSON(
      { exportedAt: new Date().toISOString(), couples, pigeonneaux, eggs, sales, health },
      `pigeon-farm-${new Date().toISOString().split('T')[0]}.json`
    );
    setExporting(false);
  };

  const handleExportPDF = async () => {
    setExporting(true);
    const [sales] = await Promise.all([getSales()]);
    const date = new Date().toLocaleDateString('fr-FR');

    downloadPDF(
      'Rapport Pigeon Farm',
      [
        {
          title: 'Revenus par mois',
          headers: ['Mois', 'Ventes', 'Revenus (FCFA)'],
          rows: monthlyData.map(m => {
            const [yr, mo] = m.month.split('-');
            return [`${MONTH_LABELS[mo] ?? mo} ${yr}`, m.cnt, m.revenue.toLocaleString('fr-FR')];
          }),
        },
        {
          title: 'Ventes par type',
          headers: ['Type', 'Quantité', 'Montant (FCFA)'],
          rows: salesByType.map(r => [TARGET_LABELS[r.target_type] ?? r.target_type, r.cnt, r.revenue.toLocaleString('fr-FR')]),
        },
        {
          title: 'Mode de paiement',
          headers: ['Méthode', 'Transactions', 'Total (FCFA)'],
          rows: salesByPay.map(r => [PAYMENT_LABELS[r.payment_method] ?? r.payment_method, r.cnt, r.revenue.toLocaleString('fr-FR')]),
        },
        {
          title: 'Toutes les ventes',
          headers: ['Date', 'Type', 'Qté', 'P.U (FCFA)', 'Total (FCFA)', 'Acheteur'],
          rows: sales.map(s => [
            new Date(s.date).toLocaleDateString('fr-FR'),
            TARGET_LABELS[s.target_type] ?? s.target_type,
            s.quantity,
            s.unit_price.toLocaleString('fr-FR'),
            s.amount.toLocaleString('fr-FR'),
            s.buyer_name ?? '—',
          ]),
        },
      ],
      `Généré le ${date} — Total revenus : ${globalRevenue.toLocaleString('fr-FR')} FCFA`
    );
    setExporting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Chargement des statistiques…</p>
      </div>
    );
  }

  const maxMonthRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
  const maxTypeRevenue  = Math.max(...salesByType.map(t => t.revenue), 1);
  const maxPayRevenue   = Math.max(...salesByPay.map(p => p.revenue), 1);
  const maxCoupleCount  = Math.max(...coupleStatus.map(c => c.count), 1);
  const maxPigeonCount  = Math.max(...pigeonStatus.map(p => p.count), 1);
  const maxHealthCount  = Math.max(...healthByType.map(h => h.count), 1);

  const coupleActif   = coupleStatus.find(c => c.status === 'actif')?.count ?? 0;
  const coupleInactif = coupleStatus.find(c => c.status === 'inactif')?.count ?? 0;
  const pVivant = pigeonStatus.find(p => p.status === 'vivant')?.count ?? 0;
  const pVendu  = pigeonStatus.find(p => p.status === 'vendu')?.count ?? 0;
  const pDecede = pigeonStatus.find(p => p.status === 'decede')?.count ?? 0;

  const successRate = eggSuccessRate.total > 0
    ? Math.round((eggSuccessRate.success / eggSuccessRate.total) * 100)
    : 0;

  const HEALTH_COLORS: Record<string, string> = {
    vaccination: 'bg-blue-400',
    traitement:  'bg-red-400',
    prevention:  'bg-yellow-400',
    suivi:       'bg-gray-400',
  };

  return (
    <div className="p-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <BarChart3 size={22} className="text-primary-600" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Statistiques</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
          >
            <FileJson size={15} />
            JSON
          </button>
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-1 px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
          >
            <Download size={15} />
            PDF
          </button>
        </div>
      </div>

      {/* Revenu total */}
      <div className="card mb-4 bg-primary-600 border-0">
        <p className="text-primary-100 text-sm">Revenus totaux</p>
        <p className="text-3xl font-bold text-white mt-1">{globalRevenue.toLocaleString('fr-FR')} FCFA</p>
      </div>

      {/* Revenus par mois */}
      {monthlyData.length > 0 && (
        <SectionCard title="Revenus des 6 derniers mois" icon={TrendingUp}>
          {monthlyData.map(m => {
            const [yr, mo] = m.month.split('-');
            return (
              <BarRow
                key={m.month}
                label={`${MONTH_LABELS[mo] ?? mo} ${yr}`}
                value={m.revenue}
                max={maxMonthRevenue}
                color="bg-primary-500"
                unit=" FCFA"
              />
            );
          })}
        </SectionCard>
      )}

      {/* Ventes par type */}
      {salesByType.length > 0 && (
        <SectionCard title="Ventes par type" icon={ShoppingCart}>
          {salesByType.map(t => (
            <BarRow
              key={t.target_type}
              label={TARGET_LABELS[t.target_type] ?? t.target_type}
              value={t.revenue}
              max={maxTypeRevenue}
              color="bg-purple-400"
              unit=" FCFA"
            />
          ))}
        </SectionCard>
      )}

      {/* Mode de paiement */}
      {salesByPay.length > 0 && (
        <SectionCard title="Modes de paiement" icon={TrendingUp}>
          {salesByPay.map(p => (
            <BarRow
              key={p.payment_method}
              label={PAYMENT_LABELS[p.payment_method] ?? p.payment_method}
              value={p.cnt}
              max={Math.max(...salesByPay.map(x => x.cnt), 1)}
              color="bg-indigo-400"
            />
          ))}
        </SectionCard>
      )}

      {/* Couples */}
      <SectionCard title="Statut des couples" icon={Users}>
        <BarRow label="Actifs"   value={coupleActif}   max={maxCoupleCount} color="bg-green-400" />
        <BarRow label="Inactifs" value={coupleInactif} max={maxCoupleCount} color="bg-gray-300" />
        <div className="text-xs text-gray-400 mt-2 text-right">
          Total : {coupleActif + coupleInactif} couples
        </div>
      </SectionCard>

      {/* Pigeonneaux */}
      <SectionCard title="Statut des pigeonneaux" icon={Bird}>
        <BarRow label="Vivants"  value={pVivant} max={maxPigeonCount} color="bg-green-400" />
        <BarRow label="Vendus"   value={pVendu}  max={maxPigeonCount} color="bg-blue-400" />
        <BarRow label="Décédés"  value={pDecede} max={maxPigeonCount} color="bg-gray-300" />
        <div className="text-xs text-gray-400 mt-2 text-right">
          Total : {pVivant + pVendu + pDecede} pigeonneaux
        </div>
      </SectionCard>

      {/* Œufs */}
      <SectionCard title="Taux d'éclosion" icon={Egg}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600 dark:text-gray-300">Œufs éclos</span>
          <span className="text-lg font-bold text-primary-600">{successRate}%</span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 rounded-full transition-all"
            style={{ width: `${successRate}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2 text-right">
          {eggSuccessRate.success} éclos / {eggSuccessRate.total} œufs suivis
        </p>
      </SectionCard>

      {/* Santé */}
      {healthByType.length > 0 && (
        <SectionCard title="Soins sanitaires" icon={Heart}>
          {healthByType.map(h => (
            <BarRow
              key={h.type}
              label={h.type.charAt(0).toUpperCase() + h.type.slice(1)}
              value={h.count}
              max={maxHealthCount}
              color={HEALTH_COLORS[h.type] ?? 'bg-gray-400'}
            />
          ))}
        </SectionCard>
      )}
    </div>
  );
}
