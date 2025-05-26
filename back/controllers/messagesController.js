import { findFriendRelation } from "../models/friendsModel.js";
import { saveMessage, removeMessage, getAllMessages, findMessageById } from "../models/messagesModel.js";
import { errorCodes } from "../utils/errorCodes.js";
import { findUserByUserId } from "../models/userModel.js";
import { encrypt, decrypt } from "../utils/crypto.js";
import xss from "xss";

export async function getMessages(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	const { id, targetId } = req.params;
	try {
		let limit = req.query && req.query.limit ? parseInt(req.query.limit, 10) : 50;
		let offset = req.query && req.query.offset ? parseInt(req.query.offset, 10) : 0;
		if (limit < 0 || limit > 100)
			limit = 50;
		if (offset < 0)
			offset = 0;
		if (isNaN(limit) || isNaN(offset))
			return res.status(errorCodes.INVALID_FIELDS.status).send(errorCodes.INVALID_FIELDS);
		if (limit !== parseInt(limit, 10) || offset !== parseInt(offset, 10))
			return res.status(errorCodes.INVALID_FIELDS.status).send(errorCodes.INVALID_FIELDS);
		if (!id || !targetId)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (!req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		if (id !== '@me' && id != req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		let user;
		if (id === '@me')
			user = req.user;
		else
			user = await findUserByUserId(id);
		if (!user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		const isValidTargetId = await findUserByUserId(targetId);
		if (!isValidTargetId)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		const messages = await getAllMessages(user.user_id, targetId, limit, offset);
		if (!messages || messages.length === 0)
			return res.status(200).send([]);
		const decryptedMessages = messages.map(message => ({
			...message,
			content: decrypt(message.content)
		}));
		return res.status(200).send(decryptedMessages);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function deleteMessage(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	const { messageId } = req.params;
	try {
		if (!messageId)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (!req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		const message = await findMessageById(messageId);
		if (!message)
			return res.status(errorCodes.MESSAGE_NOT_FOUND.status).send(errorCodes.MESSAGE_NOT_FOUND);
		if (message.sender_id !== req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		const data = {
			message_id: messageId,
			sender_id: req.user.user_id,
			timestamp: message.timestamp,
			user: {
				id: req.user.user_id,
				username: req.user.username,
				created_at: req.user.created_at,
				updated_at: req.user.updated_at,
				multiplayer_win: req.user.multiplayer_win,
				multiplayer_loose: req.user.multiplayer_loose,
				practice_win: req.user.practice_win,
				practice_loose: req.user.practice_loose,
				singleplayer_win: req.user.singleplayer_win,
				singleplayer_loose: req.user.singleplayer_loose,
				last_opponent: req.user.last_opponent,
				avatar_url : req.user.avatar_url,
				last_seen: req.user.last_seen
			}
		}
		const socket = global.wsClients.get(Number(message.receiver_id));
		if (socket && socket.readyState === 1)
			socket.send(JSON.stringify({op: "message_delete", data }));
		await removeMessage(messageId);
		return res.status(204).send();
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}

export async function sendMessage(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	const { id, receiverId } = req.params;
	const { message } = req.body;
	try {
		if (!id || !receiverId || !message)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (!req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		if (id !== '@me' && id != req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		let user;
		if (id === '@me')
			user = req.user;
		else
			user = await findUserByUserId(id);
		if (!user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		const isValidReceiverId = await findUserByUserId(receiverId);
		if (!isValidReceiverId)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		const cleanMessage = xss(message.trim());
		if (cleanMessage.length === 0 || cleanMessage.length > 1000)
			return res.status(errorCodes.INVALID_FIELDS.status).send(errorCodes.INVALID_FIELDS);
		const relation = await findFriendRelation(user.user_id, receiverId);
		if (!relation || relation.status !== 'accepted')
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		const { messageId, timestamp } = await saveMessage(user.user_id, receiverId, encrypt(cleanMessage));
		const data = {
			content: cleanMessage,
			message_id: messageId,
			timestamp: timestamp,
			sender_id: user.user_id,
			user: {
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
			}
		};
		const socket = global.wsClients.get(Number(receiverId));
		if (socket && socket.readyState === 1)
			socket.send(JSON.stringify({op: "message_send", data }));
		return res.status(201).send({ success: true, content: cleanMessage, message_id: messageId, timestamp: timestamp, sender_id: user.user_id, user: data.user });
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};