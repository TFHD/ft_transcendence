import { getAllFriends, manageFriendshipPut, manageFriendshipDelete } from "../controllers/friendsController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export async function friendsRoutes(fastify) {
	fastify.get('/api/users/:id/friends', { preHandler: authMiddleware}, getAllFriends);
	fastify.put('/api/users/:id/friends/:friendId', { preHandler: authMiddleware}, manageFriendshipPut);
	fastify.delete('/api/users/:id/friends/:friendId', { preHandler: authMiddleware}, manageFriendshipDelete);
};