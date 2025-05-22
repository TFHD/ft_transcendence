import { authSocketMiddleware } from "../middlewares/wsMiddleware.js";
import { updateLastSeen } from "../models/sessionModel.js";

global.wsClients = new Map();

export async function setupGateway(socket, req) {
	const sessionData = await authSocketMiddleware(req);
	if (!sessionData) {
		socket.close(1008, "Unauthorized");
		return ;
	}

	const { user, session } = sessionData;
	socket.isAlive = true;

	global.wsClients.set(user.user_id, socket);
		
	socket.on('pong', () => {
		socket.isAlive = true;
	});

	const interval = setInterval(async () => {
		if (socket.isAlive === false) {
			clearInterval(interval);
			socket.terminate();
			global.wsClients.delete(user.user_id);
			return;
		}
		socket.isAlive = false;
		socket.ping();
		await updateLastSeen(user.user_id);
	}, 30 * 1000);

	socket.on("close", () => {
		clearInterval(interval);
		global.wsClients.delete(user.user_id);
	});
};