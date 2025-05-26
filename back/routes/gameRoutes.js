import { getGameById, getMatchsById } from '../controllers/gameController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export default async function gameRoutes(fastify) {
    fastify.get('/api/tournament/:id', { preHandler: authMiddleware }, getMatchsById);
    fastify.get('/api/games/:id', { preHandler: authMiddleware }, getGameById);
};