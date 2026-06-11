import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts';
import api from '../../services/api';
import { moeda } from '../../utils';

type PagamentoApi = {
  id: number;
  valorCobrado: number;
  registradoEm: string;
  formaPagamento: string;
};

function agruparPorDia(pagamentos: PagamentoApi[]) {
  const hoje = new Date();
  const dias: { data: string; label: string; receita: number; qtd: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit' });

    const doDia = pagamentos.filter(p =>
      p.registradoEm?.slice(0, 10) === key
    );
    dias.push({ data: key, label, receita: doDia.reduce((s, p) => s + (p.valorCobrado ?? 0), 0), qtd: doDia.length });
  }
  return dias;
}

function agruparPorHora(pagamentos: PagamentoApi[]) {
  const horas = Array.from({ length: 24 }, (_, h) => ({
    hora: `${String(h).padStart(2, '0')}h`,
    qtd: 0,
  }));
  for (const p of pagamentos) {
    const h = new Date(p.registradoEm).getHours();
    if (!isNaN(h)) horas[h].qtd += 1;
  }
  return horas;
}

const TOOLTIP_STYLE = {
  background: 'var(--surface)',
  border: '1px solid var(--line)',
  borderRadius: 8,
  color: 'var(--text)',
  fontSize: 12,
};

export default function GraficosReceita() {
  const [pagamentos, setPagamentos] = useState<PagamentoApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<PagamentoApi[] | { pagamentos?: PagamentoApi[] }>('/api/pagamentos')
      .then(({ data }) => {
        const lista = Array.isArray(data) ? data : (data.pagamentos ?? []);
        setPagamentos(lista);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const dadosDia = agruparPorDia(pagamentos);
  const dadosHora = agruparPorHora(pagamentos);
  const totalSemana = dadosDia.reduce((s, d) => s + d.receita, 0);

  if (loading) return null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
      {/* Receita por dia */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Receita — Últimos 7 dias</h3>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 12 }}>
              Total: <strong style={{ color: 'var(--accent)' }}>{moeda(totalSemana)}</strong>
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={dadosDia} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={v => v === 0 ? '' : `R$${v}`} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [moeda(Number(v ?? 0)), 'Receita']}
              labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
            />
            <Bar dataKey="receita" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Atendimentos por hora */}
      <div className="card" style={{ padding: '20px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>Horários de Pico</h3>
          <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 12 }}>Atendimentos por hora do dia (histórico)</p>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={dadosHora} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" vertical={false} />
            <XAxis dataKey="hora" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false}
              interval={2} />
            <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(v) => [Number(v ?? 0), 'Atendimentos']}
              labelStyle={{ color: 'var(--text)', fontWeight: 700 }}
            />
            <Line
              type="monotone" dataKey="qtd" stroke="var(--accent)"
              strokeWidth={2} dot={false} activeDot={{ r: 4, fill: 'var(--accent)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
