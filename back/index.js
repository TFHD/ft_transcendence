import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from '@fastify/websocket';
import cookie from "@fastify/cookie";
import cloudinary from "cloudinary";
import fs from "fs";
import dotenv from 'dotenv';

import { PongWebsocket } from "./pong/Socket.js"
import { cloudinaryConfig } from "./config/cloudinary.config.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import twofaRoutes from "./routes/2faRoutes.js";
import gameRoutes from './routes/gameRoutes.js';
import { cookieSecret } from "./config/cookie.config.js";

dotenv.config();

const PORT = process.env.PORT;
const ADDRESS = process.env.ADDRESS;

const app = fastify({
	https: {
		key: fs.readFileSync("/certs/key.pem"),
		cert: fs.readFileSync("/certs/cert.pem"),
	}
});

app.register(cookie, {
	secret: cookieSecret
});
app.register(cors, {
	origin: (origin, callback) => {
		const clientIp = origin ? new URL(origin).hostname : null;

		const allowedOrigins = ['*'];
		callback(null, true);
	},
	credentials: true,
	methods: ['GET', 'POST', 'PATCH', 'DELETE']
});

// app.register(cors, {
// 	origin: (origin, callback) => {
// 		const clientIp = origin ? new URL(origin).hostname : null;

// 		const allowedOrigins = [
// 			'https://localhost:3000',
// 			`https://${clientIp}:3000`
// 		];
// 		if (allowedOrigins.includes(origin))
// 			callback(null, true);
// 		else
// 			callback(new Error("Origin not allowed"), false);
// 	},
// 	credentials: true,
// 	methods: ['GET', 'POST', 'PATCH', 'DELETE']
// });



app.register(websocket);
app.register(multipart, {
	attachFieldsToBody: true,
	limits: {
		fileSize: 3 * 1024 * 1024
	}
});

cloudinary.config(cloudinaryConfig);

await app.register(authRoutes);
await app.register(gameRoutes);
await app.register(userRoutes);
await app.register(twofaRoutes);

const router = (fastify) => {
	PongWebsocket(fastify);
};

app.register(router, { prefix: '/api' });

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server is running at https://${ADDRESS}:${PORT}`);
});
