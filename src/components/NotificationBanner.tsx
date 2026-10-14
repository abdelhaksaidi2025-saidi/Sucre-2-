import React from 'react';
import { TriggeredNotification } from '../types/market';
import { Bell, X, ArrowUpRight, ArrowDownRight, Volume2 } from 'lucide-react';

interface NotificationBannerProps {
  notifications: TriggeredNotification[];
  onDismiss: (id: string) => void;
  onViewAlerts: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notifications,
  onDismiss,
  onViewAlerts,
}) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-auto">
      {notifications.map((notif) => {
        const isAbove = notif.alert.condition === 'ABOVE';
        return (
          <div
            key={notif.id}
            className="p-3.5 rounded-xl bg-slate-900/95 border-2 border-amber-400 text-white shadow-2xl backdrop-blur-md animate-in slide-in-from-top-3 duration-300 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-amber-400 text-slate-950 font-bold shrink-0 mt-0.5">
                <Bell className="w-4 h-4 animate-bounce" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <span>SEUIL FRANCHI !</span>
                  {notif.alert.soundEnabled && <Volume2 className="w-3.5 h-3.5 text-slate-400" />}
                </div>

                <div className="text-xs font-semibold text-white mt-0.5">
                  {notif.alert.label}
                </div>

                <div className="text-[11px] font-mono text-slate-300 mt-1">
                  {notif.contractName} à{' '}
                  <strong className="text-amber-300 font-bold">
                    ${notif.currentPriceUSD.toFixed(2)} / tonne
                  </strong>{' '}
                  (seuil : ${notif.targetPriceUSD.toFixed(2)}/t)
                </div>

                <button
                  onClick={onViewAlerts}
                  className="mt-2 text-[11px] font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2"
                >
                  Ouvrir le journal d'alertes &rarr;
                </button>
              </div>
            </div>

            <button
              onClick={() => onDismiss(notif.id)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors shrink-0"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
