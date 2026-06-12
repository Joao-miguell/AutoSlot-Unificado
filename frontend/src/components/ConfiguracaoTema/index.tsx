import React, { useRef, useState } from 'react';
import { useTema, PRESETS_COR } from '../../hooks/useTema';
import { Upload, RotateCcw, Check } from 'lucide-react';

export default function ConfiguracaoTema() {
  const { config, salvarTema, resetarTema } = useTema();
  const [nomeTemp, setNomeTemp] = useState(config.nomeEmpresa);
  const [corCustomTemp, setCorCustomTemp] = useState(config.corCustom);
  const [salvo, setSalvo] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Logo muito grande. Use uma imagem menor que 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      salvarTema({ logoBase64: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSalvar = () => {
    salvarTema({
      nomeEmpresa: nomeTemp.trim() || 'AutoSlot',
      corCustom: corCustomTemp,
    });
    setSalvo(true);
    setTimeout(() => setSalvo(false), 2000);
  };

  const handleResetar = () => {
    if (!confirm('Resetar o tema para o padrão?')) return;
    resetarTema();
    setNomeTemp('AutoSlot');
    setCorCustomTemp('#f97316');
  };

  return (
    <section className="card settings-panel" style={{ marginTop: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0 }}>Identidade Visual</h3>
          <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 13 }}>
            Personalize o nome, logo e cor do sistema.
          </p>
        </div>
        <button
          className="btn btn-ghost mini"
          onClick={handleResetar}
          style={{ color: 'var(--muted)', gap: 6, fontSize: 12 }}
          title="Resetar tema padrão"
        >
          <RotateCcw size={13} /> Resetar
        </button>
      </div>

      <div className="row row-2" style={{ gap: 20, alignItems: 'start' }}>
        {/* Coluna esquerda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Nome da empresa */}
          <label className="field">
            <span>Nome da empresa</span>
            <input
              value={nomeTemp}
              onChange={e => setNomeTemp(e.target.value)}
              placeholder="Ex.: Estacionamento Central"
              maxLength={40}
            />
          </label>

          {/* Logo */}
          <div className="field">
            <span>Logo da empresa</span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
              {config.logoBase64 ? (
                <img
                  src={config.logoBase64}
                  alt="Logo"
                  style={{ height: 40, maxWidth: 120, objectFit: 'contain', borderRadius: 6, background: 'var(--surface-2)', padding: 4 }}
                />
              ) : (
                <div style={{
                  width: 40, height: 40, borderRadius: 6,
                  background: 'var(--surface-2)', display: 'grid', placeItems: 'center',
                  border: '1.5px dashed var(--line)', color: 'var(--muted)', fontSize: 18,
                }}>
                  🏢
                </div>
              )}
              <button
                className="btn btn-ghost mini"
                onClick={() => fileRef.current?.click()}
                style={{ gap: 6, fontSize: 12 }}
              >
                <Upload size={13} /> {config.logoBase64 ? 'Trocar' : 'Enviar logo'}
              </button>
              {config.logoBase64 && (
                <button
                  className="btn btn-ghost mini"
                  onClick={() => salvarTema({ logoBase64: '' })}
                  style={{ color: 'var(--danger)', fontSize: 12 }}
                >
                  Remover
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoUpload}
              />
            </div>
            <small style={{ color: 'var(--muted)', fontSize: 11, marginTop: 4, display: 'block' }}>
              PNG, JPG ou SVG · máx. 500KB
            </small>
          </div>
        </div>

        {/* Coluna direita — cores */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Cor principal
          </span>

          {/* Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PRESETS_COR.map((p, i) => (
              <button
                key={p.nome}
                title={p.nome}
                onClick={() => salvarTema({ presetIndex: i, usarCorCustom: false })}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: p.accent, border: 'none', cursor: 'pointer',
                  outline: (!config.usarCorCustom && config.presetIndex === i)
                    ? `3px solid ${p.accent}` : '3px solid transparent',
                  outlineOffset: 2,
                  transition: 'transform .15s, outline .15s',
                  transform: (!config.usarCorCustom && config.presetIndex === i) ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  position: 'relative',
                }}
              >
                {!config.usarCorCustom && config.presetIndex === i && (
                  <Check size={14} color="#fff" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
                )}
              </button>
            ))}
          </div>

          {/* Cor customizada */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={config.usarCorCustom}
                onChange={e => salvarTema({ usarCorCustom: e.target.checked })}
                style={{ width: 16, height: 16, accentColor: 'var(--accent)' }}
              />
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Cor personalizada</span>
            </label>
            <input
              type="color"
              value={corCustomTemp}
              onChange={e => {
                setCorCustomTemp(e.target.value);
                if (config.usarCorCustom) salvarTema({ corCustom: e.target.value });
              }}
              disabled={!config.usarCorCustom}
              style={{
                width: 36, height: 28, border: 'none', padding: 2,
                borderRadius: 6, cursor: config.usarCorCustom ? 'pointer' : 'not-allowed',
                background: 'var(--surface-2)', opacity: config.usarCorCustom ? 1 : 0.4,
              }}
            />
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>
              {corCustomTemp}
            </span>
          </div>

          {/* Preview */}
          <div style={{
            background: 'var(--accent)', borderRadius: 8, padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 10, marginTop: 4,
          }}>
            {config.logoBase64 ? (
              <img src={config.logoBase64} alt="" style={{ height: 22, width: 22, objectFit: 'contain', borderRadius: 4 }} />
            ) : (
              <span style={{ fontSize: 18 }}>🅿️</span>
            )}
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>{nomeTemp || 'AutoSlot'}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>Preview da sidebar</div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="btn btn-primary"
        style={{ marginTop: 20, width: '100%' }}
        onClick={handleSalvar}
      >
        {salvo ? <><Check size={14} /> Salvo!</> : 'Salvar Identidade Visual'}
      </button>
    </section>
  );
}
