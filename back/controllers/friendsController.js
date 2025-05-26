import { getAllFriendsById, findFriendRelation, updateFriendRelation, createFriendRelation, deleteFriendRelation } from "../models/friendsModel.js";
import { findUserByUserId } from "../models/userModel.js";
import { errorCodes } from "../utils/errorCodes.js";

async function addFriend(req, res, friendId, friendInfo) {
	const relation = await findFriendRelation(req.user.user_id, friendId);
	if (relation) {
		if (relation.status === 'blocked')
			return res.status(errorCodes.FRIENDS_BLOCKED.status).send(errorCodes.FRIENDS_BLOCKED);
		else if (relation.status === 'accepted')
			return res.status(errorCodes.FRIENDS_ALREADY_ADDED.status).send(errorCodes.FRIENDS_ALREADY_ADDED);
		else if (relation.status === 'pending') {
			if (relation.initiator_id === req.user.user_id)
				return res.status(errorCodes.FRIENDS_PENDING.status).send(errorCodes.FRIENDS_PENDING);
			await updateFriendRelation(req.user.user_id, friendId, {
				status: 'accepted',
				initiator_id: req.user.user_id
			});
			const otherUser = await findUserByUserId(friendId);
			const otherUserInfo = {
				id: otherUser.user_id,
				username: otherUser.username,
				created_at: otherUser.created_at,
				updated_at: otherUser.updated_at,
				multiplayer_win: otherUser.multiplayer_win,
				multiplayer_loose: otherUser.multiplayer_loose,
				practice_win: otherUser.practice_win,
				practice_loose: otherUser.practice_loose,
				singleplayer_win: otherUser.singleplayer_win,
				singleplayer_loose: otherUser.singleplayer_loose,
				last_opponent: otherUser.last_opponent,
				avatar_url: otherUser.avatar_url,
				last_seen: otherUser.last_seen
			};
			const dataForOther = {
				type: 1,
				user: friendInfo,
				initiator_id: req.user.user_id
			};
			const dataForMe = {
				type: 1,
				user: otherUserInfo,
				initiator_id: req.user.user_id
			};
			const socket = global.wsClients.get(Number(friendId));
			const socketMe = global.wsClients.get(Number(req.user.user_id));
			if (socket && socket.readyState === 1)
				socket.send(JSON.stringify({op: "friends_add", data: dataForOther, initiator_id: req.user.user_id}));
			if (socketMe && socketMe.readyState === 1)
				socketMe.send(JSON.stringify({op: "friends_add", data: dataForMe, initiator_id: req.user.user_id}));
			return res.status(204).send();
		};
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	};
	await createFriendRelation(req.user.user_id, friendId, {
		status: 'pending',
		initiator_id: req.user.user_id
	});
	const dataForOther = {
		type: 0,
		user: friendInfo,
		initiator_id: req.user.user_id
	};
	const socket = global.wsClients.get(Number(friendId));
	if (socket && socket.readyState === 1)
		socket.send(JSON.stringify({op: "friends_request", data: dataForOther, initiator_id: req.user.user_id}));
	return res.status(201).send();
}

async function blockFriend(req, res, friendId, friendInfo) {
	const relation = await findFriendRelation(req.user.user_id, friendId);
	if (relation) {
		if (relation.status === 'blocked')
			return res.status(errorCodes.FRIENDS_BLOCKED.status).send(errorCodes.FRIENDS_BLOCKED);
		await updateFriendRelation(req.user.user_id, friendId, {
			status: 'blocked',
			initiator_id: req.user.user_id
		});
		const data = {
			type: 2,
			initiator_id: req.user.user_id,
			user: friendInfo
		};
		const socket = global.wsClients.get(Number(friendId));
		if (socket && socket.readyState === 1)
			socket.send(JSON.stringify({op: "friends_block", data, initiator_id: req.user.user_id}));
		return res.status(204).send();
	};
	await createFriendRelation(req.user.user_id, friendId, {
		status: 'blocked',
		initiator_id: req.user.user_id
	});
	const data = {
		type: 2,
		user: friendInfo,
		initiator_id: req.user.user_id
	};
	const socket = global.wsClients.get(Number(friendId));
	if (socket && socket.readyState === 1)
		socket.send(JSON.stringify({op: "friends_block", data, initiator_id: req.user.user_id}));
	return res.status(201).send();
}

