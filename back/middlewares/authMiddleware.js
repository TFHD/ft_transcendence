import { errorCodes } from "../utils/errorCodes.js";
import { getSessionByToken, updateLastSeen } from "../models/sessionModel.js";
import { verifyToken } from "../utils/jwt.js";

export async function authMiddleware(req, res, next) {
	const authHeader = req.headers['authorization'];

	if (!authHeader || !authHeader.startsWith('Bearer '))
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	
	const token = authHeader.split(' ')[1];
	if (!token)
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	const session = await getSessionByToken(token);
	if (!session || verifyToken(token) === false)
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	await updateLastSeen(token);
	req.user_id = session.user_id;
	next();
}
