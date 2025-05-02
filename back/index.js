//import fs from 'fs';
//import https from 'https';
import Fastify from 'fastify';
import bcrypt from 'bcrypt';
import fastifyCors from '@fastify/cors';
import sequelize from './configs/database.config.js'; 
import User from './models/User.js';
import fastifyWebsocket from '@fastify/websocket';

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
app.register(fastifyWebsocket);

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

class	PongPlayer {
	constructor(socket) {
		this.socket = socket;
	}
}

class	PongPlayers {
	constructor() {
		this.playerslist = [];
	}

	addNewPlayer(socket) {
		let p = new PongPlayer(socket);
		this.playerslist.push(p);
		return p;
	}
}

let	players = new PongPlayers();

//Fonction pour sleep en ms comme ca jpeux envoyer les infos 60 fois par secondes
const mssleep = ms => new Promise(r => setTimeout(r, ms));

class	PongGameClass
{
	// constructor(player1, player2)
	constructor(player1)
	{
		this.player1Y = 0;
		this.player1UpInput = false;
		this.player1DownInput = false;
		
		this.player2Y = 0;
		this.player2UpInput = false;
		this.player2DownInput = false;
		
		this.ballX = 0;
		this.ballY = 0;
	}
}

const PongMaxX = 10;
const PongMaxY = 10;
const PongMinX = 0;
const PongMinY = 0;

const ballX = 0;
const ballY = 0;

let game = null;

const movePaddle = (direction, bool) =>
{
	if (bool)
	{
    	let newTarget = game.player1Y + 1 * direction;
    	if (newTarget >= -8 && newTarget <= 8)
    		game.player1Y = newTarget;
	}
	else
	{
    	let newTarget = game.player2Y + 1 * direction;
    	if (newTarget >= -8 && newTarget <= 8)
			game.player2Y = newTarget;
	}
};

const smoothMovePaddles = () =>
{
	if (game.player2UpInput)
		movePaddle(1, 0);
	if (game.player2DownInput)
		movePaddle(-1, 0);
	if (game.player1UpInput)
		movePaddle(1, 1);
	if (game.player1DownInput)
		movePaddle(-1, 1);
};

//Fonction qui dans l'idee tournera pour chaque game dcp on lui enverras une class game qui contient les 2 joueurs et toutes les pos necessaires.
const	PongGame = async (player) =>
{
	game = new PongGameClass(player);
	while (player.socket.readyState)
	{
		smoothMovePaddles();
		player.socket.send(JSON.stringify({ballX: game.ballX, ballY: game.ballY, player1Y: game.player1Y, player2Y: game.player2Y}));
		// ^ Send all infos of the frame
		await mssleep(16);
	}
}

const router = (fastify) => {
	//Gere la connection du websocket
	fastify.get('/pong/test', {websocket: true}, (connection, req) =>
	{
		const socket = connection;
	
		players.addNewPlayer(socket);
		console.log('Reiceived socket connection');
		PongGame(players.playerslist[0]);
	});

	//Gere la reception des inputs joueurs
	fastify.post('/pong/input', async (req, res) =>
	{
		const packet = req.body;
		if (packet.key == 'w')
			game.player1UpInput = packet.state;
		if (packet.key == 's')
			game.player1DownInput = packet.state;
		if (packet.key == 'ArrowUp')
			game.player2UpInput = packet.state;
		if (packet.key == 'ArrowDown')
			game.player2DownInput = packet.state;
		console.log(`Touche pressée reçue par HTTP: ${packet.key} and it is ${packet.state}`);
		// res.send({ message: `Touche ${packet.key} bien reçue`});
	});

	//Reset la position des coos envoyees par le serveur (c'est du debug)
	fastify.post('/pong/resetball', async (req, res) =>
	{
		console.log('resetting ball pos');
	});
}

//register le router a /api dcp tout ce qui commence par /api vas passer par le routeur pour voir si il a le reste qu'il faut
app.register(router, {prefix: '/api'});

console.log(app.printRoutes());

const start = async () => {
  try {
    await app.listen({port : port, host: '0.0.0.0' });
    console.log('Backend listening on port 8000');
  } catch (err) {
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
