import React, { useState, useCallback, useEffect } from 'react';
import { useNotificacaoExpiracao } from '../../hooks/useNotificacaoExpiracao';
import { AlertTriangle, X } from 'lucide-react';

type Toast = { id: string; vagaCodigo: string; cliente: string; minutosRestantes: number };

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((t: Toast) => {
    setToasts(prev => [t, ...prev].slice(0, 5)); // máx 5 toasts
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== t.id)), 10_000);
  }, []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  useNotificacaoExpiracao(addToast);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9998,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div
          key={t.id}
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--warning)',
            borderLeft: '4px solid var(--warning)',
            borderRadius: 12,
            padding: '14px 16px',
            display: 'flex', alignItems: 'flex-start', gap: 12,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            minWidth: 300, maxWidth: 360,
            pointerEvents: 'all',
            animation: 'slideInRight 0.3s ease',
          }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(234,179,8,0.15)', display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>
              ⚠️ Reserva expirando — Vaga {t.vagaCodigo}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>
              <strong style={{ color: 'var(--text)' }}>{t.cliente}</strong> tem{' '}
              <strong style={{ color: 'var(--warning)' }}>{t.minutosRestantes} min</strong> para chegar.
            </div>
          </div>
          <button
            onClick={() => remove(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 2, flexShrink: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
