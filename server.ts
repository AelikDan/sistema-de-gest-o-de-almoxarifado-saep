import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CATEGORIES, INITIAL_MOVEMENTS, INITIAL_PRODUCTS, INITIAL_USERS } from './src/data/initialData';
import { Category, Product, StockMovement, User } from './src/types';
import { generateSaepDbSqlScript } from './src/utils/sqlGenerator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-Memory Database Store (Initialized with SAEP Seed Data)
  let dbUsers: User[] = [...INITIAL_USERS];
  let dbCategories: Category[] = [...INITIAL_CATEGORIES];
  let dbProducts: Product[] = [...INITIAL_PRODUCTS];
  let dbMovements: StockMovement[] = [...INITIAL_MOVEMENTS];

  // ==========================================
  // API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString(), dbName: 'saep_db' });
  });

  // Auth / Login (Requirement 4)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        message: 'Preenchimento obrigatório: E-mail e senha devem ser fornecidos.',
      });
    }

    const user = dbUsers.find((u) => u.email.toLowerCase() === String(email).trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Acesso negado: O e-mail "${email}" não está cadastrado no sistema do almoxarifado.`,
      });
    }

    if (!user.ativo) {
      return res.status(403).json({
        success: false,
        message: 'Acesso bloqueado: Esta conta de usuário está inativa. Entre em contato com a supervisão.',
      });
    }

    if (user.senha !== senha) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado: Senha incorreta. Por favor, verifique e tente novamente.',
      });
    }

    // Update last access timestamp
    user.ultimoAcesso = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const { senha: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      message: 'Autenticação realizada com sucesso!',
      user: userWithoutPassword,
    });
  });

  // Get Users list
  app.get('/api/users', (req: Request, res: Response) => {
    const safeUsers = dbUsers.map(({ senha: _, ...u }) => u);
    res.json(safeUsers);
  });

  // Get Categories list
  app.get('/api/categories', (req: Request, res: Response) => {
    res.json(dbCategories);
  });

  // Get Products list with optional search (Requirement 6.1.1 & 6.1.2)
  app.get('/api/products', (req: Request, res: Response) => {
    const search = req.query.search ? String(req.query.search).trim().toLowerCase() : '';

    if (!search) {
      return res.json(dbProducts);
    }

    const filtered = dbProducts.filter((p) => {
      return (
        p.nome.toLowerCase().includes(search) ||
        p.codigo.toLowerCase().includes(search) ||
        p.materialCabecaHaste.toLowerCase().includes(search) ||
        p.materialCabo.toLowerCase().includes(search) ||
        (p.categoriaNome && p.categoriaNome.toLowerCase().includes(search)) ||
        p.tamanho.toLowerCase().includes(search)
      );
    });

    res.json(filtered);
  });

  // Create Product (Requirement 6.1.3 & 6.1.6)
  app.post('/api/products', (req: Request, res: Response) => {
    const {
      codigo,
      nome,
      categoriaId,
      materialCabecaHaste,
      materialCabo,
      revestimentoIsolante,
      pontaImantada,
      tamanho,
      peso,
      precoUnitario,
      estoqueMinimo,
      estoqueAtual,
      localizacaoPrateleira,
    } = req.body;

    // Validations (Requirement 6.1.6)
    const errors: string[] = [];

    if (!codigo || !String(codigo).trim()) errors.push('Código/SKU é obrigatório.');
    if (!nome || !String(nome).trim()) errors.push('Nome da ferramenta é obrigatório.');
    if (!categoriaId || Number(categoriaId) <= 0) errors.push('Categoria deve ser selecionada.');
    if (!materialCabecaHaste || !String(materialCabecaHaste).trim()) errors.push('Material da cabeça/haste é obrigatório.');
    if (!materialCabo || !String(materialCabo).trim()) errors.push('Material do cabo é obrigatório.');
    if (!tamanho || !String(tamanho).trim()) errors.push('Dimensões/tamanho são obrigatórios.');
    if (peso === undefined || Number(peso) <= 0) errors.push('Peso em gramas deve ser maior que zero.');
    if (precoUnitario === undefined || Number(precoUnitario) < 0) errors.push('Preço unitário não pode ser negativo.');
    if (estoqueMinimo === undefined || Number(estoqueMinimo) < 0) errors.push('Estoque mínimo não pode ser negativo.');
    if (estoqueAtual === undefined || Number(estoqueAtual) < 0) errors.push('Estoque inicial não pode ser negativo.');

    // Check duplicate code
    if (codigo && dbProducts.some((p) => p.codigo.toLowerCase() === String(codigo).trim().toLowerCase())) {
      errors.push(`Já existe um produto cadastrado com o código "${codigo}".`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Falha na validação dos dados do produto.',
        errors,
      });
    }

    const categoryObj = dbCategories.find((c) => c.id === Number(categoriaId));

    const newProduct: Product = {
      id: dbProducts.length > 0 ? Math.max(...dbProducts.map((p) => p.id)) + 1 : 1,
      codigo: String(codigo).trim().toUpperCase(),
      nome: String(nome).trim(),
      categoriaId: Number(categoriaId),
      categoriaNome: categoryObj ? categoryObj.nome : 'Geral',
      materialCabecaHaste: String(materialCabecaHaste).trim(),
      materialCabo: String(materialCabo).trim(),
      revestimentoIsolante: Boolean(revestimentoIsolante),
      pontaImantada: Boolean(pontaImantada),
      tamanho: String(tamanho).trim(),
      peso: Number(peso),
      precoUnitario: Number(precoUnitario),
      estoqueMinimo: Number(estoqueMinimo),
      estoqueAtual: Number(estoqueAtual),
      localizacaoPrateleira: localizacaoPrateleira ? String(localizacaoPrateleira).trim() : 'Prateleira P-01',
      dataCadastro: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    dbProducts.unshift(newProduct);

    return res.status(201).json({
      success: true,
      message: 'Produto cadastrado com sucesso no banco de dados saep_db!',
      product: newProduct,
    });
  });

  // Edit Product (Requirement 6.1.4 & 6.1.6)
  app.put('/api/products/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const productIndex = dbProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produto não encontrado para alteração.',
      });
    }

    const {
      codigo,
      nome,
      categoriaId,
      materialCabecaHaste,
      materialCabo,
      revestimentoIsolante,
      pontaImantada,
      tamanho,
      peso,
      precoUnitario,
      estoqueMinimo,
      estoqueAtual,
      localizacaoPrateleira,
    } = req.body;

    const errors: string[] = [];

    if (!codigo || !String(codigo).trim()) errors.push('Código/SKU é obrigatório.');
    if (!nome || !String(nome).trim()) errors.push('Nome da ferramenta é obrigatório.');
    if (!categoriaId || Number(categoriaId) <= 0) errors.push('Categoria deve ser selecionada.');
    if (!materialCabecaHaste || !String(materialCabecaHaste).trim()) errors.push('Material da cabeça/haste é obrigatório.');
    if (!materialCabo || !String(materialCabo).trim()) errors.push('Material do cabo é obrigatório.');
    if (!tamanho || !String(tamanho).trim()) errors.push('Dimensões/tamanho são obrigatórios.');
    if (peso === undefined || Number(peso) <= 0) errors.push('Peso em gramas deve ser maior que zero.');
    if (precoUnitario === undefined || Number(precoUnitario) < 0) errors.push('Preço unitário não pode ser negativo.');
    if (estoqueMinimo === undefined || Number(estoqueMinimo) < 0) errors.push('Estoque mínimo não pode ser negativo.');
    if (estoqueAtual === undefined || Number(estoqueAtual) < 0) errors.push('Estoque atual não pode ser negativo.');

    // Check code conflict with other products
    if (
      codigo &&
      dbProducts.some((p) => p.id !== id && p.codigo.toLowerCase() === String(codigo).trim().toLowerCase())
    ) {
      errors.push(`O código "${codigo}" já pertence a outro produto cadastrado.`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Falha na validação das edições do produto.',
        errors,
      });
    }

    const categoryObj = dbCategories.find((c) => c.id === Number(categoriaId));

    dbProducts[productIndex] = {
      ...dbProducts[productIndex],
      codigo: String(codigo).trim().toUpperCase(),
      nome: String(nome).trim(),
      categoriaId: Number(categoriaId),
      categoriaNome: categoryObj ? categoryObj.nome : dbProducts[productIndex].categoriaNome,
      materialCabecaHaste: String(materialCabecaHaste).trim(),
      materialCabo: String(materialCabo).trim(),
      revestimentoIsolante: Boolean(revestimentoIsolante),
      pontaImantada: Boolean(pontaImantada),
      tamanho: String(tamanho).trim(),
      peso: Number(peso),
      precoUnitario: Number(precoUnitario),
      estoqueMinimo: Number(estoqueMinimo),
      estoqueAtual: Number(estoqueAtual),
      localizacaoPrateleira: localizacaoPrateleira ? String(localizacaoPrateleira).trim() : dbProducts[productIndex].localizacaoPrateleira,
    };

    return res.json({
      success: true,
      message: 'Dados do produto atualizados com sucesso!',
      product: dbProducts[productIndex],
    });
  });

  // Delete Product (Requirement 6.1.5)
  app.delete('/api/products/:id', (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const productIndex = dbProducts.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Produto não localizado para exclusão.',
      });
    }

    const deletedProduct = dbProducts[productIndex];
    dbProducts.splice(productIndex, 1);

    return res.json({
      success: true,
      message: `Produto "${deletedProduct.nome}" [${deletedProduct.codigo}] removido com sucesso do estoque.`,
    });
  });

  // Get Movements history (Requirement 7 & 9)
  app.get('/api/movements', (req: Request, res: Response) => {
    res.json(dbMovements);
  });

  // Post Stock Movement (Requirement 7.1.2, 7.1.3, 7.1.4)
  app.post('/api/movements', (req: Request, res: Response) => {
    const { produtoId, tipo, quantidade, usuarioId, dataHora, observacao } = req.body;

    const errors: string[] = [];
    if (!produtoId) errors.push('Selecione um produto para a movimentação.');
    if (!tipo || (tipo !== 'Entrada' && tipo !== 'Saída')) errors.push('Tipo de movimentação deve ser Entrada ou Saída.');
    if (!quantidade || Number(quantidade) <= 0) errors.push('Quantidade deve ser um valor inteiro maior que zero.');
    if (!usuarioId) errors.push('Usuário responsável pela operação é obrigatório.');

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Dados de movimentação inválidos.', errors });
    }

    const product = dbProducts.find((p) => p.id === Number(produtoId));
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produto não encontrado.' });
    }

    const user = dbUsers.find((u) => u.id === Number(usuarioId));
    const userNome = user ? user.nome : 'Usuário Almoxarifado';

    const qty = Number(quantidade);
    const estoqueAnterior = product.estoqueAtual;
    let estoqueNovo = estoqueAnterior;

    // Check stock output availability
    if (tipo === 'Saída') {
      if (qty > estoqueAnterior) {
        return res.status(400).json({
          success: false,
          message: `Estoque insuficiente para esta saída! Estoque atual disponível: ${estoqueAnterior} un. Solicitação: ${qty} un.`,
        });
      }
      estoqueNovo = estoqueAnterior - qty;
    } else {
      estoqueNovo = estoqueAnterior + qty;
    }

    // Automatic Check for Minimum Stock Alert (Requirement 7.1.4)
    const alertaGerado = tipo === 'Saída' && estoqueNovo < product.estoqueMinimo;

    // Update Product Stock in DB
    product.estoqueAtual = estoqueNovo;

    // Register Movement
    const newMovement: StockMovement = {
      id: dbMovements.length > 0 ? Math.max(...dbMovements.map((m) => m.id)) + 1 : 1,
      produtoId: product.id,
      produtoNome: product.nome,
      produtoCodigo: product.codigo,
      tipo,
      quantidade: qty,
      estoqueAnterior,
      estoqueNovo,
      estoqueMinimo: product.estoqueMinimo,
      usuarioId: Number(usuarioId),
      usuarioNome: userNome,
      dataHora: dataHora ? String(dataHora) : new Date().toISOString().replace('T', ' ').substring(0, 19),
      observacao: observacao ? String(observacao).trim() : undefined,
      alertaGerado,
    };

    dbMovements.unshift(newMovement);

    return res.status(201).json({
      success: true,
      message: `Movimentação de ${tipo} registrada com sucesso!`,
      movement: newMovement,
      alertaGerado,
      alertaDetalhes: alertaGerado
        ? {
            produtoNome: product.nome,
            produtoCodigo: product.codigo,
            estoqueAtual: estoqueNovo,
            estoqueMinimo: product.estoqueMinimo,
            diferenca: product.estoqueMinimo - estoqueNovo,
          }
        : null,
    });
  });

  // Download SQL Script (Requirement 3.3)
  app.get('/api/db-script', (req: Request, res: Response) => {
    const sql = generateSaepDbSqlScript();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="saep_db_script.sql"');
    res.send(sql);
  });

  // ==========================================
  // VITE DEVELOPMENT OR PRODUCTION MIDDLEWARE
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SAEP System] Servidor iniciado e rodando em http://0.0.0.0:${PORT}`);
  });
}

startServer();
