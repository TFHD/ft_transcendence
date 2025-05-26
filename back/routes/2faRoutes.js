import { delete2FA, setup2FA, verify2FA } from "../controllers/2faController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

export default async function twofaRoutes(fastify) {
	fastify.get('/api/auth/2fa/setup', { preHandler: authMiddleware }, setup2FA);
	fastify.post('/api/auth/2fa/verify', { preHandler: authMiddleware }, verify2FA);
	fastify.post('/api/auth/2fa/disable', { preHandler: authMiddleware }, delete2FA);
};