import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { aplicarTemaDoStorage } from './hooks/useTema';

// Aplica o tema salvo ANTES do React renderizar.
// Garante que a cor persiste ao recarregar a página, deslogar ou voltar ao site.
aplicarTemaDoStorage();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);