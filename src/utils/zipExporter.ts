import JSZip from 'jszip';
import { FUNCTIONAL_REQUIREMENTS, INFRA_REQUIREMENTS, TEST_CASES } from '../data/initialData';
import { generateSaepDbSqlScript } from './sqlGenerator';

export async function generateAndDownloadSaepDeliverablesZip(alunoNome: string = 'Estudante_SAEP') {
  const zip = new JSZip();
  const folderName = `${alunoNome.replace(/\s+/g, '_')}_SAEP_Entregas`;

  // 1. Requisitos Funcionais
  let rfContent = `DOCUMENTAÇÃO - ENTREGA 1: LISTA DE REQUISITOS FUNCIONAIS\n`;
  rfContent += `=========================================================================\n\n`;
  FUNCTIONAL_REQUIREMENTS.forEach((rf) => {
    rfContent += `[${rf.id}] ${rf.nome} (Prioridade: ${rf.prioridade})\n`;
    rfContent += `Descrição: ${rf.descricao}\n\n`;
  });
  zip.file(`${folderName}/1_Lista_Requisitos_Funcionais.txt`, rfContent);

  // 2. Diagrama Entidade Relacionamento (DER SVG)
  const derSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 650" width="100%" height="100%" style="background:#0f172a; font-family: sans-serif;">
    <!-- Title -->
    <text x="500" y="35" fill="#f8fafc" font-size="20" font-weight="bold" text-anchor="middle">DIAGRAMA ENTIDADE RELACIONAMENTO (DER) - SAEP_DB</text>
    <text x="500" y="55" fill="#94a3b8" font-size="12" text-anchor="middle">Sistema de Gestão de Almoxarifado de Ferramentas e Equipamentos</text>
    
    <!-- Table: tb_usuarios -->
    <g transform="translate(50, 90)">
      <rect width="260" height="210" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
      <rect width="260" height="35" rx="8" fill="#2563eb"/>
      <text x="130" y="23" fill="#ffffff" font-weight="bold" text-anchor="middle">tb_usuarios</text>
      <text x="15" y="60" fill="#60a5fa" font-size="12">PK id_usuario : SERIAL</text>
      <text x="15" y="85" fill="#e2e8f0" font-size="12">   nome : VARCHAR(100)</text>
      <text x="15" y="110" fill="#e2e8f0" font-size="12">   email : VARCHAR(120) [UQ]</text>
      <text x="15" y="135" fill="#e2e8f0" font-size="12">   senha : VARCHAR(255)</text>
      <text x="15" y="160" fill="#e2e8f0" font-size="12">   cargo : VARCHAR(50)</text>
      <text x="15" y="185" fill="#e2e8f0" font-size="12">   ativo : BOOLEAN</text>
    </g>

    <!-- Table: tb_categorias -->
    <g transform="translate(690, 90)">
      <rect width="260" height="150" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="2"/>
      <rect width="260" height="35" rx="8" fill="#059669"/>
      <text x="130" y="23" fill="#ffffff" font-weight="bold" text-anchor="middle">tb_categorias</text>
      <text x="15" y="60" fill="#34d399" font-size="12">PK id_categoria : SERIAL</text>
      <text x="15" y="85" fill="#e2e8f0" font-size="12">   nome : VARCHAR(80)</text>
      <text x="15" y="110" fill="#e2e8f0" font-size="12">   descricao : TEXT</text>
    </g>

    <!-- Table: tb_produtos -->
    <g transform="translate(370, 90)">
      <rect width="280" height="360" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2"/>
      <rect width="280" height="35" rx="8" fill="#d97706"/>
      <text x="140" y="23" fill="#ffffff" font-weight="bold" text-anchor="middle">tb_produtos</text>
      <text x="15" y="60" fill="#fbbf24" font-size="12">PK id_produto : SERIAL</text>
      <text x="15" y="85" fill="#e2e8f0" font-size="12">   codigo : VARCHAR(30) [UQ]</text>
      <text x="15" y="110" fill="#e2e8f0" font-size="12">   nome : VARCHAR(120)</text>
      <text x="15" y="135" fill="#34d399" font-size="12">FK id_categoria : INT</text>
      <text x="15" y="160" fill="#e2e8f0" font-size="12">   material_cabeca_haste : VARCHAR</text>
      <text x="15" y="185" fill="#e2e8f0" font-size="12">   material_cabo : VARCHAR</text>
      <text x="15" y="210" fill="#e2e8f0" font-size="12">   revestimento_isolante : BOOL</text>
      <text x="15" y="235" fill="#e2e8f0" font-size="12">   ponta_imantada : BOOL</text>
      <text x="15" y="260" fill="#e2e8f0" font-size="12">   tamanho : VARCHAR(50)</text>
      <text x="15" y="285" fill="#e2e8f0" font-size="12">   peso_gramas : NUMERIC</text>
      <text x="15" y="310" fill="#e2e8f0" font-size="12">   estoque_minimo : INT</text>
      <text x="15" y="335" fill="#e2e8f0" font-size="12">   estoque_atual : INT</text>
    </g>

    <!-- Table: tb_movimentacoes -->
    <g transform="translate(190, 380)">
      <rect width="320" height="240" rx="8" fill="#1e293b" stroke="#ec4899" stroke-width="2"/>
      <rect width="320" height="35" rx="8" fill="#db2777"/>
      <text x="160" y="23" fill="#ffffff" font-weight="bold" text-anchor="middle">tb_movimentacoes</text>
      <text x="15" y="60" fill="#f472b6" font-size="12">PK id_movimentacao : SERIAL</text>
      <text x="15" y="85" fill="#fbbf24" font-size="12">FK id_produto : INT</text>
      <text x="15" y="110" fill="#60a5fa" font-size="12">FK id_usuario : INT</text>
      <text x="15" y="135" fill="#e2e8f0" font-size="12">   tipo_movimentacao : Entrada|Saída</text>
      <text x="15" y="160" fill="#e2e8f0" font-size="12">   quantidade : INT</text>
      <text x="15" y="185" fill="#e2e8f0" font-size="12">   estoque_anterior / novo : INT</text>
      <text x="15" y="210" fill="#e2e8f0" font-size="12">   data_hora : TIMESTAMP</text>
    </g>

    <!-- Relationships lines -->
    <!-- Categorias (1) -> Produtos (N) -->
    <path d="M 690 160 L 650 160" stroke="#10b981" stroke-width="2" stroke-dasharray="4" marker-end="url(#arrow)"/>
    <text x="670" y="150" fill="#10b981" font-size="12">1:N</text>

    <!-- Produtos (1) -> Movimentacoes (N) -->
    <path d="M 510 450 L 510 480" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4"/>
    <text x="520" y="465" fill="#f59e0b" font-size="12">1:N</text>

    <!-- Usuarios (1) -> Movimentacoes (N) -->
    <path d="M 180 300 L 180 480 L 190 480" stroke="#3b82f6" stroke-width="2" stroke-dasharray="4"/>
    <text x="130" y="420" fill="#3b82f6" font-size="12">1:N</text>
  </svg>`;
  zip.file(`${folderName}/2_Diagrama_Entidade_Relacionamento_DER.svg`, derSvg);

  // 3. Script SQL saep_db
  const sqlScript = generateSaepDbSqlScript();
  zip.file(`${folderName}/3_Script_Criacao_e_Populacao_saep_db.sql`, sqlScript);

  // 8. Casos de Teste
  let ctContent = `DOCUMENTAÇÃO - ENTREGA 8: DESCRITIVO DE CASOS DE TESTE DE SOFTWARE\n`;
  ctContent += `=========================================================================\n\n`;
  TEST_CASES.forEach((ct) => {
    ctContent += `ID: ${ct.id} | Requisito: ${ct.requisitoId} | Nome: ${ct.nome}\n`;
    ctContent += `Objetivo: ${ct.objetivo}\n`;
    ctContent += `Pré-condição: ${ct.preCondicao}\n`;
    ctContent += `Passos:\n${ct.passos.join('\n')}\n`;
    ctContent += `Resultado Esperado: ${ct.resultadoEsperado}\n`;
    ctContent += `Status: [${ct.status}]\n\n`;
  });
  zip.file(`${folderName}/8_Descritivo_Casos_de_Teste.txt`, ctContent);

  // 9. Requisitos de Infraestrutura
  let infraContent = `DOCUMENTAÇÃO - ENTREGA 9: LISTA DE REQUISITOS DE INFRAESTRUTURA\n`;
  infraContent += `=========================================================================\n\n`;
  INFRA_REQUIREMENTS.forEach((inf) => {
    infraContent += `Item: ${inf.item}\n`;
    infraContent += `Componente: ${inf.componente}\n`;
    infraContent += `Especificação: ${inf.especificacao}\n`;
    infraContent += `Detalhes: ${inf.detalhes}\n\n`;
  });
  zip.file(`${folderName}/9_Lista_Requisitos_Infraestrutura.txt`, infraContent);

  // Sistema Source Info
  zip.file(`${folderName}/sistema/LEAME_SISTEMA.txt`, `Sistema Web de Gestão de Almoxarifado SAEP\nDesenvolvido com React + TypeScript + Vite + Express + Tailwind CSS.`);

  // Generate blob & download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
