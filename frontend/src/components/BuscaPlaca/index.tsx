import React, { useState, useEffect, useRef } from 'react';
import { useParking, ParkingSpot } from '../../context/ParkingContext';
import { useNavigate } from 'react-router-dom';
import { Search, X, Car, Clock, MapPin } from 'lucide-react';

function statusColor(status: string) {
  const map: Record<string, string> = {
    Livre: 'var(--success)', Reservada: 'var(--warning)',
    Ocupada: 'var(--danger)', Expirada: 'var(--purple)', Inativa: 'var(--muted)',
  };
  return map[status] ?? 'var(--muted)';
}

export default function BuscaPlaca({ onClose }: { onClose: () => void }) {
  const { vagas } = useParking();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const q = query.toUpperCase().trim();
  const resultados: ParkingSpot[] = q.length < 2 ? [] : vagas.filter(v =>
    (v.placa?.toUpperCase().includes(q)) ||
    (v.cliente?.toUpperCase().includes(q)) ||
    (v.codigo?.toUpperCase().includes(q))
  );

  const irPara = (vaga: ParkingSpot) => {
    onClose();
    if (vaga.status === 'Reservada') navigate('/checkin');
    else if (vaga.status === 'Ocupada') navigate('/checkout');
    else navigate('/mapa');
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: '10vh',
      }}
      onMouseDown={e => e.currentTarget === e.target && onClose()}
    >
      <div style={{
        width: '100%', maxWidth: 560, background: 'var(--surface)',
        borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        border: '1px solid var(--line)',
      }}>
        {/* Search input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--line)' }}>
          <Search size={18} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por placa, cliente ou código da vaga..."
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontSize: 15, color: 'var(--text)', fontFamily: 'inherit',
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {q.length < 2 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <Search size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13 }}>Digite a placa, nome do cliente ou código da vaga</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.6 }}>Atalho: Ctrl+K · Fechar: Esc</p>
            </div>
          ) : resultados.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <p style={{ margin: 0, fontSize: 13 }}>Nenhum resultado para <strong style={{ color: 'var(--text)' }}>{query}</strong></p>
            </div>
          ) : resultados.map(v => (
            <button
              key={v.id}
              onClick={() => irPara(v)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 20px', background: 'transparent', border: 'none',
                borderBottom: '1px solid var(--line)', cursor: 'pointer', textAlign: 'left',
                transition: 'background .12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${statusColor(v.status)}18`,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Car size={18} style={{ color: statusColor(v.status) }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <strong style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text)', letterSpacing: '0.05em' }}>
                    {v.placa || '—'}
                  </strong>
                  <span style={{
                    fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 99,
                    background: `${statusColor(v.status)}20`, color: statusColor(v.status),
                  }}>
                    {v.status}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 12 }}>
                  {v.cliente && <span>👤 {v.cliente}</span>}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} /> Vaga {v.codigo}
                  </span>
                  {v.entrada && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {new Date(v.entrada).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', flexShrink: 0 }}>
                {v.status === 'Reservada' ? 'Check-in →' : v.status === 'Ocupada' ? 'Checkout →' : 'Ver mapa →'}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', gap: 16 }}>
          {[['↵', 'Ir para ação'], ['Esc', 'Fechar']].map(([k, v]) => (
            <span key={k} style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <kbd style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 4, padding: '1px 6px', fontFamily: 'monospace', fontSize: 10 }}>{k}</kbd>
              {v}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
