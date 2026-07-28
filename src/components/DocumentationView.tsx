import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Cpu, Download, FileCode, FileText, HardDrive, ListChecks, Server, ShieldCheck, Terminal, TestTube } from 'lucide-react';
import { FUNCTIONAL_REQUIREMENTS, INFRA_REQUIREMENTS, TEST_CASES } from '../data/initialData';
import { generateAndDownloadSaepDeliverablesZip } from '../utils/zipExporter';

interface DocumentationViewProps {
  onReturnToDashboard: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({ onReturnToDashboard }) => {
  const [activeTab, setActiveTab] = useState<'rf' | 'ct' | 'infra'>('rf');
  const [alunoNome, setAlunoNome] = useState('Estudante_SAEP');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await generateAndDownloadSaepDeliverablesZip(alunoNome);
    } catch (err) {
      alert('Erro ao gerar arquivo .ZIP de entregas.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-white">
        <div>
          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel de Controle</span>
          </button>

          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-400" />
            <span>Documentação Técnica do Sistema SAEP</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Especifique o seu nome de candidato e faça o download de todas as entregas exigidas em formato .ZIP.
          </p>
        </div>

        {/* Zip Exporter Box */}
        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <input
            type="text"
            value={alunoNome}
            onChange={(e) => setAlunoNome(e.target.value)}
            placeholder="Nome do Estudante / Candidato"
            className="bg-slate-900 border border-slate-600 text-white text-xs rounded-lg px-3 py-2 w-full sm:w-48 focus:border-blue-500 focus:outline-none font-medium"
          />
          <button
            onClick={handleExportZip}
            disabled={isExporting}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>{isExporting ? 'Gerando .ZIP...' : 'Baixar Entregas SAEP (.zip)'}</span>
          </button>
        </div>
      </div>

      {/* Nav Tabs for Docs */}
      <div className="flex border-b border-slate-200 space-x-2">
        <button
          onClick={() => setActiveTab('rf')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'rf'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ListChecks className="w-4 h-4" />
          <span>Entrega 1: Requisitos Funcionais</span>
        </button>

        <button
          onClick={() => setActiveTab('ct')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'ct'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TestTube className="w-4 h-4" />
          <span>Entrega 8: Casos de Teste</span>
        </button>

        <button
          onClick={() => setActiveTab('infra')}
          className={`flex items-center gap-2 px-4 py-3 font-bold text-xs border-b-2 transition-colors cursor-pointer ${
            activeTab === 'infra'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Entrega 9: Requisitos de Infraestrutura</span>
        </button>
      </div>

      {/* TAB 1: REQUISITOS FUNCIONAIS (Entrega 1) */}
      {activeTab === 'rf' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>ENTREGA 01 &ndash; Requisitos Funcionais do Sistema</span>
            </h3>
            <span className="text-xs text-blue-700 font-mono bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
              Formato ANEXO III
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FUNCTIONAL_REQUIREMENTS.map((rf) => (
              <div
                key={rf.id}
                className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    {rf.id}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Prioridade: {rf.prioridade}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{rf.nome}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{rf.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CASOS DE TESTE (Entrega 8) */}
      {activeTab === 'ct' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TestTube className="w-5 h-5 text-blue-600" />
              <span>ENTREGA 08 &ndash; Descritivo de Casos de Teste e Ambientes</span>
            </h3>
            <span className="text-xs text-emerald-800 font-mono bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-medium">
              Todos os testes Aprovados
            </span>
          </div>

          <div className="space-y-4">
            {TEST_CASES.map((ct) => (
              <div key={ct.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {ct.id}
                    </span>
                    <span className="text-xs font-mono text-slate-500">Ref: {ct.requisitoId}</span>
                    <h4 className="text-sm font-bold text-slate-900">{ct.nome}</h4>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Status: {ct.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                  <div>
                    <strong className="text-slate-500 block mb-1">Objetivo do Teste:</strong>
                    <p className="bg-white p-2.5 rounded-md border border-slate-200">{ct.objetivo}</p>
                  </div>
                  <div>
                    <strong className="text-slate-500 block mb-1">Resultado Esperado:</strong>
                    <p className="bg-white p-2.5 rounded-md border border-slate-200 text-emerald-800 font-medium">
                      {ct.resultadoEsperado}
                    </p>
                  </div>
                </div>

                <div className="text-xs">
                  <strong className="text-slate-500 block mb-1">Passos de Execução:</strong>
                  <div className="bg-white p-2.5 rounded-md border border-slate-200 font-mono text-[11px] text-slate-700 space-y-1">
                    {ct.passos.map((p, idx) => (
                      <div key={idx}>{p}</div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section 8.2 Ferramentas e Ambientes */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-900 mb-2">Item 8.2 &ndash; Ferramentas e Ambientes de Teste Utilizados</h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>&bull; <strong>Ferramentas:</strong> Vite Dev Server, Node.js Test Runner, TypeScript Compiler (tsc), ESLint, Chrome DevTools Network Audit.</p>
              <p>&bull; <strong>Navegadores Homologados:</strong> Google Chrome (v126+), Mozilla Firefox (v127+), Microsoft Edge (v126+).</p>
              <p>&bull; <strong>Resoluções Testadas:</strong> Full HD (1920x1080), Notebook (1366x768), Tablet (768x1024), Mobile (375x812).</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INFRAESTRUTURA (Entrega 9) */}
      {activeTab === 'infra' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              <span>ENTREGA 09 &ndash; Lista de Requisitos de Infraestrutura</span>
            </h3>
            <span className="text-xs text-blue-700 font-mono bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
              Conforme Requisitos 9.1.1, 9.1.2 e 9.1.3
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {INFRA_REQUIREMENTS.map((inf) => (
              <div key={inf.item} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 text-xs px-2 py-0.5 rounded bg-blue-50 border border-blue-200">
                    Item {inf.item}
                  </span>
                  {inf.item === '9.1.1' && <HardDrive className="w-5 h-5 text-blue-600" />}
                  {inf.item === '9.1.2' && <Cpu className="w-5 h-5 text-slate-700" />}
                  {inf.item === '9.1.3' && <Terminal className="w-5 h-5 text-emerald-600" />}
                </div>

                <h4 className="text-sm font-bold text-slate-900">{inf.componente}</h4>
                <div className="p-3 bg-white rounded-lg font-mono text-xs text-slate-800 font-semibold border border-slate-200">
                  {inf.especificacao}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{inf.detalhes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
