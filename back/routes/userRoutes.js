import { getUserFromId, getHistoryFromId, patchUserFromId, deleteOwnUser, getUsersByUsername } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { twoFAMiddleware } from '../middlewares/2faMiddleware.js';

export default async function userRoutes(fastify) {

	fastify.get('/api/tounament/:id', { preHandler: authMiddleware }, getUserFromId);

	fastify.get('/api/search/:id', { preHandler: authMiddleware }, getUsersByUsername);

	fastify.get('/api/history/:id', { preHandler: authMiddleware }, getHistoryFromId);

	fastify.get('/api/users/:id', { preHandler: authMiddleware }, getUserFromId);
	fastify.patch('/api/users/:id', { preHandler: [authMiddleware, twoFAMiddleware] }, patchUserFromId);
	fastify.delete('/api/users/:id', { preHandler: [authMiddleware, twoFAMiddleware] }, deleteOwnUser);
};