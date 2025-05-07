import { deleteUser, findUserByEmail, findUserByUsername, updateUser } from "../models/userModel.js";
import { errorCodes } from "../utils/errorCodes.js";
import { deleteSession } from "../models/sessionModel.js";
import { isValidUsername, isValidEmail, isValidPassword } from "../utils/validators.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import cloudinary from "cloudinary";
import { randomUUID } from "crypto";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function getUsersFromId(req, res) {
	if (!req.params)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	const { id } = req.params;

	try {
		if (!id)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (id === '@me' || id == req.user.user_id) {
			if (!req.user.user_id)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			const user = req.user;
			if (!user)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			const sesssion = req.session;
			if (!sesssion)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			return res.status(200).send({
				id: user.user_id,
				username: user.username,
				email: user.email,
				created_at: user.created_at,
				updated_at: user.updated_at,
				twofa_enabled: user.twofa_enabled,
				last_seen: sesssion.last_seen
			});
		} else {
			const user = req.user;
			if (!user)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			const sesssion = req.session
			if (!sesssion)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			return res.status(200).send({
				id: user.user_id,
				username: user.username,
				email: user.email,
				created_at: user.created_at,
				updated_at: user.updated_at,
				twofa_enabled: user.twofa_enabled,
				last_seen: sesssion.last_seen
			});
		};
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function patchUserFromId(req, res) {
	if (!req.params)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	let { id } = req.params;
	const { username, email, password, new_password } = req.body;

	const file = req.body.file;
	if (!id)
		return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
	
	if (id != '@me' && id != req.user.user_id)
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);

	if (id == '@me')
		id = req.user.user_id;
	const user = req.user;

	if (!user)
		return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
	if (user.password) {
		if (!password)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
	
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);
	}
	const updates = {};

	try {
		if (username) {
			if (!isValidUsername(username))
				return res.status(errorCodes.USERNAME_INVALID.status).send(errorCodes.USERNAME_INVALID);

			const existing = await findUserByUsername(username);
			if (existing && existing.user_id !== req.user.user_id)
				return res.status(errorCodes.USER_ALREADY_EXISTS.status).send(errorCodes.USER_ALREADY_EXISTS);

			updates.username = username;
		}
		if (email) {
			if (!isValidEmail(email))
				return res.status(errorCodes.EMAIL_INVALID.status).send(errorCodes.EMAIL_INVALID);

			const existing = await findUserByEmail(email);
			if (existing && existing.user_id !== req.user.user_id)
				return res.status(errorCodes.USER_ALREADY_EXISTS.status).send(errorCodes.USER_ALREADY_EXISTS);

			updates.email = email;
		}
		if (new_password) {
			if (!isValidPassword(new_password))
				return res.status(errorCodes.PASSWORD_INVALID.status).send(errorCodes.PASSWORD_INVALID);

			updates.password = await bcrypt.hash(new_password, 10);
		}
		if (file) {
			const fileBuffer = await file.toBuffer();
			if (!file.mimetype.startsWith('image/'))
				return res.status(errorCodes.INVALID_FILE_TYPE.status).send(errorCodes.INVALID_FILE_TYPE);
			const uploadDir = path.join(__dirname, '../uploads');
			if (!fs.existsSync(uploadDir))
				fs.mkdirSync(uploadDir, { recursive: true });
			const tmpPath = path.join(uploadDir, `${randomUUID()}.tmp`);
			fs.writeFileSync(tmpPath, fileBuffer);

			const uploadRes = await cloudinary.v2.uploader.upload(tmpPath, {
				folder: 'avatars',
				public_id: `avatar_${user.user_id}`,
				overwrite: true
			});
			const avatar_url = uploadRes.secure_url;
			updates.avatar_url = avatar_url;
			fs.unlinkSync(tmpPath);
		}
		if (Object.keys(updates).length === 0)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		await updateUser(req.user.user_id, updates);
		return res.status(204).send();
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function deleteOwnUser(req, res) {
	if (!req.params)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	let { id } = req.params;

	if (!id)
		return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
	if (id != '@me' && id != req.user.user_id)
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	if (id == '@me')
		id = req.user.user_id;
	const session = req.session;
	if (!session)
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	deleteUser(id);
	deleteSession(session.token);
	res.status(204).send();
}
