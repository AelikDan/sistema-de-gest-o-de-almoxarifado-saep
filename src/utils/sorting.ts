import { Product, SortAlgorithm } from '../types';

export interface SortResult {
  sortedProducts: Product[];
  algorithmName: string;
  comparisonsCount: number;
  timeMs: number;
}

/**
 * QuickSort implementation for sorting products alphabetically by name
 */
export function quickSortProducts(products: Product[]): { items: Product[]; comparisons: number } {
  let comparisons = 0;
  const arr = [...products];

  function sort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }

  function partition(low: number, high: number): number {
    const pivot = arr[high].nome.toLowerCase();
    let i = low - 1;

    for (let j = low; j < high; j++) {
      comparisons++;
      if (arr[j].nome.toLowerCase().localeCompare(pivot) <= 0) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }

  sort(0, arr.length - 1);
  return { items: arr, comparisons };
}

/**
 * MergeSort implementation for sorting products alphabetically by name
 */
export function mergeSortProducts(products: Product[]): { items: Product[]; comparisons: number } {
  let comparisons = 0;

  function merge(left: Product[], right: Product[]): Product[] {
    const result: Product[] = [];
    let l = 0;
    let r = 0;

    while (l < left.length && r < right.length) {
      comparisons++;
      if (left[l].nome.toLowerCase().localeCompare(right[r].nome.toLowerCase()) <= 0) {
        result.push(left[l]);
        l++;
      } else {
        result.push(right[r]);
        r++;
      }
    }

    return result.concat(left.slice(l)).concat(right.slice(r));
  }

  function sort(arr: Product[]): Product[] {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = sort(arr.slice(0, mid));
    const right = sort(arr.slice(mid));
    return merge(left, right);
  }

  const items = sort([...products]);
  return { items, comparisons };
}

/**
 * SelectionSort implementation for sorting products alphabetically by name
 */
export function selectionSortProducts(products: Product[]): { items: Product[]; comparisons: number } {
  let comparisons = 0;
  const arr = [...products];
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      if (arr[j].nome.toLowerCase().localeCompare(arr[minIdx].nome.toLowerCase()) < 0) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
  }

  return { items: arr, comparisons };
}

/**
 * Master sort caller with performance metrics
 */
export function sortProductsAlphabetically(
  products: Product[],
  algorithm: SortAlgorithm = 'QuickSort'
): SortResult {
  const start = performance.now();
  let result: { items: Product[]; comparisons: number };

  switch (algorithm) {
    case 'MergeSort':
      result = mergeSortProducts(products);
      break;
    case 'SelectionSort':
      result = selectionSortProducts(products);
      break;
    case 'Native':
      result = {
        items: [...products].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
        comparisons: products.length * Math.log2(products.length || 1),
      };
      break;
    case 'QuickSort':
    default:
      result = quickSortProducts(products);
      break;
  }

  const end = performance.now();
  return {
    sortedProducts: result.items,
    algorithmName: algorithm,
    comparisonsCount: Math.round(result.comparisons),
    timeMs: Number((end - start).toFixed(2)),
  };
}
