import React, { useState } from 'react';
import { AlertCircle, ArrowRight, Boxes, KeyRound, Lock, Mail, ShieldAlert, UserCheck, Wrench } from 'lucide-react';
import { INITIAL_USERS } from '../data/initialData';
import { User } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Requirement 4.1: Inform reason for failure and redirect back to auth screen
        setErrorMessage(data.message || 'Falha de autenticação. Credenciais incorretas.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setErrorMessage('Erro ao conectar ao servidor de autenticação. Verifique sua conexão.');
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (user: typeof INITIAL_USERS[0]) => {
    setEmail(user.email);
    setSenha(user.senha || '123');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-slate-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 text-white font-bold text-2xl rounded-2xl shadow-lg mb-4">
            FX
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            FERRAMAX
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Gestão de Almoxarifado &amp; Controle de Estoque
          </p>
          <span className="inline-block mt-3 text-[11px] font-bold uppercase tracking-wider px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full">
            Acesso ao Banco saep_db
          </span>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Autenticação de Usuário</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">v1.0</span>
          </div>

          {/* Authentication Failure Alert */}
          {errorMessage && (
            <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800 animate-fade-in shadow-sm">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-red-900">Falha de Autenticação</h4>
                  <p className="text-xs mt-1 leading-relaxed text-red-700">{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@ferramentas.com.br"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Senha de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span className="text-sm">Autenticando no banco saep_db...</span>
              ) : (
                <>
                  <span className="text-sm">Entrar no Sistema</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Panel for Evaluator */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-600">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Perfis de Teste Pré-cadastrados (Avaliador):</span>
            </div>
            <div className="space-y-2">
              {INITIAL_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleQuickSelect(user)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      {user.nome}
                    </p>
                    <p className="text-[11px] text-slate-500">{user.cargo} &bull; {user.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-1 rounded font-semibold">
                    Senha: 123
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Sistema de Avaliação da Educação Profissional &bull; Prova Prática de Desempenho
        </p>
      </div>
    </div>
  );
};
