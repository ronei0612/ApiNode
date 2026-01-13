const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, 'Documento.cs');
const statePath = path.join(__dirname, 'state.json');

// Função para ler o estado salvo (ou criar um se não existir)
function getPersistentState() {
    try {
        if (fs.existsSync(statePath)) {
            const data = fs.readFileSync(statePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Erro ao ler state.json:", err);
    }
    return { lastMtime: 0, fileAlreadySent: false };
}

// Função para salvar o estado no arquivo
function savePersistentState(state) {
    try {
        fs.writeFileSync(statePath, JSON.stringify(state), 'utf8');
    } catch (err) {
        console.error("Erro ao salvar state.json:", err);
    }
}

router.get('/testget', (req, res) => {
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('OK.');
    }

    // 1. Pega os dados atuais do arquivo Documento.cs
    const stats = fs.statSync(filePath);
    const currentMtime = stats.mtimeMs; // Data de modificação em milissegundos

    // 2. Carrega o estado salvo no state.json
    let state = getPersistentState();

    // 3. Lógica de decisão:
    // Se a data de modificação atual for diferente da salva, significa que o arquivo mudou
    const fileChanged = currentMtime !== state.lastMtime;

    if (fileChanged || !state.fileAlreadySent) {
        // Se mudou ou nunca foi enviado, lê e mostra o texto
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return res.status(500).send('Erro ao ler arquivo.');

            // Atualiza o estado e salva no arquivo
            state.lastMtime = currentMtime;
            state.fileAlreadySent = true;
            savePersistentState(state);

            console.log('Arquivo modificado ou novo: Enviando conteúdo.');
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(data);
        });
    } else {
        // Se já foi enviado e a data de modificação é a mesma
        console.log('Arquivo já enviado e sem alterações. Retornando OK.');
        res.send('OK');
    }
});

module.exports = router;