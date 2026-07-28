export type UserRole = 'Almoxarife Chefe' | 'Operador de Estoque' | 'Supervisor de Produção' | 'Administrador';

export interface User {
  id: number;
  nome: string;
  email: string;
  senha?: string;
  cargo: UserRole;
  ativo: boolean;
  ultimoAcesso?: string;
}

export interface Category {
  id: number;
  nome: string;
  descricao: string;
}

export interface Product {
  id: number;
  codigo: string;
  nome: string;
  categoriaId: number;
  categoriaNome?: string;
  materialCabecaHaste: string; // Ex: Aço Cromo Vanádio, Borracha Vulcanizada
  materialCabo: string; // Ex: Fibra de Vidro, Madeira Nobre, Polímero
  revestimentoIsolante: boolean; // Revestimento 1000V
  pontaImantada: boolean; // Ponta imantada/magnética
  tamanho: string; // Ex: 27mm, 6x150mm, 8"
  peso: number; // em gramas
  precoUnitario: number; // Valor R$
  estoqueMinimo: number;
  estoqueAtual: number;
  localizacaoPrateleira?: string; // Ex: Corredor A - Prateleira 03
  dataCadastro: string;
}

export type MovementType = 'Entrada' | 'Saída';

export interface StockMovement {
  id: number;
  produtoId: number;
  produtoNome: string;
  produtoCodigo: string;
  tipo: MovementType;
  quantidade: number;
  estoqueAnterior: number;
  estoqueNovo: number;
  estoqueMinimo: number;
  usuarioId: number;
  usuarioNome: string;
  dataHora: string;
  observacao?: string;
  alertaGerado: boolean; // Se disparou alerta de estoque mínimo
}

export interface FunctionalRequirement {
  id: string;
  nome: string;
  descricao: string;
  prioridade: 'Alta' | 'Média' | 'Baixa';
}

export interface TestCase {
  id: string;
  requisitoId: string;
  nome: string;
  objetivo: string;
  preCondicao: string;
  passos: string[];
  resultadoEsperado: string;
  status: 'Passou' | 'Pendente' | 'Falhou';
}

export interface InfraRequirement {
  item: string;
  componente: string;
  especificacao: string;
  detalhes: string;
}

export type SortAlgorithm = 'QuickSort' | 'MergeSort' | 'SelectionSort' | 'Native';
