import React from 'react';
import { ArrowLeft, Database, Download, FileCode, Layers, ShieldCheck } from 'lucide-react';
import { generateSaepDbSqlScript } from '../utils/sqlGenerator';

interface DerViewProps {
  onReturnToDashboard: () => void;
}

export const DerView: React.FC<DerViewProps> = ({ onReturnToDashboard }) => {
  const handleDownloadSql = () => {
    const sql = generateSaepDbSqlScript();
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'saep_db_script.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl text-white">
        <div>
          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel de Controle</span>
          </button>

          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Database className="w-7 h-7 text-blue-400" />
            <span>Diagrama Entidade Relacionamento (DER)</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Modelagem lógica e física do banco de dados <strong className="text-blue-300 font-mono">saep_db</strong>.
          </p>
        </div>

        <button
          onClick={handleDownloadSql}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Baixar Script saep_db.sql</span>
        </button>
      </div>

      {/* SVG Diagram Canvas */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-x-auto text-slate-900">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Modelagem Relacional das Entidades do Almoxarifado
            </h3>
          </div>
          <span className="text-xs text-emerald-800 font-mono bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-medium">
            Status: Integridade Referencial Preservada (3+ Registros Por Tabela)
          </span>
        </div>

        <div className="min-w-[900px]">
          <svg viewBox="0 0 1000 600" className="w-full h-auto rounded-xl bg-slate-950 p-4 border border-slate-800">
            {/* Table 1: tb_usuarios */}
            <g transform="translate(40, 80)">
              <rect width="250" height="210" rx="10" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
              <rect width="250" height="35" rx="10" fill="#2563eb" />
              <text x="125" y="23" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">
                tb_usuarios
              </text>
              <text x="15" y="60" fill="#60a5fa" fontSize="12" fontWeight="bold">
                PK id_usuario : INT (SERIAL)
              </text>
              <text x="15" y="85" fill="#e2e8f0" fontSize="12">
                nome : VARCHAR(100) NOT NULL
              </text>
              <text x="15" y="110" fill="#e2e8f0" fontSize="12">
                email : VARCHAR(120) UNIQUE
              </text>
              <text x="15" y="135" fill="#e2e8f0" fontSize="12">
                senha : VARCHAR(255) NOT NULL
              </text>
              <text x="15" y="160" fill="#e2e8f0" fontSize="12">
                cargo : VARCHAR(50) NOT NULL
              </text>
              <text x="15" y="185" fill="#e2e8f0" fontSize="12">
                ativo : BOOLEAN DEFAULT TRUE
              </text>
            </g>

            {/* Table 2: tb_categorias */}
            <g transform="translate(710, 80)">
              <rect width="250" height="150" rx="10" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
              <rect width="250" height="35" rx="10" fill="#059669" />
              <text x="125" y="23" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">
                tb_categorias
              </text>
              <text x="15" y="60" fill="#34d399" fontSize="12" fontWeight="bold">
                PK id_categoria : INT (SERIAL)
              </text>
              <text x="15" y="85" fill="#e2e8f0" fontSize="12">
                nome : VARCHAR(80) NOT NULL
              </text>
              <text x="15" y="110" fill="#e2e8f0" fontSize="12">
                descricao : TEXT
              </text>
            </g>

            {/* Table 3: tb_produtos */}
            <g transform="translate(370, 50)">
              <rect width="290" height="350" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
              <rect width="290" height="35" rx="10" fill="#d97706" />
              <text x="145" y="23" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">
                tb_produtos
              </text>
              <text x="15" y="60" fill="#fbbf24" fontSize="12" fontWeight="bold">
                PK id_produto : INT (SERIAL)
              </text>
              <text x="15" y="85" fill="#e2e8f0" fontSize="12">
                codigo : VARCHAR(30) UNIQUE
              </text>
              <text x="15" y="110" fill="#e2e8f0" fontSize="12">
                nome : VARCHAR(120) NOT NULL
              </text>
              <text x="15" y="135" fill="#34d399" fontSize="12" fontWeight="bold">
                FK id_categoria : INT
              </text>
              <text x="15" y="160" fill="#e2e8f0" fontSize="12">
                material_cabeca_haste : VARCHAR
              </text>
              <text x="15" y="185" fill="#e2e8f0" fontSize="12">
                material_cabo : VARCHAR
              </text>
              <text x="15" y="210" fill="#e2e8f0" fontSize="12">
                revestimento_isolante : BOOL
              </text>
              <text x="15" y="235" fill="#e2e8f0" fontSize="12">
                ponta_imantada : BOOL
              </text>
              <text x="15" y="260" fill="#e2e8f0" fontSize="12">
                tamanho : VARCHAR(50)
              </text>
              <text x="15" y="285" fill="#e2e8f0" fontSize="12">
                peso_gramas : NUMERIC(10,2)
              </text>
              <text x="15" y="310" fill="#e2e8f0" fontSize="12">
                estoque_minimo : INT
              </text>
              <text x="15" y="335" fill="#e2e8f0" fontSize="12">
                estoque_atual : INT
              </text>
            </g>

            {/* Table 4: tb_movimentacoes */}
            <g transform="translate(180, 360)">
              <rect width="320" height="210" rx="10" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
              <rect width="320" height="35" rx="10" fill="#db2777" />
              <text x="160" y="23" fill="#ffffff" fontWeight="bold" fontSize="14" textAnchor="middle">
                tb_movimentacoes
              </text>
              <text x="15" y="60" fill="#f472b6" fontSize="12" fontWeight="bold">
                PK id_movimentacao : INT (SERIAL)
              </text>
              <text x="15" y="85" fill="#fbbf24" fontSize="12" fontWeight="bold">
                FK id_produto : INT
              </text>
              <text x="15" y="110" fill="#60a5fa" fontSize="12" fontWeight="bold">
                FK id_usuario : INT
              </text>
              <text x="15" y="135" fill="#e2e8f0" fontSize="12">
                tipo_movimentacao : Entrada | Saída
              </text>
              <text x="15" y="160" fill="#e2e8f0" fontSize="12">
                quantidade : INT
              </text>
              <text x="15" y="185" fill="#e2e8f0" fontSize="12">
                data_hora : TIMESTAMP
              </text>
            </g>

            {/* Connections */}
            {/* tb_categorias (1) -> tb_produtos (N) */}
            <path d="M 710 130 L 660 130" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />
            <text x="680" y="120" fill="#10b981" fontSize="12" fontWeight="bold">1 : N</text>

            {/* tb_produtos (1) -> tb_movimentacoes (N) */}
            <path d="M 450 400 L 450 420 L 500 420" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" />
            <text x="460" y="415" fill="#f59e0b" fontSize="12" fontWeight="bold">1 : N</text>

            {/* tb_usuarios (1) -> tb_movimentacoes (N) */}
            <path d="M 160 290 L 160 450 L 180 450" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
            <text x="110" y="380" fill="#3b82f6" fontSize="12" fontWeight="bold">1 : N</text>
          </svg>
        </div>
      </div>
    </div>
  );
};
