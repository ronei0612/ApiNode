const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/fetch-url', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await axios.get(url);
    
    // Procurar URLs de imagens na resposta
    const match = response.data.match(/https:\/\/(lh3|th)[^ ]*/i);
    const imageUrl = match ? match[0].split('">')[0] : null;
    
    if (imageUrl) {
      res.send(imageUrl);
    } else {
      res.status(404).send('No image URL found in the response');
    }
  } catch (error) {
    res.status(500).send('Error fetching the URL');
  }
});

app.post('/downloadsite', async (req, res) => {
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
    //tom = tomElement.attr('title').split('>')[1].split('<')[0].trim();
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

app.get('/', async (req, res) => {
  res.send('Ok');
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
