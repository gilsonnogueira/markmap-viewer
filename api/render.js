const fs = require('fs');
const path = require('path');

// Chave de API pública para ler metadados/arquivos sem necessidade de login do lado do servidor
const API_KEY = 'AIzaSyChGZoL47knD9Hv4MERgKltP2G0GMr9Kyg';

/**
 * Serverless Function executada pela Vercel.
 * Intercepta as requisições da raiz e, caso contenham o parâmetro ?id=, injeta
 * dinamicamente o título e a descrição reais do mapa mental do Google Drive
 * nos cabeçalhos HTML (Open Graph e Twitter Cards) antes de responder ao cliente/crawler.
 */
module.exports = async (req, res) => {
  const { id } = req.query;
  const htmlPath = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Caso não exista o parâmetro id (fluxo de uso normal/editor), envia o HTML cru imediatamente
  if (!id) {
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }

  try {
    let filename = 'Mapa Mental';
    let subjectTitle = '';

    // 1. Busca os metadados do arquivo (especialmente o nome) via Google Drive API v3
    try {
      const metaRes = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?fields=name&key=${API_KEY}`);
      if (metaRes.ok) {
        const meta = await metaRes.json();
        filename = meta.name || 'Mapa Mental';
      }
    } catch (err) {
      console.error('[Vercel Serverless] Erro ao carregar metadados:', err);
    }

    // 2. Busca o conteúdo textual do arquivo para extrair o cabeçalho Nível 0 (#)
    try {
      const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`);
      if (contentRes.ok) {
        const text = await contentRes.text();
        const match = text.match(/^#\s+(.+)$/m);
        if (match) {
          // Limpa tags HTML e marcações de negrito do título extraído
          subjectTitle = match[1].replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();
        }
      }
    } catch (err) {
      console.error('[Vercel Serverless] Erro ao carregar conteúdo:', err);
    }

    // 3. Determina o título final e descrição descritiva do mapa
    const title = subjectTitle || filename.replace('.md', '');
    const description = `Mapa mental interativo sobre: ${title}. Salvo no Google Drive.`;

    // 4. Substitui dinamicamente as tags de cabeçalho no HTML retornado
    html = html.replace(/<title>.*?<\/title>/g, `<title>Markmap — ${title}</title>`);
    html = html.replace(/<meta property="og:title" content=".*?"/g, `<meta property="og:title" content="Markmap — ${title}"`);
    html = html.replace(/<meta property="og:description" content=".*?"/g, `<meta property="og:description" content="${description}"`);
    html = html.replace(/<meta property="twitter:title" content=".*?"/g, `<meta property="twitter:title" content="Markmap — ${title}"`);
    html = html.replace(/<meta property="twitter:description" content=".*?"/g, `<meta property="twitter:description" content="${description}"`);

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  } catch (e) {
    console.error('[Vercel Serverless] Erro geral no processamento:', e);
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
  }
};
