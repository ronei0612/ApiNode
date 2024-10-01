const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/fetch-url', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).send('URL is required');
  }

  try {
    if (url.startsWith("https://www.bing.com/images/create/")) {
      const idMatch = url.match(/thId=([^&]*)/);
      const id = idMatch ? idMatch[1] : null;
      
      if (id) {
        const convertedUrl = `https://th.bing.com/th/id/${id}?pid=ImgGn`;
        return res.send(convertedUrl);
      } else {
        return res.status(400).send('Invalid URL: No thId found');
      }
    }

    const response = await axios.get(url);
    
    const match = response.data.match(/https:\/\/lh3[^ ]*/i);
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

app.get('/', async (req, res) => {
  res.send('Ok');
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
