import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from '@fastify/websocket';
import cloudinary from "cloudinary";
import fs from "fs";

import { PongWebsocket } from "./pong/Socket.js"
import { cloudinaryConfig } from "./config/cloudinary.config.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import twofaRoutes from "./routes/2faRoutes.js";

const app = fastify({
	https: {
		key: fs.readFileSync("/certs/key.pem"),
		cert: fs.readFileSync("/certs/cert.pem"),
	}
});

app.register(cors);
app.register(websocket);
app.register(multipart, {
	attachFieldsToBody: true,
	limits: {
		fileSize: 3 * 1024 * 1024
	}
});

cloudinary.config(cloudinaryConfig);

await app.register(authRoutes);
await app.register(userRoutes);
await app.register(twofaRoutes);

const router = (fastify) => {
	PongWebsocket(fastify);
};

app.register(router, { prefix: '/api' });

app.listen({ port: 8000, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server is running at ${address}`);
});
