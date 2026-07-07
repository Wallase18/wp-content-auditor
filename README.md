# WP Content Auditor 🚀

Um utilitário em Node.js projetado para escanear sites WordPress em busca de duas falhas comuns de SEO e digitação:
1. **Posts com Títulos Duplicados:** Identifica matérias diferentes criadas acidentalmente com o mesmo título.
2. **Parágrafos Repetidos Internamente:** Detecta se trechos de texto ou parágrafos foram colados duas vezes dentro da mesma matéria (erros comuns de edição).

O script gera um relatório visual interativo em HTML com links diretos para a tela de edição de cada post no seu painel do WordPress.

---

## 🛠️ Tecnologias Utilizadas

*   [Node.js](https://nodejs.org/)
*   [Fast XML Parser](https://www.npmjs.com/package/fast-xml-parser)
*   [Axios](https://github.com/axios/axios)
*   [HTML to Text](https://www.npmjs.com/package/html-to-text)

---

## 🚀 Como Configurar e Usar

### 1. Pré-requisitos
Certifique-se de ter o **Node.js** instalado em sua máquina.

### 2. Instalação
Abra o terminal na pasta do projeto e instale as dependências necessárias:
$ npm install

### 3. Modo de Uso 1: Analisando via API (Recomendado)
Este modo não exige download de arquivos. O script faz chamadas na REST API nativa e pública do seu WordPress.

1. Abra o arquivo `buscar_via_api.js`.
2. Altere a variável `URL_SITE` informando o link do seu site (sem a barra final):
   const URL_SITE = '[https://seusite.com.br](https://seusite.com.br)';

3. Execute o script no terminal:
   $ npm run api

4. Abra o arquivo `relatorio_duplicadas_api.html` gerado no seu navegador.

### 4. Modo de Uso 2: Analisando via arquivo XML de Exportação
Caso prefira rodar localmente usando o arquivo `.xml` gerado pela ferramenta de exportação nativa do WordPress (Ferramentas > Exportar).

1. Coloque o arquivo XML exportado na raiz deste projeto.
2. Abra o arquivo `buscar_via_xml.js` e configure o nome do arquivo e a URL do seu site:
   const NOME_ARQUIVO_XML = 'seu_arquivo.xml';
   const URL_SITE = '[https://seusite.com.br](https://seusite.com.br)';

3. Execute o script no terminal:
   $ npm run xml

4. Abra o arquivo `relatorio_duplicadas.html` gerado no seu navegador.

---

## 📊 O Relatório Gerado

O arquivo HTML resultante separa os problemas encontrados em blocos visuais e lógicos:
*   🔴 **Cards Vermelhos (Títulos Duplicados):** Agrupa posts que estão competindo pelo mesmo título no site, mostrando os IDs envolvidos.
*   🟡 **Cards Amarelos (Texto Interno Duplicado):** Mostra o trecho exato do texto que ficou duplicado dentro de uma matéria específica.

Cada card possui o botão **Editar no WordPress**. Se você já estiver logado no painel do seu site, o botão abrirá diretamente a tela de edição do post correspondente para correção imediata.

---

## 📝 Licença
Este projeto está sob a licença MIT. Sinta-se livre para usar e melhorar.
