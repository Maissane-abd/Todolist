
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const router = require('./app/router');

const app = express();

// On autorise tout le monde sur notre API
app.use(cors());

// On demande à Express d'extraire les données des requêtes POST
app.use(express.urlencoded({ extended: true }));

// On demande à Express d'extraire les données des requêtes POST formatées en multipart
app.use(express.json());

// On demande à Express d'extraire les données des requêtes POST formatées en JSON
const mutipartParser = multer();
app.use(mutipartParser.none()); // On utlise .none() pour dire qu'on attend pas de fichier, uniquement des inputs "classiques" !

// On plug le router
app.use(router);

// On lance l'application
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`API demarrée sur http://localhost:${port}`);
});
