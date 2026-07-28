import React from 'react';
import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'warning' | 'error' | 'success' | 'info';
  details?: {
    produtoNome?: string;
    produtoCodigo?: string;
    estoqueAtual?: number;
    estoqueMinimo?: number;
    diferenca?: number;
  };
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'warning',
  details,
}) => {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-white border-red-200 text-slate-900',
          iconBg: 'bg-red-50 text-red-600',
          btnBg: 'bg-red-600 hover:bg-red-700 text-white',
          Icon: AlertTriangle,
        };
      case 'success':
        return {
          bg: 'bg-white border-emerald-200 text-slate-900',
          iconBg: 'bg-emerald-50 text-emerald-600',
          btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          Icon: CheckCircle,
        };
      case 'info':
        return {
          bg: 'bg-white border-blue-200 text-slate-900',
          iconBg: 'bg-blue-50 text-blue-600',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white',
          Icon: Info,
        };
      case 'warning':
      default:
        return {
          bg: 'bg-white border-amber-200 text-slate-900',
          iconBg: 'bg-amber-50 text-amber-600',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
          Icon: AlertTriangle,
        };
    }
  };

  const theme = getTheme();
  const IconComponent = theme.Icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-2xl border p-6 shadow-2xl transition-all ${theme.bg}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${theme.iconBg}`}>
              <IconComponent className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <p className="text-sm font-medium text-slate-600 mt-0.5">{message}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {details && (
          <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-medium">Produto Afetado:</span>
              <span className="text-slate-900 font-semibold">{details.produtoNome} ({details.produtoCodigo})</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500">Estoque Atual Resultante:</span>
              <span className="font-bold text-red-600">{details.estoqueAtual} un.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estoque Mínimo Configurado:</span>
              <span className="font-bold text-slate-800">{details.estoqueMinimo} un.</span>
            </div>
            {details.diferenca !== undefined && details.diferenca > 0 && (
              <div className="mt-2 rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-800 text-center font-medium">
                Déficit de Reposição: <strong className="text-red-900">{details.diferenca} unidades</strong> abaixo do limite de segurança!
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-lg font-semibold text-sm shadow-sm transition-colors cursor-pointer ${theme.btnBg}`}
          >
            Entendido / Ciente
          </button>
        </div>
      </div>
    </div>
  );
};
