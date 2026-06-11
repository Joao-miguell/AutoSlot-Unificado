import React, { createContext, useContext, useEffect, useState } from 'react';
import { aplicarTemaDoStorage } from '../hooks/useTema';

type ThemeContextType = {
  temaEscuro: boolean;
  alternarTema: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  temaEscuro: true,
  alternarTema: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [temaEscuro, setTemaEscuro] = useState(() => localStorage.getItem('autoslot-tema') !== 'claro');

  useEffect(() => {
    document.documentElement.dataset.theme = temaEscuro ? 'dark' : 'light';
    localStorage.setItem('autoslot-tema', temaEscuro ? 'escuro' : 'claro');
    // Reaaplica a cor customizada do tema após mudar data-theme.
    // O CSS html[data-theme="dark"] sobrescreve as CSS vars inline — por isso
    // precisamos reaplicar logo depois que o data-theme for setado.
    aplicarTemaDoStorage();
  }, [temaEscuro]);

  return (
    <ThemeContext.Provider value={{ temaEscuro, alternarTema: () => setTemaEscuro(value => !value) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
