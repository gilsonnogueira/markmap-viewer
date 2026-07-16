const { google } = require('googleapis');

module.exports = async (req, res) => {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    const folderId = process.env.GALLERY_FOLDER_ID;

    if (!serviceAccountJson || !folderId) {
      return res.status(500).json({ error: 'Faltam variaveis de ambiente GOOGLE_SERVICE_ACCOUNT ou GALLERY_FOLDER_ID' });
    }

    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (e) {
      return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT nao e um JSON valido' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
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
