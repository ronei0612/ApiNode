const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const filePath = path.join(__dirname, 'Documento.cs');

let fileSent = false;

if (fs.existsSync(filePath)) {
    fs.watch(filePath, (eventType) => {
        if (eventType === 'change') {
            console.log('Documento.cs modificado!');
            fileSent = false;
        }
    });
}

router.get('/testget', (req, res) => {
    if (!fs.existsSync(filePath)) {
        return res.status(404).send('Arquivo Documento.cs não encontrado.');
    }

    if (!fileSent) {
        // .download(caminho_no_servidor, nome_do_arquivo_ao_baixar)
        res.download(filePath, 'Documento.cs', (err) => {
            if (err) {
                // Se houver erro e os headers ainda não foram enviados, responde erro
                if (!res.headersSent) {
                    res.status(500).send('Erro ao baixar o arquivo.');
                }
            } else {
                fileSent = true;
                console.log('Documento.cs baixado com sucesso.');
            }
        });
    } else {
        res.send('OK');
    }
});

module.exports = router;