import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import config from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000; // Choisis un port disponible
const WEB_PORT = 8000; // Port pour le site web
const STATIC_DIR = path.join(__dirname, '/'); // Dossier contenant les fichiers statiques

let url_website = 'http://localhost:8000';

if (config) {
    url_website = config.url_website;
}

app.use(express.json());

//configure two origins for cors
const corsOptions = {
    origin: [url_website],
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// Endpoint pour faire la requête vers les API Google
app.post('/', async (req, res) => {
    const { url, method, headers, body } = req.body;

    try {
        const response = await fetch(url, {
            method,
            headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {

        console.error(error);
        res.status(500).json({ error: 'Problème lors de la requête' });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`Le serveur est démarré sur le port ${PORT}`);
});

// Création d'une instance d'express pour servir les fichiers statiques
const webSite = express();
webSite.use(cors(corsOptions));

// Middleware pour servir les fichiers statiques
webSite.use(express.static(STATIC_DIR));

webSite.listen(WEB_PORT, () => {
    console.log(`Le site web est disponible sur le port ${WEB_PORT}`);
});