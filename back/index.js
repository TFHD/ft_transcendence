import fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import cloudinary from "cloudinary";
import { cloudinaryConfig } from "./config/cloudinary.config.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import websocket from '@fastify/websocket';
import fs from "fs";

// const app = fastify({
// 	https: {
// 		key: fs.readFileSync("./certs/key.pem"),
// 		cert: fs.readFileSync("./certs/cert.pem"),
// 	}
// });

const app = fastify();

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

import { PongWebsocket } from "./pong/Socket.js"

const router = (fastify) => {
	PongWebsocket(fastify);
};

app.register(router, {prefix: '/api'});

app.listen({ port: 8000, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server is running at ${address}`);
});