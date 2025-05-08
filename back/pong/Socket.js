
import { soloPong } from "./SoloPong.js"

import { duoPong } from "./DuoPong.js"

import { practicePong } from "./PracticePong.js"

export const PongWebsocket = (fastify) =>
{
	fastify.get('/pong/solo', {websocket: true}, soloPong);
	fastify.get('/pong/duo', {websocket: true}, duoPong);
	fastify.get('/pong/practice', {websocket: true}, practicePong);
}
