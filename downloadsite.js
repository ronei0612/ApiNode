/*
* Este método utiliza API do Google
* Para criar e gerar a apiKey precisei acessar o site:
* https://console.cloud.google.com/apis/credentials/key/
* Sessão Credentials (credenciais)
* e criar uma API Key (chave de API), na verdade já veio criada com o nome:
* Browser key (auto created by Firebase)
* Selecionado Definir uma restrição de aplicativo para NENHUM
* Restrições da API para NÃO RESTRINGIR A CHAVE
* 
* Para criar o searchEngineId foi preciso ativar o serviço Custom Search API em
* https://programmablesearchengine.google.com/controlpanel/all
* Utilizei esse site para seguir o passo a passo:
* https://help.elfsight.com/article/331-how-to-get-search-engine-id
* O ID do mecanismo de pesquisa é o searchEngineId
* É possível monitorar em Sessão APIs e Serviços Ativados
* https://console.cloud.google.com/apis/api/customsearch.googleapis.com/             
*/

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

const apiKey = "AIzaSyBWjthtU-mhxX8-YtWh6mLJoiWdLdD9hwE";
const searchEngineId = "c226ebc5ae2754d20";

router.post('/pesquisar', (req, res) => {
  const texto = req.body.texto;
  const query = `cifra ${texto}`;

  const customsearch = google.customsearch('v1');

  customsearch.cse.list({
    key: apiKey,
    cx: searchEngineId,
    q: query,
  }, (err, response) => {
    if (err) {
      res.json({
        success: false,
        message: 'Erro ao realizar a pesquisa.'
      });
    } else {
      const titles = response.data.items.map(item => item.title);
      const links = response.data.items.map(item => item.link);

      res.json({
        success: true,
        lista: titles,
        links: links,
      });
    }
  });
});

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