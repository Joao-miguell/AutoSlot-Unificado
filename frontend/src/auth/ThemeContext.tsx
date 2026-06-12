import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

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

  // Tenta buscar o tema do banco. Funciona sem token (AllowAnonymous).
  const buscarTemaDoServidor = async () => {
    try {
      const { data } = await api.get('/api/configuracoes/tema');
      if (data?.tema) {
        const escuro = data.tema !== 'claro';
        setTemaEscuro(escuro);
        localStorage.setItem('autoslot-tema', data.tema);
      }
    } catch {
      // Se falhar, mantém preferência local
    }
  };

  // Aplica o tema no DOM sempre que mudar
  useEffect(() => {
    document.documentElement.dataset.theme = temaEscuro ? 'dark' : 'light';
    localStorage.setItem('autoslot-tema', temaEscuro ? 'escuro' : 'claro');
  }, [temaEscuro]);

  // Busca o tema do banco ao carregar o app (funciona sem login)
  useEffect(() => {
    buscarTemaDoServidor();
  }, []);

  const alternarTema = async () => {
    const novoTema = !temaEscuro;
    setTemaEscuro(novoTema);

    // Salva no banco (só funciona se for Admin logado)
    try {
      await api.put('/api/configuracoes/tema', { tema: novoTema ? 'escuro' : 'claro' });
    } catch {
      // Silencia erro (ex: funcionário sem permissão)
    }
  };

  return (
    <ThemeContext.Provider value={{ temaEscuro, alternarTema }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook separado que rebusca o tema ao logar — use dentro de componentes logados
export function useThemeSync() {
  const { logado } = useAuth();

  useEffect(() => {
    if (!logado) return;
    api.get('/api/configuracoes/tema')
      .then(({ data }) => {
        if (data?.tema) {
          const escuro = data.tema !== 'claro';
          document.documentElement.dataset.theme = escuro ? 'dark' : 'light';
          localStorage.setItem('autoslot-tema', data.tema);
        }
      })
      .catch(() => {});
  }, [logado]); // Rebusca toda vez que o estado de login mudar
}

export function useTheme() {
  return useContext(ThemeContext);
}
