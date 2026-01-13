const express = require('express');
const cors = require('cors');

const fetchImageRouter = require('./fetchimage');
const downloadsiteRouter = require('./downloadsite');
const testGetRouter = require('./testget');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/', fetchImageRouter);
app.use('/', downloadsiteRouter);
app.use('/', testGetRouter);

app.get('/', (req, res) => {
  res.send('Ok');
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});