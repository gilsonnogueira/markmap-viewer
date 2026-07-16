const { google } = require('googleapis');

module.exports = async (req, res) => {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    const folderId = process.env.GALLERY_FOLDER_ID;

    if (!serviceAccountJson || !folderId) {
      return res.status(500).json({ error: 'Faltam variaveis de ambiente GOOGLE_SERVICE_ACCOUNT ou GALLERY_FOLDER_ID' });
    }

    let client_email, private_key;
    try {
      // Tenta parse normal
      let parsed = JSON.parse(serviceAccountJson);
      // Se Vercel adicionou aspas extras ou escapou o JSON duas vezes
      if (typeof parsed === 'string') parsed = JSON.parse(parsed);
      client_email = parsed.client_email;
      private_key = parsed.private_key;
    } catch (e) {
      // Fallback: Regex para pegar os campos ignorando quebra do JSON
      const emailMatch = serviceAccountJson.match(/"client_email"\s*:\s*"([^"]+)"/);
      const keyMatch = serviceAccountJson.match(/"private_key"\s*:\s*"([^"]+)"/);
      if (emailMatch && keyMatch) {
         client_email = emailMatch[1];
         private_key = keyMatch[1];
      } else {
         return res.status(500).json({ error: 'Falha ao processar GOOGLE_SERVICE_ACCOUNT' });
      }
    }

    // Corrige quebras de linha na chave privada (Vercel costuma escapar para \\n literal)
    private_key = private_key.replace(/\\n/g, '\n');

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email, private_key },
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });

    const drive = google.drive({ version: 'v3', auth });

    // Busca os arquivos dentro da pasta, filtrando lixeira e pastas
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 100, // Ajuste se tiver mais de 100 mapas
    });

    return res.status(200).json({ files: response.data.files });
  } catch (error) {
    console.error('Erro na API gallery:', error);
    return res.status(500).json({ error: error.message });
  }
};
// trigger build  
