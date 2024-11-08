const express = require('express');
const axios = require('axios');

const router = express.Router();

router.post('/fetch-url', async (req, res) => {
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
    let imageUrl = match ? match[0].split('">')[0] : null;
    
    if (imageUrl) {
      imageUrl = imageUrl.split('=w')[0];
      res.send(imageUrl);
    } else {
      res.status(404).send('No image URL found in the response');
    }
  } catch (error) {
    res.status(500).send('Error fetching the URL');
  }
});

module.exports = router;