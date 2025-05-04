import { registerUser, loginUser, logoutUser } from "../controllers/authController.js";

export default async function authRoutes(fastify) {
	fastify.post('/api/auth/register', registerUser);
	fastify.post('/api/auth/login', loginUser);
	fastify.post('/api/auth/logout', logoutUser);
}