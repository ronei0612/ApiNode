const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Vamos usar o axios que você já tem
const router = express.Router();

const statePath = path.join(__dirname, 'state.json');
// URL de exportação de texto do seu Google Doc
const googleDocUrl = 'https://docs.google.com/document/d/1P8jVJAgcI-vHREkB6uAgYyj8OW3PFXDbInC_6_cPoWY/export?format=txt';

function getPersistentState() {
    try {
        if (fs.existsSync(statePath)) {
            const data = fs.readFileSync(statePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Erro ao ler state.json:", err);
    }
}

function savePersistentState(state) {
    try {
        fs.writeFileSync(statePath, JSON.stringify(state), 'utf8');
    } catch (err) { }
}

router.get('/testget', async (req, res) => {
    try {
        // 1. Busca o conteúdo atual do Google Docs
        const response = await axios.get(googleDocUrl);
        const currentContent = response.data;

        // 2. Carrega o estado salvo
        let state = getPersistentState();

        // 3. Verifica se o conteúdo mudou desde a última vez
        const contentChanged = currentContent !== state.lastContent;

        if (contentChanged || !state.fileAlreadySent) {
            // Se mudou ou é a primeira vez, envia o texto
            state.lastContent = currentContent;
            state.fileAlreadySent = true;
            savePersistentState(state);

            console.log('Google Doc alterado ou novo. Enviando conteúdo...');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(currentContent);
        } else {
            // Se o conteúdo for idêntico ao salvo
            console.log('Sem alterações no Google Doc. Retornando OK.');
            res.send('OK');
        }
    } catch (error) {
        console.error('Erro ao buscar Google Doc:', error.message);
        res.status(500).send('OK.');
    }
});

module.exports = router;