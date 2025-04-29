//import fs from 'fs';
//import https from 'https';
import Fastify from 'fastify';
import bcrypt from 'bcrypt';
import fastifyCors from '@fastify/cors';
import sequelize from './configs/database.config.js'; 
import User from './models/User.js';
import Websocket from '@fastify/websocket';

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

############################################# On initialise le serveur Fastify ###########################################

    Initialisation du serveur Fastify
    Définition du port à 8000
    Enregistrement du middleware CORS pour permettre les requêtes cross-origin

##########################################################################################################################

*/

const app = Fastify();
const port = 8000;
app.register(fastifyCors);

/*

############################################### Requete POST pour la DB ##############################################

    Cette route permet de créer un utilisateur dans la base de données en envoyant une requête HTTP POST à /api/users.

######################################################################################################################

*/


app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).send({ error: 'Tous les champs sont requis (username, email, password)' });
    }

    try {

      await sequelize.sync();
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        username : username,
        email : email,
        password : hashedPassword
      });

      res.status(201).send(newUser);

    } catch (error) { res.status(500).send({ error: 'Erreur interne du serveur' }); }
});


app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      return res.status(400).send({ error: 'Email et mot de passe sont requis.' });
  }

  try {
      const user = await User.findOne({ where: { email } });

      if (!user) {
          return res.status(401).send({ error: 'Utilisateur non trouvé.' });
      }
      const isPasswordCorrect = await bcrypt.compare(password, user.password);

      if (!isPasswordCorrect) {
          return res.status(401).send({ error: 'Mot de passe incorrect.' });
      }

      res.status(200).send({ message: 'Connexion réussie.' });
  } catch (error) {
      res.status(500).send({ error: 'Erreur interne du serveur' });
  }
});

/*

############################################ Requete GET pour la DB ############################################

    Cette route permet de récupérer tous les utilisateurs stockés dans la base de données.

#################################################################################################################

*/


app.get('/api/users', async (req, res) => {

  try {
    
    const users = await User.findAll();
    res.status(200).send(users);

  } catch (error) { res.status(500).send({ error: 'Erreur lors de la récupération des utilisateurs' }); }
});



/*

############################################ Lancement du serveur ############################################

    Cette fonction démarre le serveur Fastify et le fait écouter sur le port 8000 sur toutes les
    interfaces réseau (0.0.0.0). Si une erreur survient lors du démarrage,
    elle est affichée et le processus s'arrête avec un code d'erreur.

###############################################################################################################

*/


//Dans l'idee il faudras une class Users et Games, Users recupere les infos depuis les sockets
//qui se connectent et de la db ?? Surement jsp
//La class Games contient 2 users et pos de la balle des 2 paddles
//Voila

app.get('/api/pong/test', {websocket: true}, (connection, req) => {

	console.log('Reiceived socket connection');
	
	// setTimeout(() => {
	// 	try {
	// 		// socket.write(JSON.stringify({ msg: 'cacaboudin' }));
	// 	} catch (err) {
	// 		console.error('💥 Send error:', err);
	// 	}
	// }, 100);

	socket.on('message', (message) => {
		console.log('received a message ig');
	})

	socket.on('close', () => {
		console.log('goodbye client (he disconnected)');
	})

	socket.on('error', (err) => {
		console.error('WebSocket error:', err);
	})
});

const start = async () =>
{
	try
	{
		await app.listen({port : port, host: '0.0.0.0' });
		console.log('Backend listening on port 8000');
	}
	catch (err)
	{
    	console.error('Erreur de démarrage du serveur Fastify:', err);
    	process.exit(1);
	}
};

start();
//EN PLUS pour test

app.get('/api/button', async (req, res) => {

  res.send({newLabel : "coucou"});
});

//const options = {
//  key: fs.readFileSync('/app/certs/key.pem'),
//  cert: fs.readFileSync('/app/certs/cert.pem'),
//};

//https.createServer(options, app).listen(port, () => {
//  console.log('🔐 HTTPS server running on https://localhost:' + port);
//});
