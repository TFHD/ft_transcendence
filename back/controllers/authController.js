import bcrypt from 'bcrypt';
import { createUser, findUserByUsernameOrEmail } from '../models/userModel.js';
import { getSessionByUserId, getSessionByToken, createSession, updateLastSeen, deleteSession } from '../models/sessionModel.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { isValidEmail, isValidPassword, isValidUsername } from '../utils/validators.js';
import { errorCodes } from '../utils/errorCodes.js';

export async function registerUser(req, res) {
	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);

	const { username, password, email } = req.body;

	if (!username || !password || !email)
		return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
	if (!isValidEmail(email))
		return res.status(errorCodes.EMAIL_INVALID.status).send(errorCodes.EMAIL_INVALID);
	if (!isValidUsername(username))
		return res.status(errorCodes.USERNAME_INVALID.status).send(errorCodes.USERNAME_INVALID);
	if (!isValidPassword(password))
		return res.status(errorCodes.PASSWORD_INVALID.status).send(errorCodes.PASSWORD_INVALID);

	try {
		const existingUser = await findUserByUsernameOrEmail(username, email);

		if (existingUser)
			return res.status(errorCodes.USER_ALREADY_EXISTS.status).send(errorCodes.USER_ALREADY_EXISTS);

		const hashedPassword = await bcrypt.hash(password, 10);
		const user = await createUser(email, username, hashedPassword);

		return res.status(201).send({ user });
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}

export async function loginUser(req, res) {
	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);

	const { email, username, password } = req.body;

	if (!email && !username || !password)
		return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);

	try {
		const user = await findUserByUsernameOrEmail(username, email);

		if (!user)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);

		const validPassword = await bcrypt.compare(password, user.password);

		if (!validPassword)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);

		const existingSession = await getSessionByUserId(user.user_id);

		if (existingSession) {
			const isValid = verifyToken(existingSession.token);

			if (isValid) {
				await updateLastSeen(existingSession.token);
				return res.setCookie('token', existingSession.token, {
					httpOnly: true,
					secure: true,
					sameSite: 'Lax',
					path: '/',
					maxAge: 60 * 60,
				}).status(200).send({ success: true });
			} else {
				await deleteSession(existingSession.token);
			}
		}

		const token = generateToken({ id: user.user_id });

		await createSession(user.user_id, token);

		return res.setCookie('token', token, {
			httpOnly: true,
			secure: true,
			sameSite: 'Lax',
			path: '/',
			maxAge: 60 * 60,
		}).status(200).send({ success: true });
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}

export async function logoutUser(req, res) {
	const auth = req.headers['authorization'];

	if (!auth?.startsWith('Bearer '))
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	const token = auth.split(' ')[1];
	try {
		const session = await getSessionByToken(token);
		if (!session || verifyToken(token) === false)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		await deleteSession(token);
		return res.clearCookie('token', { path: '/' }).status(200).send({ success: true });
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}