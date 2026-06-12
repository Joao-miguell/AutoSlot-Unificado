import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type ThemeContextType = {
  temaEscuro: boolean;
  alternarTema: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  temaEscuro: true,
  alternarTema: () => undefined,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [temaEscuro, setTemaEscuro] = useState(
    () => localStorage.getItem('autoslot-tema') !== 'claro'
  );

  // Aplica o tema no DOM e salva no localStorage sempre que mudar
  useEffect(() => {
    document.documentElement.dataset.theme = temaEscuro ? 'dark' : 'light';
    localStorage.setItem('autoslot-tema', temaEscuro ? 'escuro' : 'claro');
  }, [temaEscuro]);

  // Ao montar, busca o tema global do banco (sem auth) e sincroniza
  useEffect(() => {
    api.get('/api/configuracoes/tema')
      .then(({ data }) => {
        if (data?.tema) {
          const escuro = data.tema !== 'claro';
          setTemaEscuro(escuro);
        }
      })
      .catch(() => {
        // Se a API falhar, mantém a preferência local
      });
  }, []);

  const alternarTema = async () => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);

    // Tenta salvar no banco (só funciona se for Admin logado)
    try {
      await api.put('/api/configuracoes/tema', { tema: novoTema ? 'escuro' : 'claro' });
    } catch {
      // Silencia erro (ex: funcionário sem permissão de admin)
    }
  };

  return (
    <ThemeContext.Provider value={{ temaEscuro, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
