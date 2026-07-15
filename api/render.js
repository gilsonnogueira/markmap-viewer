const fs = require('fs');
const path = require('path');

// Chave de API pública do Google — só funciona para arquivos com permissão "anyone with link"
const API_KEY = 'AIzaSyChGZoL47knD9Hv4MERgKltP2G0GMr9Kyg';

/**
 * Serverless Function Vercel.
 * Intercepta todas as requisições, e se contiverem ?id=FILE_ID,
 * busca o título real do mapa mental no Google Drive e injeta dinamicamente
 * nos cabeçalhos OG antes de responder ao crawler (Telegram, WhatsApp, etc.).
 *
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
module.exports = async (req, res) => {
  const htmlPath = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf8');

  const { id } = req.query;

  // Sem ?id: retorna o HTML padrão (editor)
  if (!id) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  let title = 'Mapa Mental Interativo';
  let description = 'Visualize este mapa mental criado com Markmap Viewer.';

  try {
    // 1. Tenta buscar o nome do arquivo no Drive (requer que o arquivo seja público)
    const metaRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?fields=name&key=${API_KEY}`,
      { headers: { Accept: 'application/json' } }
    );

    if (metaRes.ok) {
      const meta = await metaRes.json();
      const filename = (meta.name || '').replace(/\.md$/i, '');
      if (filename) title = filename;
    } else {
      const err = await metaRes.json().catch(() => ({}));
      console.warn('[render] Drive meta erro:', metaRes.status, err?.error?.message);
    }

    // 2. Tenta baixar o conteúdo .md para extrair o Nível 0 (#)
    const contentRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}`
    );

    if (contentRes.ok) {
      const text = await contentRes.text();
      const match = text.match(/^#\s+(.+)$/m);
      if (match) {
        // Remove tags HTML e marcação de negrito antes de usar como título
        title = match[1].replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();
      }
    } else {
      console.warn('[render] Drive content erro:', contentRes.status);
    }

    description = `Mapa mental sobre "${title}" — criado com Markmap Viewer + Google Drive.`;
  } catch (e) {
    console.error('[render] Erro inesperado ao buscar Drive:', e.message);
  }

  // 3. Substitui os OG tags no HTML antes de devolver ao crawler
  html = html
    .replace(/<title>[^<]*<\/title>/, `<title>Markmap — ${title}</title>`)
    .replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="Markmap — ${title}"`)
    .replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${description}"`)
    .replace(/<meta property="twitter:title" content="[^"]*"/, `<meta property="twitter:title" content="Markmap — ${title}"`)
    .replace(/<meta property="twitter:description" content="[^"]*"/, `<meta property="twitter:description" content="${description}"`);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};
