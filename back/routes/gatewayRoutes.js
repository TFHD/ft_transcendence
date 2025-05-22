import { setupGateway } from "../controllers/gatewayController.js";

export function gatewayRoutes(fastify) {
	fastify.get("/gateway", { websocket: true }, setupGateway);
}