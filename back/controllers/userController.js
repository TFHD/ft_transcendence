import { deleteUser, findUserByEmail, updateUser, findUsersByPartialUsername, findUserByUserId } from "../models/userModel.js";
import { errorCodes } from "../utils/errorCodes.js";
import { deleteSession } from "../models/sessionModel.js";
import { getHistoryByUsername, deleteHistory } from "../models/historyModel.js";
import { isValidEmail, isValidPassword } from "../utils/validators.js";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import cloudinary from "cloudinary";
import { randomUUID } from "crypto";
import { deleteAllFriendsByUserId, getAllFriendsById } from "../models/friendsModel.js";
import { deleteMessagesByUserId, getAllMessages } from "../models/messagesModel.js";
import { encrypt, decrypt, hashEmail } from "../utils/crypto.js";
import { exportDataObject } from "../utils/exportData.js";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export async function getHistoryFromId(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
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
			const histories = await getHistoryByUsername(user.username);
			return res.status(200).send({ history: histories });
		} else {
			const user = req.user;
			if (!user)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			const sesssion = req.session
			if (!sesssion)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			const histories = await getHistoryByUsername(user.username);
			return res.status(200).send({ history: histories });
		};
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function RGPDDownload(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
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
			const session = req.session;
			if (!session)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			const timestamp = new Date().toISOString().split('T')[0];
			const filename = `rgpd-export-${user.username}-${timestamp}.json`;
			const data = await exportDataObject(user, session);
			return res.status(200).send({
				filename: filename,
				data: data
			});
		} else
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}

export async function getUsersByUsername(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
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
				users : [{
					user_id: user.user_id,
					username: user.username,
					multiplayer_win: user.multiplayer_win,
					multiplayer_loose: user.multiplayer_loose,
					last_opponent: user.last_opponent,
					avatar_url : user.avatar_url,
				}]
			});
		} else {
			const users = await findUsersByPartialUsername(id);
			if (!users)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			const sesssion = req.session
			if (!sesssion)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			return res.status(200).send({users : users});
		};
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function getUserFromId(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
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
			const session = req.session;
			if (!session)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			return res.status(200).send({
				id: user.user_id,
				username: user.username,
				email: decrypt(user.email),
				created_at: user.created_at,
				updated_at: user.updated_at,
				multiplayer_win: user.multiplayer_win,
				multiplayer_loose: user.multiplayer_loose,
				practice_win: user.practice_win,
				practice_loose: user.practice_loose,
				singleplayer_win: user.singleplayer_win,
				singleplayer_loose: user.singleplayer_loose,
				last_opponent: user.last_opponent,
				twofa_enabled: user.twofa_enabled,
				avatar_url : user.avatar_url,
				last_seen: user.last_seen
			});
		} else {
			const user = await findUserByUserId(id);
			if (!user)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			return res.status(200).send({
				id: user.user_id,
				username: user.username,
				created_at: user.created_at,
				updated_at: user.updated_at,
				multiplayer_win: user.multiplayer_win,
				multiplayer_loose: user.multiplayer_loose,
				practice_win: user.practice_win,
				practice_loose: user.practice_loose,
				singleplayer_win: user.singleplayer_win,
				singleplayer_loose: user.singleplayer_loose,
				last_opponent: user.last_opponent,
				avatar_url : user.avatar_url,
				last_seen: user.last_seen
			});
		};
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};


export async function patchUserFromId(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	let { id } = req.params;
	const { email, password, new_password } = req.body;

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
	if (user.password && !file) {
		if (!password)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		const validPassword = await bcrypt.compare(password, user.password);
		if (!validPassword)
			return res.status(errorCodes.INVALID_CREDENTIALS.status).send(errorCodes.INVALID_CREDENTIALS);
	}
	const updates = {};

	try {
		if (email && !user.google_id) {
			if (!isValidEmail(email))
				return res.status(errorCodes.EMAIL_INVALID.status).send(errorCodes.EMAIL_INVALID);
			const existing = await findUserByEmail(hashEmail(email));
			if (existing)
				return res.status(errorCodes.USER_ALREADY_EXISTS.status).send(errorCodes.USER_ALREADY_EXISTS);
			updates.email = encrypt(email);
			updates.email_hash = hashEmail(email);
		}
		if (new_password && !user.google_id) {
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
		if (Object.keys(updates).length === 0 && !user.google_id)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		else if (Object.keys(updates).length === 0 && user.google_id)
			return res.status(errorCodes.GOOGLE_USER.status).send(errorCodes.GOOGLE_USER);
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
	try {
		await deleteUser(id);
		await deleteSession(session.token);
		await cloudinary.v2.uploader.destroy(`avatars/avatar_${id}`, { resource_type: 'image' });
		await deleteMessagesByUserId(id);
		await deleteHistory(id);
		await deleteAllFriendsByUserId(id);
		res.status(204).send();
	} catch (error) {
		res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}
