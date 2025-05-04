import { getUsersFromId, patchUserFromId, deleteOwnUser } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export default async function userRoutes(fastify) {
	fastify.get('/api/users/:id', { preHandler: authMiddleware }, getUsersFromId);
	fastify.patch('/api/users/:id', { preHandler: authMiddleware }, patchUserFromId);
	fastify.delete('/api/users/:id', { preHandler: authMiddleware }, deleteOwnUser);
};