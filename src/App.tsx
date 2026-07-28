/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { DashboardView } from './components/DashboardView';
import { DerView } from './components/DerView';
import { DocumentationView } from './components/DocumentationView';
import { LoginView } from './components/LoginView';
import { Navbar } from './components/Navbar';
import { ProductManagementView } from './components/ProductManagementView';
import { StockManagementView } from './components/StockManagementView';
import { INITIAL_USERS } from './data/initialData';
import { Category, Product, StockMovement, User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USERS[0]); // Default logged as Carlos Silva for immediate preview
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);

  const fetchProductsAndMovements = async () => {
    try {
      const [prodRes, movRes, catRes, userRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/movements'),
        fetch('/api/categories'),
        fetch('/api/users'),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (movRes.ok) setMovements(await movRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      if (userRes.ok) setUsers(await userRes.json());
    } catch (err) {
      console.error('Erro ao synronizar com servidor Express/saep_db:', err);
    }
  };

  useEffect(() => {
    fetchProductsAndMovements();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  const lowStockCount = products.filter((p) => p.estoqueAtual < p.estoqueMinimo).length;

  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('dashboard');
          fetchProductsAndMovements();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        lowStockCount={lowStockCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {currentTab === 'dashboard' && (
          <DashboardView
            currentUser={currentUser}
            products={products}
            movements={movements}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'produtos' && (
          <ProductManagementView
            onReturnToDashboard={() => setCurrentTab('dashboard')}
            categories={categories}
            onProductsUpdated={fetchProductsAndMovements}
          />
        )}

        {currentTab === 'estoque' && (
          <StockManagementView
            onReturnToDashboard={() => setCurrentTab('dashboard')}
            currentUser={currentUser}
            users={users}
            products={products}
            movements={movements}
            onMovementsUpdated={fetchProductsAndMovements}
          />
        )}

        {currentTab === 'docs' && (
          <DocumentationView onReturnToDashboard={() => setCurrentTab('dashboard')} />
        )}

        {currentTab === 'der' && (
          <DerView onReturnToDashboard={() => setCurrentTab('dashboard')} />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 shadow-sm">
        <p>
          Sistema de Gestão de Almoxarifado &bull; FERRAMAX SAEP &bull; Banco de Dados: <span className="text-blue-600 font-bold">saep_db</span>
        </p>
      </footer>
    </div>
  );
}
