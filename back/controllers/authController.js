import bcrypt from 'bcrypt';
import { createUser, findUserByUsernameOrEmail, findUserByGoogleId } from '../models/userModel.js';
import { getSessionByUserId, getSessionByToken, createSession, updateLastSeen, deleteSession } from '../models/sessionModel.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { cookieOpts, isValidEmail, isValidPassword, isValidUsername } from '../utils/validators.js';
import { errorCodes } from '../utils/errorCodes.js';
import { OAuth2Client } from 'google-auth-library';
import { googleClientId } from '../config/google.config.js';

const client = new OAuth2Client(googleClientId);

export async function returnCookie(user, res) {
	const existingSession = await getSessionByUserId(user.user_id);

	if (existingSession) {
		const isValid = verifyToken(existingSession.token);
		if (isValid) {
			await updateLastSeen(user.user_id);
			return res.setCookie('token', existingSession.token, cookieOpts()).status(200).send({success : true});
		}
		await deleteSession(existingSession.token);
	}
	const token = generateToken({ id: user.user_id });
	await createSession(user.user_id, token);
	return res.setCookie('token', token, cookieOpts()).status(200).send({success : true});
}

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
	const code2fa = req.headers['x-2fa-token'];

	if (!email && !username || !password)
		return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);

	try {
		const user = await findUserByUsernameOrEmail(username, email);

		if (!user)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);
		if (!user.password)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);

		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);
		if (user.twofa_enabled) {
			if (!code2fa)
				return res.status(errorCodes.TWOFA_REQUIRED.status).send(errorCodes.TWOFA_REQUIRED);
			const verified = speakeasy.totp.verify({
				secret: user.twofa_secret,
				encoding: 'base32',
				token: code2fa,
				window: 1
			});
			if (!verified)
				return res.status(errorCodes.INVALID_TWOFA_TOKEN.status).send(errorCodes.INVALID_TWOFA_TOKEN);
		}
		return returnCookie(user, res);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}

export async function logoutUser(req, res) {
	const authHeader = req.headers['authorization'];
	let token;

	if (authHeader?.startsWith('Bearer '))
		token = authHeader.split(' ')[1];
	if (!token && req.cookies?.token)
		token = req.cookies.token;
	if (!token)
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	try {
		const session = await getSessionByToken(token);
		if (!session || !verifyToken(token))
			return res.clearCookie('token', { path: '/' }).status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		await deleteSession(token);
		return res.clearCookie('token', { path: '/' }).status(200).send({ success: true });
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function googleLoginUser(req, res) {
	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	
	const { id_token } = req.body;
	if (!id_token)
		return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
	try {
		let ticket;
		try {
			ticket = await client.verifyIdToken({
				idToken: id_token,
				audience: googleClientId 
			});
		} catch (error) {
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		};
		const payload = ticket.getPayload();
		const { email, name, sub } = payload;
		let user = await findUserByGoogleId(sub);
		let username = (name || email?.split('@')[0] || '').trim();

		if (!username)
			username = generateRandomUsername();
		if (!username || username.trim() === '')
			return res.status(errorCodes.USERNAME_INVALID.status).send(errorCodes.USERNAME_INVALID);
		if (!user) {
			const existingUser = await findUserByUsernameOrEmail(username, email);
			if (existingUser)
				return await returnCookie(existingUser, res);

			user = await createUser(
				email,
				username,
				null,
				sub
			);
			const token = generateToken({ id: user.id });

			await createSession(user.id, token);
			return res.setCookie('token', token, cookieOpts()).status(200).send({ success: true });
		};
		return returnCookie(user, res);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};