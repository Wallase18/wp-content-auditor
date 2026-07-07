const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const { convert } = require('html-to-text');

// CONFIGURAÇÃO: Altere para os seus dados reais
const NOME_ARQUIVO_XML = 'seu_arquivo.xml';
const NOME_ARQUIVO_RELATORIO = 'relatorio_duplicadas.html';
const URL_SITE = 'https://seusite.com.br';

function buscarDuplicatasEGerarRelatorio() {
  try {
    if (!fs.existsSync(NOME_ARQUIVO_XML)) {
      console.error(`Erro: O arquivo '${NOME_ARQUIVO_XML}' não foi encontrado.`);
      return;
    }

    console.log(`Lendo o arquivo '${NOME_ARQUIVO_XML}'...`);
    const xmlData = fs.readFileSync(NOME_ARQUIVO_XML, 'utf-8');

    const xmlLimpo = xmlData
      .replace(/<content:encoded>/g, '<content_encoded>')
      .replace(/<\/content:encoded>/g, '</content_encoded>')
      .replace(/<wp:post_id>/g, '<wp_post_id>')
      .replace(/<\/wp:post_id>/g, '</wp_post_id>');

    const parser = new XMLParser({ ignoreAttributes: true, trimValues: true });
    const jsonObj = parser.parse(xmlLimpo);
    const items = jsonObj.rss?.channel?.item;

    if (!items) {
      console.log("Nenhum post encontrado no formato esperado.");
      return;
    }

    const listaItens = Array.isArray(items) ? items : [items];

    // 1. MAPEAMENTO DE TÍTULOS DUPLICADOS
    const contagemTitulos = {};
    listaItens.forEach(item => {
      const titulo = (item.title || 'Sem título').toString().trim();
      contagemTitulos[titulo] = (contagemTitulos[titulo] || 0) + 1;
    });

    let totalTextoDuplicado = 0;
    let totalTitulosDuplicados = 0;
    let resultadosHtmlTexto = '';
    let resultadosHtmlTitulo = '';
    const postsPorTitulo = {};

    listaItens.forEach(item => {
      const titulo = (item.title || 'Sem título').toString().trim();
      const postId = item.wp_post_id || 'N/A';
      const link = item.link || '#';
      const conteudoHtml = item.content_encoded;

      if (contagemTitulos[titulo] > 1) {
        if (!postsPorTitulo[titulo]) postsPorTitulo[titulo] = [];
        postsPorTitulo[titulo].push({ id: postId, link: link });
      }

      // 2. ANÁLISE DE CONTEÚDO DUPLICADO
      if (conteudoHtml && typeof conteudoHtml === 'string') {
        const textoLimpo = convert(conteudoHtml, { wordwrap: false });
        const paragrafos = textoLimpo.split('\n').map(p => p.trim()).filter(p => p.length > 50);
        const duplicados = new Set();

        paragrafos.forEach(p => {
          const contagem = paragrafos.filter(itemParafago => itemParafago === p).length;
          if (contagem > 1) duplicados.add(p);
        });

        if (duplicados.size > 0) {
          totalTextoDuplicado++;
          let trechosHtml = '';
          duplicados.forEach(dup => {
            trechosHtml += `<li><strong>Trecho repetido:</strong> <span class="highlight">"${dup}"</span></li>`;
          });

          resultadosHtmlTexto += `
                    <div class="card card-texto">
                        <div class="card-header">
                            <span class="post-id">ID: ${postId}</span>
                            <h2>${titulo}</h2>
                        </div>
                        <div class="card-body">
                            <ul>${trechosHtml}</ul>
                            <div class="actions">
                                <a href="${link}" target="_blank" class="btn">Ver no Site</a>
                                <a href="${URL_SITE}/wp-admin/post.php?post=${postId}&action=edit" target="_blank" class="btn btn-wp">Editar no WordPress</a>
                            </div>
                        </div>
                    </div>`;
        }
      }
    });

    Object.keys(postsPorTitulo).forEach(titulo => {
      totalTitulosDuplicados++;
      let itensHtml = '';
      postsPorTitulo[titulo].forEach(p => {
        itensHtml += `
                <div class="sub-item">
                    <strong>ID: ${p.id}</strong> -
                    <a href="${p.link}" target="_blank">Ver no Site</a> |
                    <a href="${URL_SITE}/wp-admin/post.php?post=${p.id}&action=edit" target="_blank">Editar no WP</a>
                </div>`;
      });

      resultadosHtmlTitulo += `
            <div class="card card-titulo">
                <div class="card-header">
                    <span class="post-id alert-id">${postsPorTitulo[titulo].length} Posts</span>
                    <h2>Título Repetido: "${titulo}"</h2>
                </div>
                <div class="card-body">
                    <p>Os posts abaixo compartilham exatamente o mesmo título:</p>
                    ${itensHtml}
                </div>
            </div>`;
    });

    const htmlCompleto = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Geral de Duplicatas</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f0f2f5; color: #333; margin: 0; padding: 40px 20px; }
        .container { max-width: 900px; margin: 0 auto; }
        h1 { color: #1d2327; margin-bottom: 20px; }
        .grid-summary { display: flex; gap: 20px; margin-bottom: 30px; }
        .summary { flex: 1; background: #fff; padding: 15px 20px; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-size: 15px; }
        .summary.texto { border-left: 4px solid #dba617; }
        .summary.titulo { border-left: 4px solid #d63638; }
        .secao-titulo { margin-top: 40px; border-bottom: 2px solid #ccd0d4; padding-bottom: 8px; color: #1d2327; }
        .card { background: #fff; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); margin-bottom: 25px; border: 1px solid #ccd0d4; overflow: hidden; }
        .card-texto { border-left: 4px solid #dba617; }
        .card-titulo { border-left: 4px solid #d63638; }
        .card-header { background: #f6f7f7; padding: 15px 20px; border-bottom: 1px solid #ccd0d4; display: flex; align-items: center; justify-content: space-between; }
        .card-header h2 { margin: 0; font-size: 17px; color: #1d2327; flex: 1; }
        .post-id { background: #2271b1; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 13px; margin-right: 15px; }
        .alert-id { background: #d63638; }
        .card-body { padding: 20px; }
        .sub-item { background: #f6f7f7; padding: 10px; margin-bottom: 8px; border-radius: 4px; border: 1px solid #e5e5e5; }
        .sub-item a { color: #2271b1; text-decoration: none; font-weight: 500; }
        ul { margin: 0; padding-left: 20px; }
        li { margin-bottom: 15px; line-height: 1.5; color: #50575e; }
        .highlight { background-color: #fff8e5; border-left: 3px solid #dba617; padding: 5px 10px; display: block; margin-top: 5px; font-style: italic; color: #2c3338; }
        .actions { margin-top: 20px; padding-top: 15px; border-top: 1px solid #f0f0f0; }
        .btn { display: inline-block; padding: 8px 14px; text-decoration: none; border-radius: 4px; font-size: 14px; font-weight: 500; margin-right: 10px; background: #f6f7f7; color: #2271b1; border: 1px solid #2271b1; }
        .btn-wp { background: #2271b1; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Relatório de Auditoria WordPress (XML)</h1>

        <div class="grid-summary">
            <div class="summary texto">
                <strong>Parágrafos Repetidos:</strong> <span style="color: #dba617; font-weight: bold;">${totalTextoDuplicado}</span> posts com texto duplicado interno.
            </div>
            <div class="summary titulo">
                <strong>Títulos Duplicados:</strong> <span style="color: #d63638; font-weight: bold;">${totalTitulosDuplicados}</span> títulos idênticos repetidos entre posts.
            </div>
        </div>

        <h2 class="secao-titulo">1. Posts com Títulos Duplicados (Conflito entre Matérias)</h2>
        ${totalTitulosDuplicados === 0 ? '<p>Nenhum título duplicado encontrado entre posts.</p>' : resultadosHtmlSupplier = resultadosHtmlTitulo}

        <h2 class="secao-titulo">2. Posts com Texto Interno Duplicado (Mesma Matéria)</h2>
        ${totalTextoDuplicado === 0 ? '<p>Nenhum parágrafo interno duplicado encontrado.</p>' : resultadosHtmlTexto}
    </div>
</body>
</html>`;

    fs.writeFileSync(NOME_ARQUIVO_RELATORIO, htmlCompleto, 'utf-8');
    console.log(`\n[SUCESSO] Relatório XML gerado com sucesso.`);
  } catch (error) {
    console.error("Erro ao processar o arquivo:", error.message);
  }
}

buscarDuplicatasEGerarRelatorio();
