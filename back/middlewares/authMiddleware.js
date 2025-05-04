import { errorCodes } from "../utils/errorCodes.js";
import { getSessionByToken, updateLastSeen } from "../models/sessionModel.js";
import { verifyToken } from "../utils/jwt.js";
import { findUserByUserId } from "../models/userModel.js";

export async function authMiddleware(req, res) {
	const authHeader = req.headers['authorization'];

	try {
		if (!authHeader || !authHeader.startsWith('Bearer '))
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	
		const token = authHeader.split(' ')[1];
		if (!token)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		const session = await getSessionByToken(token);
		if (!session || verifyToken(token) === false)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		await updateLastSeen(token);
		const user = await findUserByUserId(session.user_id);
		req.session = session;
		req.user = user;
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}
