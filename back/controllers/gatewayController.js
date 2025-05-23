import { authSocketMiddleware } from "../middlewares/wsMiddleware.js";
import { updateLastSeen } from "../models/sessionModel.js";
import { findFriendByRelationType }	from "../models/friendsModel.js";

async function notifyUserStatus(userId, status) {
	try {
		const paddedLastSeen = new Date(Date.now() - 30 * 1000);
		await updateLastSeen(userId, paddedLastSeen.toISOString());
		const friends = await findFriendByRelationType(userId, "accepted");
		for (const friend of friends) {
			const socket = global.wsClients.get(friend.user1_id === userId ? friend.user2_id : friend.user1_id);
			if (socket && socket.readyState === 1) {
				socket.send(JSON.stringify({
					type: `user_${status}`,
					data: {
						user: {
							user_id: userId,
							last_seen: paddedLastSeen.toISOString(),
						}
					}
				}));
			}
		}
	} catch (error) { }
}

export async function setupGateway(socket, req) {
	const sessionData = await authSocketMiddleware(req);
	if (!sessionData) {
		socket.close(1008, "Unauthorized");
		return ;
	}

	const { user, session } = sessionData;
	socket.isAlive = true;

	global.wsClients.set(user.user_id, socket);
	await notifyUserStatus(user.user_id, "online");

	socket.on('pong', () => {
		socket.isAlive = true;
	});

	const interval = setInterval(async () => {
		if (socket.isAlive === false) {
			clearInterval(interval);
			socket.terminate();
			global.wsClients.delete(user.user_id);
			await notifyUserStatus(user.user_id, "offline");
			return;
		}
		socket.isAlive = false;
		socket.ping();
		await updateLastSeen(user.user_id);
	}, 30 * 1000);

	socket.on("close", async () => {
		clearInterval(interval);
		global.wsClients.delete(user.user_id);
		await notifyUserStatus(user.user_id, "offline");
	});
};