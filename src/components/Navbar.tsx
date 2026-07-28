import React from 'react';
import { AlertTriangle, Boxes, FileCode, LayoutDashboard, LogOut, PackagePlus, ShieldCheck, User } from 'lucide-react';
import { User as UserType } from '../types';

interface NavbarProps {
  currentUser: UserType | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onLogout: () => void;
  lowStockCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  currentTab,
  setCurrentTab,
  onLogout,
  lowStockCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white shadow-sm">
              FX
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">
                  FERRAMAX
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-500/20 border border-blue-500/30 text-blue-300">
                  SAEP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistema de Controle de Estoque
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                currentTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Painel de Controle</span>
            </button>

            <button
              onClick={() => setCurrentTab('produtos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                currentTab === 'produtos'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <PackagePlus className="w-4 h-4" />
              <span>Cadastro de Produtos</span>
            </button>

            <button
              onClick={() => setCurrentTab('estoque')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer relative ${
                currentTab === 'estoque'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              <span>Gestão de Estoque</span>
              {lowStockCount > 0 && (
                <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                  <AlertTriangle className="w-3 h-3" />
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('docs')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
                currentTab === 'docs' || currentTab === 'der'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Relatórios e DER</span>
            </button>
          </nav>

          {/* Logged User Info & Logout Button */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-white flex items-center justify-end gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    {currentUser.nome}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {currentUser.cargo}
                  </span>
                </div>

                <button
                  onClick={onLogout}
                  title="Sair do Sistema (Logout)"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Sair</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>Modo Visitante</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/80 no-scrollbar">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentTab('produtos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'produtos' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Produtos
          </button>
          <button
            onClick={() => setCurrentTab('estoque')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${
              currentTab === 'estoque' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Estoque
            {lowStockCount > 0 && <span className="bg-red-500 text-white rounded-full text-[10px] px-1.5 font-bold">{lowStockCount}</span>}
          </button>
          <button
            onClick={() => setCurrentTab('docs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              currentTab === 'docs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 bg-slate-800'
            }`}
          >
            Docs SAEP
          </button>
        </div>
      </div>
    </header>
  );
};
