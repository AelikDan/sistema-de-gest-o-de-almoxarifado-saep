import React, { useEffect, useState } from 'react';
import { AlertTriangle, ArrowDownRight, ArrowLeft, ArrowUpRight, Boxes, Calendar, Check, Clock, Cpu, History, Info, Package, User, Users } from 'lucide-react';
import { MovementType, Product, SortAlgorithm, StockMovement, User as UserType } from '../types';
import { sortProductsAlphabetically } from '../utils/sorting';
import { AlertModal } from './AlertModal';

interface StockManagementViewProps {
  onReturnToDashboard: () => void;
  currentUser: UserType | null;
  users: UserType[];
  products: Product[];
  movements: StockMovement[];
  onMovementsUpdated: () => void;
}

export const StockManagementView: React.FC<StockManagementViewProps> = ({
  onReturnToDashboard,
  currentUser,
  users,
  products,
  movements,
  onMovementsUpdated,
}) => {
  // Sorting Algorithm State (Requirement 7.1.1)
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<SortAlgorithm>('QuickSort');
  const [sortedProducts, setSortedProducts] = useState<Product[]>([]);
  const [sortMetrics, setSortMetrics] = useState({ comparisons: 0, timeMs: 0 });

  // Form State for Stock Movement
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [movementType, setMovementType] = useState<MovementType>('Saída');
  const [quantidade, setQuantidade] = useState<string>('5');
  const [dataHora, setDataHora] = useState<string>(
    new Date().toISOString().substring(0, 16) // format YYYY-MM-DDTHH:mm
  );
  const [usuarioId, setUsuarioId] = useState<number>(currentUser?.id || 1);
  const [observacao, setObservacao] = useState<string>('');

  // Alerts State (Requirement 7.1.4)
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [alertDetails, setAlertDetails] = useState<{
    produtoNome?: string;
    produtoCodigo?: string;
    estoqueAtual?: number;
    estoqueMinimo?: number;
    diferenca?: number;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Apply sorting algorithm when products or algorithm changes (Requirement 7.1.1)
  useEffect(() => {
    if (products.length > 0) {
      const result = sortProductsAlphabetically(products, selectedAlgorithm);
      setSortedProducts(result.sortedProducts);
      setSortMetrics({ comparisons: result.comparisonsCount, timeMs: result.timeMs });

      if (selectedProductId === 0 && result.sortedProducts.length > 0) {
        setSelectedProductId(result.sortedProducts[0].id);
      }
    }
  }, [products, selectedAlgorithm]);

  const selectedProduct = sortedProducts.find((p) => p.id === selectedProductId);

  // Submit Stock Movement Handler (Requirements 7.1.2, 7.1.3, 7.1.4)
  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!selectedProductId) {
      setFormError('Selecione um produto para realizar a movimentação.');
      return;
    }

    const qty = Number(quantidade);
    if (isNaN(qty) || qty <= 0) {
      setFormError('Informe uma quantidade inteira maior que zero.');
      return;
    }

    if (!selectedProduct) return;

    // Check stock availability on output
    if (movementType === 'Saída' && qty > selectedProduct.estoqueAtual) {
      setFormError(
        `Quantidade indisponível em estoque! O saldo atual de "${selectedProduct.nome}" é de apenas ${selectedProduct.estoqueAtual} unidades.`
      );
      return;
    }

    // Prepare Date string
    const formattedDate = dataHora ? dataHora.replace('T', ' ') + ':00' : new Date().toISOString().replace('T', ' ').substring(0, 19);

    try {
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produtoId: selectedProductId,
          tipo: movementType,
          quantidade: qty,
          usuarioId: Number(usuarioId),
          dataHora: formattedDate,
          observacao,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setFormError(data.message || 'Falha ao registrar movimentação.');
        return;
      }

      setSuccessMessage(data.message);
      onMovementsUpdated();

      // Check Automatic Minimum Stock Alert (Requirement 7.1.4)
      if (data.alertaGerado && data.alertaDetalhes) {
        setAlertDetails(data.alertaDetalhes);
        setAlertModalOpen(true);
      }

      // Reset Form fields
      setQuantidade('5');
      setObservacao('');
    } catch (err) {
      setFormError('Erro de conexão ao registrar movimentação no banco.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Minimum Stock Triggered Modal (Requirement 7.1.4) */}
      <AlertModal
        isOpen={alertModalOpen}
        onClose={() => setAlertModalOpen(false)}
        title="ALERTA: ESTOQUE ABAIXO DO MÍNIMO!"
        message="A operação de saída foi concluída, porém o saldo remanescente do produto ficou menor que a quantidade mínima configurada de segurança."
        type="warning"
        details={alertDetails}
      />

      {/* Header & Return Button */}
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
            <Boxes className="w-7 h-7 text-blue-400" />
            <span>Gestão de Estoque &amp; Movimentações</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Lançamento de entradas e saídas de ferramentas, controle de datas e alerta automático de estoque mínimo.
          </p>
        </div>

        {/* Algorithm Selection Badge */}
        <div className="bg-slate-800/80 border border-slate-700 p-3 rounded-xl flex items-center gap-3 shrink-0">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Algoritmo de Ordenação</div>
            <div className="flex items-center gap-2 mt-0.5">
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value as SortAlgorithm)}
                className="bg-slate-900 border border-slate-600 text-white font-bold text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-blue-500"
              >
                <option value="QuickSort">QuickSort (A-Z)</option>
                <option value="MergeSort">MergeSort (A-Z)</option>
                <option value="SelectionSort">SelectionSort (A-Z)</option>
                <option value="Native">LocaleCompare Nativo</option>
              </select>
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-1">
              {sortMetrics.comparisons} comparações em {sortMetrics.timeMs}ms
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form + Selected Tool Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Entrada/Saida */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Boxes className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Lançar Nova Movimentação de Estoque</h3>
            </div>
            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Auditado por {currentUser?.nome || 'Operador'}
            </span>
          </div>

          {formError && (
            <div className="mb-5 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmitMovement} className="space-y-5 text-xs">
            {/* Step 1: Select Product Alphabetically */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                1. Selecionar Produto (Ordenado por {selectedAlgorithm}) *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 font-medium text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              >
                {sortedProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} [{p.codigo}] &mdash; Saldo Atual: {p.estoqueAtual} un. (Mín: {p.estoqueMinimo})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Choose Entrada vs Saída */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                2. Tipo de Movimentação *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMovementType('Entrada')}
                  className={`p-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    movementType === 'Entrada'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowUpRight className="w-5 h-5 text-emerald-600" />
                  <span>ENTRADA DE ESTOQUE</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType('Saída')}
                  className={`p-3.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    movementType === 'Saída'
                      ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <ArrowDownRight className="w-5 h-5 text-amber-600" />
                  <span>SAÍDA DE ESTOQUE</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Step 3: Quantity */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  3. Quantidade *
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  placeholder="Ex: 5"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-bold text-sm focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Step 4: Custom Date/Time */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  <span>4. Data/Hora *</span>
                </label>
                <input
                  type="datetime-local"
                  value={dataHora}
                  onChange={(e) => setDataHora(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 font-mono text-xs focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Step 5: Responsible User */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>5. Responsável *</span>
                </label>
                <select
                  value={usuarioId}
                  onChange={(e) => setUsuarioId(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 text-xs font-medium focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nome} ({u.cargo})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 6: Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Observações / Motivo da Operação</label>
              <input
                type="text"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Ex: Requisição de ferramentas para a linha de montagem #04 - NF 883"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Confirmar e Registrar {movementType} no Banco</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Selected Product Quick Specs */}
        {selectedProduct ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-slate-900 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase border-b border-slate-200 pb-3">
              <Package className="w-4 h-4 text-blue-600" />
              <span>Detalhamento da Ferramenta</span>
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {selectedProduct.codigo}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedProduct.nome}</h3>
              <p className="text-xs text-slate-500">{selectedProduct.categoriaNome}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">Estoque Atual</span>
                <span
                  className={`text-2xl font-extrabold ${
                    selectedProduct.estoqueAtual < selectedProduct.estoqueMinimo
                      ? 'text-red-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {selectedProduct.estoqueAtual} un.
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block font-medium">Estoque Mínimo</span>
                <span className="text-2xl font-extrabold text-slate-700">
                  {selectedProduct.estoqueMinimo} un.
                </span>
              </div>
            </div>

            {selectedProduct.estoqueAtual < selectedProduct.estoqueMinimo && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center gap-2 font-medium">
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                <span>Status: <strong>Abaixo do Estoque Mínimo!</strong></span>
              </div>
            )}

            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Material Cabeça:</span>
                <span className="font-semibold text-slate-800">{selectedProduct.materialCabecaHaste}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Material Cabo:</span>
                <span className="font-semibold text-slate-800">{selectedProduct.materialCabo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dimensões / Peso:</span>
                <span className="font-semibold text-slate-800">{selectedProduct.tamanho} ({selectedProduct.peso}g)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Isolamento 1000V:</span>
                <span className="font-bold text-amber-700">
                  {selectedProduct.revestimentoIsolante ? 'SIM (VDE 1000V)' : 'NÃO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ponta Imantada:</span>
                <span className="font-bold text-blue-700">
                  {selectedProduct.pontaImantada ? 'SIM' : 'NÃO'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-500 text-xs shadow-sm">
            Nenhum produto selecionado.
          </div>
        )}
      </div>

      {/* Movement History Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>Histórico Rastreável de Movimentações (saep_db)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {movements.length} registro(s) auditado(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-3.5">Data / Hora</th>
                <th className="p-3.5">Ferramenta / SKU</th>
                <th className="p-3.5">Operação</th>
                <th className="p-3.5 text-center">Qtd.</th>
                <th className="p-3.5 text-center">Saldo Anterior &rarr; Novo</th>
                <th className="p-3.5">Responsável</th>
                <th className="p-3.5">Status Alerta</th>
                <th className="p-3.5">Observação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {movements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-slate-600 whitespace-nowrap">{m.dataHora}</td>
                  <td className="p-3.5 font-bold text-slate-900">
                    {m.produtoNome}
                    <span className="block text-[10px] font-mono text-blue-600 font-normal">
                      {m.produtoCodigo}
                    </span>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase ${
                        m.tipo === 'Entrada'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {m.tipo === 'Entrada' ? <ArrowUpRight className="w-3 h-3 text-emerald-600" /> : <ArrowDownRight className="w-3 h-3 text-amber-600" />}
                      {m.tipo}
                    </span>
                  </td>
                  <td className="p-3.5 text-center font-bold text-slate-900 whitespace-nowrap">
                    {m.quantidade} un.
                  </td>
                  <td className="p-3.5 text-center font-mono whitespace-nowrap">
                    <span className="text-slate-500">{m.estoqueAnterior}</span>
                    <span className="mx-1 text-slate-400">&rarr;</span>
                    <strong className={m.alertaGerado ? 'text-red-600' : 'text-slate-800'}>
                      {m.estoqueNovo} un.
                    </strong>
                  </td>
                  <td className="p-3.5 text-slate-800 font-medium whitespace-nowrap">{m.usuarioNome}</td>
                  <td className="p-3.5 whitespace-nowrap">
                    {m.alertaGerado ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-700 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> Alerta Disparado
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Normal</span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-500 max-w-xs truncate">{m.observacao || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
