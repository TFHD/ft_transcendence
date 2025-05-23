import { sendMessage, deleteMessage, getMessages } from '../controllers/messagesController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

export async function messagesRoutes(fastify) {
	fastify.post('/api/users/:id/messages/:receiverId', { preHandler: authMiddleware }, sendMessage);
	fastify.delete('/api/messages/:messageId', { preHandler: authMiddleware }, deleteMessage);
	fastify.get('/api/users/:id/messages/:targetId', { preHandler: authMiddleware }, getMessages);
}