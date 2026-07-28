import React from 'react';
import { AlertTriangle, ArrowRight, ArrowUpRight, Boxes, CheckCircle2, DollarSign, FileCode, History, PackagePlus, ShieldCheck, User, Wrench } from 'lucide-react';
import { Product, StockMovement, User as UserType } from '../types';

interface DashboardViewProps {
  currentUser: UserType | null;
  products: Product[];
  movements: StockMovement[];
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  products,
  movements,
  onNavigate,
}) => {
  const lowStockProducts = products.filter((p) => p.estoqueAtual < p.estoqueMinimo);
  const totalInventoryValue = products.reduce((acc, p) => acc + p.estoqueAtual * p.precoUnitario, 0);
  const totalUnits = products.reduce((acc, p) => acc + p.estoqueAtual, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
          <Wrench className="w-80 h-80 text-blue-400 stroke-[1]" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sessão Autenticada
            </span>
            <span className="text-slate-400 text-xs font-mono">
              IP: Localhost &bull; Banco: saep_db
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Bem-vindo(a), <span className="text-blue-400">{currentUser?.nome || 'Usuário'}</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Painel de Controle de Almoxarifado para Fabricação de Ferramentas Manuais. 
            Acompanhe o saldo em estoque, movimentações de entrada e saída, e alertas automáticos em tempo real.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('produtos')}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PackagePlus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>

            <button
              onClick={() => onNavigate('estoque')}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-blue-400" />
              <span>Gestão de Movimentações</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Cadastro */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Total de Ferramentas</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{products.length}</p>
            <p className="text-xs text-slate-500 mt-1">{totalUnits} unidades em estoque</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Alertas de Estoque Mínimo */}
        <div className={`bg-white border rounded-xl p-5 shadow-sm flex items-center justify-between transition-all ${
          lowStockProducts.length > 0 ? 'border-red-300 bg-red-50/30' : 'border-slate-200'
        }`}>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Alertas Estoque Mínimo</p>
            <p className={`text-3xl font-extrabold mt-1 ${
              lowStockProducts.length > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
              {lowStockProducts.length}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {lowStockProducts.length > 0 ? 'Necessita reposição imediata' : 'Estoque em nível seguro'}
            </p>
          </div>
          <div className={`p-3 rounded-lg ${
            lowStockProducts.length > 0 ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-green-100 text-green-600 border border-green-200'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Valor Total Inventariado */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Valor em Estoque</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {totalInventoryValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <p className="text-xs text-slate-500 mt-1">Calculado sobre saldo atual</p>
          </div>
          <div className="p-3 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Movimentações Registradas */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Histórico Auditado</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{movements.length}</p>
            <p className="text-xs text-slate-500 mt-1">Operações com responsável</p>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-lg">
            <History className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-xl shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-full text-red-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-red-800">Alerta de Estoque Crítico</h3>
                <p className="text-xs text-red-600">
                  Existem {lowStockProducts.length} item(ns) abaixo do nível mínimo configurado. Verifique as ferramentas destacadas abaixo.
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('estoque')}
              className="text-xs font-bold text-red-800 uppercase underline underline-offset-2 hover:text-red-900 cursor-pointer self-start sm:self-center whitespace-nowrap"
            >
              Repor Agora &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white border border-red-200 rounded-lg p-3 flex items-center justify-between shadow-xs"
              >
                <div>
                  <span className="text-[10px] font-mono text-red-700 font-bold px-1.5 py-0.5 rounded bg-red-100">
                    {p.codigo}
                  </span>
                  <p className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{p.nome}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Atual: <strong className="text-red-600">{p.estoqueAtual} un.</strong> &bull; Mínimo:{' '}
                    <strong className="text-slate-700">{p.estoqueMinimo} un.</strong>
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('estoque')}
                  className="p-2 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-colors cursor-pointer"
                  title="Dar entrada no estoque"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Section Split: Quick Modules & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Quick Module Access Cards */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            <span>Acesso Rápido aos Módulos</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card Cadastro de Produto */}
            <div
              onClick={() => onNavigate('produtos')}
              className="group bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl p-6 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <PackagePlus className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Cadastro de Produtos
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Cadastrar, buscar, editar e excluir ferramentas manuais com atributos técnicos detalhados e validações.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                <span>Acessar Módulo</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Card Gestão de Estoque */}
            <div
              onClick={() => onNavigate('estoque')}
              className="group bg-white border border-slate-200 hover:border-blue-500 hover:shadow-md rounded-xl p-6 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  Gestão de Estoque
                </h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Movimentações de entrada e saída com seleção de data, ordenação alfabética e alertas de saldo mínimo.
                </p>
              </div>
              <div className="mt-6 flex items-center text-xs font-bold text-blue-600 gap-1 group-hover:translate-x-1 transition-transform">
                <span>Acessar Módulo</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Technical Documentation Shortcut Card */}
          <div
            onClick={() => onNavigate('docs')}
            className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 flex items-center justify-between cursor-pointer transition-all shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                <FileCode className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Documentação Técnica SAEP &amp; Script saep_db.sql</h4>
                <p className="text-xs text-slate-500">Requisitos funcionais, diagrama DER, casos de teste e download do pacote .ZIP.</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400" />
          </div>
        </div>

        {/* Right 1 Col: Recent Movement Audit Log */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" />
                <span>Últimas Movimentações</span>
              </h3>
              <button
                onClick={() => onNavigate('estoque')}
                className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
              >
                Ver Todas
              </button>
            </div>

            <div className="space-y-3">
              {movements.slice(0, 5).map((m) => (
                <div key={m.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      m.tipo === 'Entrada'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {m.tipo} (+{m.tipo === 'Entrada' ? m.quantidade : `-${m.quantidade}`})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{m.dataHora}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{m.produtoNome}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Resp: <strong className="text-slate-700">{m.usuarioNome}</strong></span>
                    <span>Novo Saldo: <strong className={m.alertaGerado ? 'text-red-600' : 'text-slate-800'}>{m.estoqueNovo} un.</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 text-center text-xs text-slate-400">
            Auditado pelo sistema saep_db
          </div>
        </div>
      </div>
    </div>
  );
};
