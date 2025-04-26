//import fs from 'fs';
//import https from 'https';
import express from 'express';
import cors from 'cors';
import sequelize from './configs/database.config.js'; 
import User from './models/User.js';

//
/*

################ On test si la connexion a la db est successful ou pas (on l'a creer dans db.js) ################

    sequelize.authenticate() :
    Cette méthode est utilisée pour vérifier que la connexion à la base de données fonctionne correctement.
    Elle tente de se connecter à la base de données et renvoie une promesse.

    Si la connexion réussit, le bloc then() est exécuté,
    et un message "Connexion à la base de données SQLite réussie !" est affiché dans la console.

    Si la connexion échoue, la promesse est rejetée et le bloc catch() est exécuté,
    affichant un message d'erreur détaillé dans la console.

    Une promesse représente une valeur qui peut être disponible maintenant, dans le futur ou jamais.

#################################################################################################################

*/


sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données SQLite réussie !');
  })
  .catch((error) => {
    console.error('Impossible de se connecter à la base de données:', error);
  });


/*

############################################# On initialise le serveur Express ###########################################

    express() :
    Cela crée une instance de l'application Express.
    Express est un framework qui simplifie la gestion des requêtes HTTP dans une application Node.js.

    port :
    La variable port définit sur quel port le serveur va écouter les requêtes.
    Ici, il écoute sur le port 8000, ce qui signifie que ton API sera accessible à l'adresse http://localhost:8000.

##########################################################################################################################

*/

const app = express();
const port = 8000;


/*

############################################################## middleware #############################################################
    cors() :
    Le middleware cors() permet de résoudre les problèmes de politique de même origine (CORS).
    En d'autres termes, cela permet à ton API d'accepter des requêtes venant de domaines différents de celui de l'API.
    Cela est particulièrement utile si ton frontend et ton backend sont hébergés sur des serveurs différents pendant le développement.

    express.json() :
    Ce middleware permet de parser les données JSON envoyées dans le corps des requêtes HTTP.
    Par exemple, quand un utilisateur crée un compte et envoie des données comme username,
    email et password, ces données sont envoyées en JSON, et ce middleware va automatiquement
    les convertir en objet JavaScript dans req.body.

########################################################################################################################################

*/


app.use(cors());
app.use(express.json());


/*

############################################### Requete POST pour la DB ##############################################

    Cette route permet de créer un utilisateur dans la base de données en envoyant une requête HTTP POST à /api/users.

######################################################################################################################

*/


app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis (username, email, password)' });
    }

    try {

      await sequelize.sync();

      const newUser = await User.create({ username, email, password });

      res.status(201).json(newUser);

    } catch (error) { res.status(500).json({ error: 'Erreur interne du serveur' }); }
});


/*

############################################ Requete GET pour la DB ############################################

    Cette route permet de récupérer tous les utilisateurs stockés dans la base de données.

#################################################################################################################

*/


app.get('/api/users', async (req, res) => {

  try {
    
    const users = await User.findAll();
    res.status(200).json(users);

  } catch (error) { res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' }); }
});



/*

############################################ Lancement du serveur ############################################

    Cela démarre le serveur Express et lui dit d'écouter sur le port 8000.
    Dès que le serveur est lancé, le message "Backend listening on port 8000" sera affiché dans la console.

###############################################################################################################

*/


app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});


//EN PLUS pour test


app.get('/api/button', async (req, res) => {

  res.json({newLabel : "coucou"});
});








//const options = {
//  key: fs.readFileSync('/app/certs/key.pem'),
//  cert: fs.readFileSync('/app/certs/cert.pem'),
//};

//https.createServer(options, app).listen(port, () => {
//  console.log('🔐 HTTPS server running on https://localhost:' + port);
//});
