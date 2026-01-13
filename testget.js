const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Caminho para o arquivo que você quer enviar (ex: um arquivo .txt ou .json)
// Certifique-se de que esse arquivo existe na pasta do projeto!
const filePath = path.join(__dirname, 'Documento.cs');

let fileSent = false;

// Observa mudanças no arquivo para resetar o status
if (fs.existsSync(filePath)) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            console.log('Arquivo alterado! Resetando flag.');
            fileSent = false;
        }
    });
}

router.get('/testget', (req, res) => {
    // Verifica se o arquivo físico existe
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Arquivo não encontrado.');
    }

    if (!fileSent) {
        // Envia o arquivo pela primeira vez (ou após modificação)
        res.sendFile(filePath, (err) => {
            if (err) {
                res.status(500).send('Erro ao enviar arquivo.');
            } else {
                fileSent = true;
                console.log('Arquivo enviado.');
            }
        });
    } else {
        // Retorna apenas OK nas requisições seguintes
        res.send('OK');
        console.log('Arquivo já enviado anteriormente. Retornando OK.');
    }
});

module.exports = router;