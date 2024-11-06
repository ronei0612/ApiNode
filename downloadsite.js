const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.post('/downloadsite', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await axios.get(url);
    const html = response.data;

    const { tom, cifraTexto } = obterCifra(html);

    res.json({ tom, cifraTexto });

  } catch (error) {
    console.error('Erro ao buscar a URL:', error);
    res.status(500).json({ error: 'Error fetching the URL' });
  }
});

function obterCifra(html) {
  const $ = cheerio.load(html);

  let tom = '';
  const tomElement = $('#cifra_tom a');
  if (tomElement.length > 0) {
    tom = tomElement.text().trim();
  }

  $('span.tablatura').remove();
  
  let cifraTexto = $('pre').text().trim();
  if (cifraTexto === '') {
    return { tom, cifraTexto: 'Cifra não encontrada' };
  }

  if (!cifraTexto.startsWith('<pre>')) {
    cifraTexto = '<pre>' + cifraTexto;
  }
  if (!cifraTexto.endsWith('</pre>')) {
    cifraTexto += '</pre>';
  }
  if (tom === '') {
    tom = 'C';
    cifraTexto += '\n\n<p>Tom não encontrado.</p>';
  }

  return { tom, cifraTexto };
}

module.exports = router;