export async function manageFriendshipDelete(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	const { id, friendId } = req.params;

	try {
		if (!id || !friendId)
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
			if (id === friendId || req.user.user_id == friendId)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			const isValidFriendId = await findUserByUserId(friendId);
			if (!isValidFriendId)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			const relation = await findFriendRelation(req.user.user_id, friendId);
			if (relation) {
				if (relation.status === 'accepted' || relation.status === 'pending'
					|| relation.initiator_id === req.user.user_id) {
					await deleteFriendRelation(req.user.user_id, friendId);
					const otherUser = await findUserByUserId(friendId);
					const otherUserInfo = {
						id: otherUser.user_id,
						username: otherUser.username,
						created_at: otherUser.created_at,
						updated_at: otherUser.updated_at,
						multiplayer_win: otherUser.multiplayer_win,
						multiplayer_loose: otherUser.multiplayer_loose,
						practice_win: otherUser.practice_win,
						practice_loose: otherUser.practice_loose,
						singleplayer_win: otherUser.singleplayer_win,
						singleplayer_loose: otherUser.singleplayer_loose,
						last_opponent: otherUser.last_opponent,
						avatar_url: otherUser.avatar_url,
						last_seen: otherUser.last_seen
					};
					const dataForOther = {
						initiator_id: req.user.user_id,
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
							avatar_url: req.user.avatar_url,
							last_seen: req.user.last_seen
						}
					};
					const dataForMe = {
						initiator_id: req.user.user_id,
						user: otherUserInfo
					};
					const socket = global.wsClients.get(Number(friendId));
					const socketMe = global.wsClients.get(Number(req.user.user_id));
					if (socket && socket.readyState === 1)
						socket.send(JSON.stringify({op: "friends_remove", data: dataForOther}));
					if (socketMe && socketMe.readyState === 1)
						socketMe.send(JSON.stringify({op: "friends_remove", data: dataForMe}));
				}
				else
					return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
				return res.status(204).send();
			};
			return res.status(errorCodes.FRIENDS_NOT_FOUND.status).send(errorCodes.FRIENDS_NOT_FOUND);
		} else
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}

export async function manageFriendshipPut(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	const { id, friendId } = req.params;

	if (!req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	const { type } = req.body

	try {
		if (!id || !friendId || typeof type !== 'number')
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
			if (id === friendId || req.user.user_id == friendId)
				return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
			const isValidFriendId = await findUserByUserId(friendId);
			if (!isValidFriendId)
				return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
			const friendInfo = {
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
				avatar_url: req.user.avatar_url,
				last_seen: req.user.last_seen
			}
			switch (type) {
				case 1:
					return await addFriend(req, res, friendId, friendInfo);
					break ;
				case 2:
					return await blockFriend(req, res, friendId, friendInfo);
					break ;
				default:
					return res.status(errorCodes.INVALID_FIELDS.status).send(errorCodes.INVALID_FIELDS);
					break ;
			}
		} else
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	} catch(error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function getAllFriends(req, res) {
	if (!req.params)
		return res.status(errorCodes.BAD_REQUEST.status).send(errorCodes.BAD_REQUEST);
	const { id } = req.params;

	try {
		if (!id)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (!req.user.user_id)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		let user;
		if (id === '@me' || id == req.user.user_id)
			user = req.user;
		else
			user = await findUserByUserId(id);
		if (!user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		const sesssion = req.session;
		if (!sesssion)
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
		const friendsRow = await getAllFriendsById(user.user_id);
		let friends = await Promise.all(
			friendsRow.map(async (row) => {
				if (row.initiator_id === user.user_id && row.status === 'pending')
					return null;
				const friendId = (row.user1_id === user.user_id) ? row.user2_id : row.user1_id;
				const friendInfo = await findUserByUserId(friendId);
				switch (row.status) {
					case 'pending':
						row.status = 0;
						break ;
					case 'accepted':
						row.status = 1;
						break ;
					case 'blocked':
						row.status = 2;
						break ;
					default:
						return res.status(errorCodes.INVALID_FIELDS.status).send(errorCodes.INVALID_FIELDS);
				}
				return {
					type: row.status,
					initiator_id : row.initiator_id,
					user: {
						id: friendInfo.user_id,
						username: friendInfo.username,
						created_at: friendInfo.created_at,
						updated_at: friendInfo.updated_at,
						multiplayer_win: friendInfo.multiplayer_win,
						multiplayer_loose: friendInfo.multiplayer_loose,
						practice_win: friendInfo.practice_win,
						practice_loose: friendInfo.practice_loose,
						singleplayer_win: friendInfo.singleplayer_win,
						singleplayer_loose: friendInfo.singleplayer_loose,
						last_opponent: friendInfo.last_opponent,
						avatar_url: friendInfo.avatar_url,
						last_seen: friendInfo.last_seen
					}
				};
			})
		);
		friends = friends.filter((friend) => friend !== null);
		return res.status(200).send(friends);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};