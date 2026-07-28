import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, ArrowLeft, Check, Edit3, Filter, Hammer, Magnet, PackagePlus, Plus, RefreshCw, Search, ShieldCheck, Trash2, X } from 'lucide-react';
import { Category, Product } from '../types';

interface ProductManagementViewProps {
  onReturnToDashboard: () => void;
  categories: Category[];
  onProductsUpdated: () => void;
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  onReturnToDashboard,
  categories,
  onProductsUpdated,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Form State
  const [formCodigo, setFormCodigo] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formCategoriaId, setFormCategoriaId] = useState<number>(1);
  const [formMaterialCabecaHaste, setFormMaterialCabecaHaste] = useState('');
  const [formMaterialCabo, setFormMaterialCabo] = useState('');
  const [formRevestimentoIsolante, setFormRevestimentoIsolante] = useState(false);
  const [formPontaImantada, setFormPontaImantada] = useState(false);
  const [formTamanho, setFormTamanho] = useState('');
  const [formPeso, setFormPeso] = useState<string>('500');
  const [formPrecoUnitario, setFormPrecoUnitario] = useState<string>('35.00');
  const [formEstoqueMinimo, setFormEstoqueMinimo] = useState<string>('10');
  const [formEstoqueAtual, setFormEstoqueAtual] = useState<string>('15');
  const [formPrateleira, setFormPrateleira] = useState('P-01-A');

  // Validation Error Alerts
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteProductTarget, setDeleteProductTarget] = useState<Product | null>(null);

  // Load Products automatically (Requirement 6.1.1)
  const fetchProducts = async (term: string = '') => {
    setLoading(true);
    try {
      const url = term ? `/api/products?search=${encodeURIComponent(term)}` : '/api/products';
      const response = await fetch(url);
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(activeSearch);
  }, [activeSearch]);

  // Search Handler (Requirement 6.1.2)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
  };

  // Reset Form
  const resetForm = () => {
    setFormCodigo('');
    setFormNome('');
    setFormCategoriaId(categories[0]?.id || 1);
    setFormMaterialCabecaHaste('');
    setFormMaterialCabo('');
    setFormRevestimentoIsolante(false);
    setFormPontaImantada(false);
    setFormTamanho('');
    setFormPeso('500');
    setFormPrecoUnitario('35.00');
    setFormEstoqueMinimo('10');
    setFormEstoqueAtual('15');
    setFormPrateleira('P-01-A');
    setValidationErrors([]);
  };

  // Open Create Modal (Requirement 6.1.3)
  const handleOpenCreateModal = () => {
    resetForm();
    setModalMode('create');
    setEditingProductId(null);
    setIsModalOpen(true);
  };

  // Open Edit Modal (Requirement 6.1.4)
  const handleOpenEditModal = (product: Product) => {
    resetForm();
    setModalMode('edit');
    setEditingProductId(product.id);

    setFormCodigo(product.codigo);
    setFormNome(product.nome);
    setFormCategoriaId(product.categoriaId);
    setFormMaterialCabecaHaste(product.materialCabecaHaste);
    setFormMaterialCabo(product.materialCabo);
    setFormRevestimentoIsolante(product.revestimentoIsolante);
    setFormPontaImantada(product.pontaImantada);
    setFormTamanho(product.tamanho);
    setFormPeso(String(product.peso));
    setFormPrecoUnitario(String(product.precoUnitario));
    setFormEstoqueMinimo(String(product.estoqueMinimo));
    setFormEstoqueAtual(String(product.estoqueAtual));
    setFormPrateleira(product.localizacaoPrateleira || 'P-01-A');

    setIsModalOpen(true);
  };

  // Client-Side Validation before sending (Requirement 6.1.6)
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formCodigo.trim()) errors.push('O campo "Código/SKU" é de preenchimento obrigatório.');
    if (!formNome.trim()) errors.push('O campo "Nome da Ferramenta" é de preenchimento obrigatório.');
    if (!formMaterialCabecaHaste.trim()) errors.push('Informe o "Material da Cabeça/Haste" (Ex: Aço Cromo Vanádio).');
    if (!formMaterialCabo.trim()) errors.push('Informe o "Material do Cabo" (Ex: Fibra de Vidro Emborrachada).');
    if (!formTamanho.trim()) errors.push('Informe o "Tamanho/Dimensões" (Ex: 27mm / 32cm).');
    
    if (!formPeso || isNaN(Number(formPeso)) || Number(formPeso) <= 0) {
      errors.push('O peso deve ser um número maior que zero em gramas.');
    }
    if (!formPrecoUnitario || isNaN(Number(formPrecoUnitario)) || Number(formPrecoUnitario) < 0) {
      errors.push('O preço unitário deve ser um número válido não negativo.');
    }
    if (!formEstoqueMinimo || isNaN(Number(formEstoqueMinimo)) || Number(formEstoqueMinimo) < 0) {
      errors.push('O estoque mínimo deve ser um número inteiro maior ou igual a zero.');
    }
    if (!formEstoqueAtual || isNaN(Number(formEstoqueAtual)) || Number(formEstoqueAtual) < 0) {
      errors.push('O estoque atual/inicial deve ser um número inteiro maior ou igual a zero.');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // Submit Create/Edit Form
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      codigo: formCodigo,
      nome: formNome,
      categoriaId: formCategoriaId,
      materialCabecaHaste: formMaterialCabecaHaste,
      materialCabo: formMaterialCabo,
      revestimentoIsolante: formRevestimentoIsolante,
      pontaImantada: formPontaImantada,
      tamanho: formTamanho,
      peso: Number(formPeso),
      precoUnitario: Number(formPrecoUnitario),
      estoqueMinimo: Number(formEstoqueMinimo),
      estoqueAtual: Number(formEstoqueAtual),
      localizacaoPrateleira: formPrateleira,
    };

    try {
      const url = modalMode === 'create' ? '/api/products' : `/api/products/${editingProductId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setValidationErrors(data.errors || [data.message || 'Falha ao gravar produto no banco de dados.']);
        return;
      }

      setIsModalOpen(false);
      setActionSuccessMessage(data.message);
      fetchProducts(activeSearch);
      onProductsUpdated();

      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      setValidationErrors(['Erro de comunicação com o servidor ao salvar o produto.']);
    }
  };

  // Delete Product (Requirement 6.1.5)
  const handleConfirmDelete = async () => {
    if (!deleteProductTarget) return;

    try {
      const response = await fetch(`/api/products/${deleteProductTarget.id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || 'Não foi possível excluir o produto.');
        return;
      }

      setDeleteProductTarget(null);
      setActionSuccessMessage(data.message);
      fetchProducts(activeSearch);
      onProductsUpdated();

      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch (err) {
      alert('Erro de comunicação ao excluir produto.');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Top Bar with Return to Dashboard Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl text-white">
        <div>
          <button
            onClick={onReturnToDashboard}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Painel de Controle</span>
          </button>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <PackagePlus className="w-7 h-7 text-blue-400" />
            <span>Cadastro e Manutenção de Produtos</span>
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Gerencie o catálogo de ferramentas manuais e suas especificações técnicas de fabricação.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Novo Produto</span>
        </button>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-sm flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search Bar & Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar produto por nome, código, material ou categoria... (Ex: Isolada, Martelo)"
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-11 pr-10 py-2.5 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Filter className="w-4 h-4 text-blue-400" />
              <span>Filtrar</span>
            </button>

            {activeSearch && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-3 py-2.5 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 text-xs font-medium whitespace-nowrap cursor-pointer"
              >
                Limpar Busca
              </button>
            )}
          </div>
        </form>

        {activeSearch && (
          <p className="text-xs text-blue-600 mt-3 font-semibold">
            Exibindo resultados para a busca: "{activeSearch}" ({products.length} itens encontrados)
          </p>
        )}
      </div>

      {/* Product Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Hammer className="w-4 h-4 text-blue-600" />
            <span>Lista Automática de Produtos ({products.length})</span>
          </h3>
          <button
            onClick={() => fetchProducts(activeSearch)}
            className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Tabela</span>
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mb-3" />
            <p>Carregando dados dos produtos em saep_db...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <AlertCircle className="w-12 h-12 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold text-slate-800">Nenhum produto encontrado.</p>
            <p className="text-xs text-slate-500 mt-1">
              Tente redefinir o termo de busca ou cadastre um novo item.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3.5">Código/SKU</th>
                  <th className="p-3.5">Ferramenta / Nome</th>
                  <th className="p-3.5">Categoria</th>
                  <th className="p-3.5">Materiais (Cabeça/Cabo)</th>
                  <th className="p-3.5">Isolante / Ponta</th>
                  <th className="p-3.5">Dimensões / Peso</th>
                  <th className="p-3.5 text-center">Estoque Atual</th>
                  <th className="p-3.5 text-center">Estoque Mín.</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {products.map((p) => {
                  const isBelowMin = p.estoqueAtual < p.estoqueMinimo;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBelowMin ? 'bg-red-50/40' : ''
                      }`}
                    >
                      <td className="p-3.5 font-mono font-bold text-blue-600 whitespace-nowrap">
                        {p.codigo}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 max-w-xs">
                        {p.nome}
                        <div className="text-[10px] text-slate-500 font-normal">
                          Prateleira: {p.localizacaoPrateleira || 'Geral'}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-600 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                          {p.categoriaNome}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 max-w-xs">
                        <div className="text-slate-900 font-medium">{p.materialCabecaHaste}</div>
                        <div className="text-slate-500 text-[10px]">Cabo: {p.materialCabo}</div>
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {p.revestimentoIsolante ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <ShieldCheck className="w-3 h-3 text-amber-600" /> Isolada 1000V
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Sem isolamento</span>
                          )}
                          {p.pontaImantada && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                              <Magnet className="w-3 h-3 text-blue-600" /> Ponta Imantada
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 whitespace-nowrap">
                        <div className="font-medium">{p.tamanho}</div>
                        <div className="text-[10px] text-slate-500">{p.peso}g</div>
                      </td>
                      <td className="p-3.5 text-center font-bold text-sm whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                            isBelowMin
                              ? 'bg-red-100 text-red-700 border border-red-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                          }`}
                        >
                          {p.estoqueAtual} un.
                        </span>
                      </td>
                      <td className="p-3.5 text-center font-semibold text-slate-700 whitespace-nowrap">
                        {p.estoqueMinimo} un.
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Editar Produto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteProductTarget(p)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                            title="Excluir Produto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 my-8 text-slate-900 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-slate-900">
                  {modalMode === 'create' ? 'Cadastrar Novo Produto' : 'Editar Produto Existente'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Errors Alert Box */}
            {validationErrors.length > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-1">
                <div className="font-bold flex items-center gap-2 text-red-900 text-sm">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span>Atenção: Corrija os erros abaixo antes de salvar:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pt-1 text-red-700">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Código / SKU *</label>
                  <input
                    type="text"
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value)}
                    placeholder="Ex: MART-003"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 uppercase focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Nome da Ferramenta *</label>
                  <input
                    type="text"
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Martelo Unha 29mm Cabo Emborrachado"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Categoria *</label>
                  <select
                    value={formCategoriaId}
                    onChange={(e) => setFormCategoriaId(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Localização (Prateleira)</label>
                  <input
                    type="text"
                    value={formPrateleira}
                    onChange={(e) => setFormPrateleira(e.target.value)}
                    placeholder="Ex: Prateleira B-02"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material Cabeça / Haste *</label>
                  <input
                    type="text"
                    value={formMaterialCabecaHaste}
                    onChange={(e) => setFormMaterialCabecaHaste(e.target.value)}
                    placeholder="Ex: Aço Forjado 1050 / Cr-V"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Material do Cabo *</label>
                  <input
                    type="text"
                    value={formMaterialCabo}
                    onChange={(e) => setFormMaterialCabo(e.target.value)}
                    placeholder="Ex: Fibra de Vidro / Madeira / Polímero"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* Special Tool Options */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={formRevestimentoIsolante}
                    onChange={(e) => setFormRevestimentoIsolante(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-slate-300"
                  />
                  <span>Revestimento Isolante 1000V (VDE)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-800 font-medium">
                  <input
                    type="checkbox"
                    checked={formPontaImantada}
                    onChange={(e) => setFormPontaImantada(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 bg-white border-slate-300"
                  />
                  <span>Ponta Imantada / Magnética</span>
                </label>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tamanho / Medida *</label>
                  <input
                    type="text"
                    value={formTamanho}
                    onChange={(e) => setFormTamanho(e.target.value)}
                    placeholder="Ex: 27mm"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peso (Gramas) *</label>
                  <input
                    type="number"
                    value={formPeso}
                    onChange={(e) => setFormPeso(e.target.value)}
                    placeholder="650"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Preço Unitário (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formPrecoUnitario}
                    onChange={(e) => setFormPrecoUnitario(e.target.value)}
                    placeholder="45.00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Estoque Mínimo *</label>
                  <input
                    type="number"
                    value={formEstoqueMinimo}
                    onChange={(e) => setFormEstoqueMinimo(e.target.value)}
                    placeholder="10"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estoque {modalMode === 'create' ? 'Inicial' : 'Atual'} *
                </label>
                <input
                  type="number"
                  value={formEstoqueAtual}
                  onChange={(e) => setFormEstoqueAtual(e.target.value)}
                  placeholder="15"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  {modalMode === 'create' ? 'Salvar Produto no Banco' : 'Atualizar Dados do Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteProductTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 text-slate-900">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-bold text-slate-900">Confirmar Exclusão de Produto</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você está prestes a excluir permanentemente a ferramenta{' '}
              <strong className="text-slate-900">{deleteProductTarget.nome}</strong> [SKU:{' '}
              {deleteProductTarget.codigo}] do banco de dados <strong className="text-blue-600">saep_db</strong>.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteProductTarget(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm cursor-pointer"
              >
                Sim, Excluir Produto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
