
import { soloPong } from "./SoloPong.js"

class	Room
{
	constructor(player)
	{
		this.users = new Set();
		this.users.add(player);
	}

	addPlayer(player) {
		this.users.add(player);
	}
}

const	userSockets = new Map();
//Saves all sockets to check if they already have their websocket setup

const	roomUsers = new Map();
//Stores based on roomID (key) and Room (value) wich holds a set of users

export function	duoPong(connection, req)
{
	const socket = connection;

	if (!userSockets.get(socket))
	{
		console.log('Adding new user to set');
		userSockets.set(socket, null);
	}

	socket.on('message', message =>
	{
		let	packet = null
		try {
			packet = JSON.parse(message);
		}
		catch (e) {
			console.log(e);
		}

		if (packet.roomID)
		{
			console.log(`Trying to connect to room: ${packet.roomID}`);
			if (roomUsers.get(packet.roomID))
			{
				console.log(`Joining room: ${packet.roomID}`);
				roomUsers.get(packet.roomID).addPlayer(socket);
			}
			else
			{
				roomUsers.set(packet.roomID, new Room(socket));
				userSockets.set(socket, packet.roomID);
				console.log(`Creating room: ${packet.roomID}`);
			}
		}
	})

	socket.on('close', () =>
	{
		userSockets.delete(socket);
		console.log('goodbye client');
	})
}

export const PongWebsocket = (fastify) =>
{
	fastify.get('/pong/solo', {websocket: true}, soloPong);
	fastify.get('/pong/duo', {websocket: true}, duoPong);
}
