import { verifyToken } from "../utils/jwt.js";
import { getSessionByToken, updateLastSeen } from "../models/sessionModel.js";
import { findUserByUserId } from "../models/userModel.js";

export async function authSocketMiddleware(req) {
	try {
		const authHeader = req.headers['authorization'];
		const cookieHeader = req.headers?.cookie;

		let token;
		if (authHeader && authHeader.startsWith('Bearer '))
			token = authHeader.split(' ')[1];
		else if (cookieHeader) {
			const match = cookieHeader.match(/token=([^;]+)/);
			if (match)
				token = match[1];
		}
		if (!token)
			return null;
		const isValid = verifyToken(token);
		if (!isValid)
			return null;
		const session = await getSessionByToken(token);
		if (!session)
			return null;
		const user = await findUserByUserId(session.user_id);
		if (!user)
			return null;
		await updateLastSeen(user.user_id);
		return { user, session };
	} catch(error) {
		return null;
	};
};