const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000; 

app.get('/fetch-url', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    const response = await axios.get(url);
    
    // Procurar URLs de imagens na resposta
    const imageUrls = response.data.match(/https:\/\/[^ ]*\.(?:png|jpg|jpeg|gif|webp)/i);
    
    if (imageUrls) {
      res.send(imageUrls[0]);
    } else {
      res.status(404).send('No image URL found in the response');
    }
  } catch (error) {
    res.status(500).send('Error fetching the URL');
  }
});

app.get('/', async (req, res) => {
  res.send('Ok');
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
