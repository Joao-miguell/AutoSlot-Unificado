import { useEffect, useRef } from 'react';
import { useParking } from '../context/ParkingContext';

type Toast = { id: string; vagaCodigo: string; cliente: string; minutosRestantes: number };

const notificados = new Set<number>(); // IDs de reservas já notificadas

export function useNotificacaoExpiracao(
  onToast: (toast: Toast) => void
) {
  const { vagas } = useParking();
  const vagasRef = useRef(vagas);
  vagasRef.current = vagas;

  useEffect(() => {
    function checar() {
      const agora = new Date();
      for (const vaga of vagasRef.current) {
        if (vaga.status !== 'Reservada' || !vaga.reservaId || !vaga.saidaPrevista) continue;
        if (notificados.has(vaga.reservaId)) continue;

        const previsto = new Date(vaga.saidaPrevista);
        const diffMs = previsto.getTime() - agora.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        // Avisa quando faltam entre 1 e 5 minutos
        if (diffMin >= 1 && diffMin <= 5) {
          notificados.add(vaga.reservaId);

          // Toast in-app
          onToast({
            id: `${vaga.reservaId}-${Date.now()}`,
            vagaCodigo: vaga.codigo,
            cliente: vaga.cliente ?? 'Cliente',
            minutosRestantes: diffMin,
          });

          // Notificação do browser (se permitida)
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`⚠️ Reserva expirando — Vaga ${vaga.codigo}`, {
              body: `${vaga.cliente ?? 'Cliente'} tem ${diffMin} min para chegar.`,
              icon: '/favicon.ico',
            });
          }
        }
      }
    }

    // Solicita permissão de notificação do browser na primeira chamada
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    checar(); // Checa imediatamente
    const interval = setInterval(checar, 30_000); // E a cada 30s
    return () => clearInterval(interval);
  }, [onToast]);
}
