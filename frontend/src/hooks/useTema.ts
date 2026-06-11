import { useState, useEffect, useCallback } from 'react';

export type PresetCor = {
  nome: string;
  accent: string;
  accentSub: string;
  accentHover: string;
};

export const PRESETS_COR: PresetCor[] = [
  { nome: 'Laranja',  accent: '#f97316', accentSub: 'rgba(249,115,22,0.12)', accentHover: '#ea6c0a' },
  { nome: 'Azul',     accent: '#3b82f6', accentSub: 'rgba(59,130,246,0.12)',  accentHover: '#2563eb' },
  { nome: 'Verde',    accent: '#22c55e', accentSub: 'rgba(34,197,94,0.12)',   accentHover: '#16a34a' },
  { nome: 'Roxo',     accent: '#a855f7', accentSub: 'rgba(168,85,247,0.12)',  accentHover: '#9333ea' },
  { nome: 'Rosa',     accent: '#ec4899', accentSub: 'rgba(236,72,153,0.12)',  accentHover: '#db2777' },
  { nome: 'Ciano',    accent: '#06b6d4', accentSub: 'rgba(6,182,212,0.12)',   accentHover: '#0891b2' },
];

export type ConfigTema = {
  nomeEmpresa: string;
  logoBase64: string;
  presetIndex: number;
  corCustom: string;
  usarCorCustom: boolean;
};

const STORAGE_KEY = '@AutoSlot:tema';

const PADRAO: ConfigTema = {
  nomeEmpresa: 'AutoSlot',
  logoBase64: '',
  presetIndex: 0,
  corCustom: '#f97316',
  usarCorCustom: false,
};

function aplicarCssVars(config: ConfigTema) {
  const root = document.documentElement;
  const preset = PRESETS_COR[config.presetIndex] ?? PRESETS_COR[0];
  const accent = config.usarCorCustom ? config.corCustom : preset.accent;

  // Gera hover e sub a partir da cor customizada
  const accentSub = config.usarCorCustom
    ? `${accent}20`
    : preset.accentSub;
  const accentHover = config.usarCorCustom
    ? accent
    : preset.accentHover;

  root.style.setProperty('--accent', accent);
  root.style.setProperty('--accent-sub', accentSub);
  root.style.setProperty('--accent-hover', accentHover);
}

export function useTema() {
  const [config, setConfig] = useState<ConfigTema>(() => {
    try {
      const salvo = localStorage.getItem(STORAGE_KEY);
      return salvo ? { ...PADRAO, ...JSON.parse(salvo) } : PADRAO;
    } catch {
      return PADRAO;
    }
  });

  // Aplica as CSS vars sempre que a config mudar
  useEffect(() => {
    aplicarCssVars(config);
  }, [config]);

  const salvarTema = useCallback((novaConfig: Partial<ConfigTema>) => {
    setConfig(prev => {
      const atualizado = { ...prev, ...novaConfig };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(atualizado));
      return atualizado;
    });
  }, []);

  const resetarTema = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setConfig(PADRAO);
  }, []);

  return { config, salvarTema, resetarTema, presets: PRESETS_COR };
}
