import { getAllFriendsById, findFriendRelation, updateFriendRelation, createFriendRelation, deleteFriendRelation } from "../models/friendsModel.js";
import { findUserByUserId } from "../models/userModel.js";
import { errorCodes } from "../utils/errorCodes.js";

async function addFriend(req, res, friendId) {
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
			return res.status(204).send();
		};
		return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	};
	await createFriendRelation(req.user.user_id, friendId, {
		status: 'pending',
		initiator_id: req.user.user_id
	});
	return res.status(201).send();
}

async function blockFriend(req, res, friendId) {
	const relation = await findFriendRelation(req.user.user_id, friendId);
	if (relation) {
		if (relation.status === 'blocked')
			return res.status(errorCodes.FRIENDS_BLOCKED.status).send(errorCodes.FRIENDS_BLOCKED);
		await updateFriendRelation(req.user.user_id, friendId, {
			status: 'blocked',
			initiator_id: req.user.user_id
		});
		return res.status(204).send();
	};
	await createFriendRelation(req.user.user_id, friendId, {
		status: 'blocked',
		initiator_id: req.user.user_id
	});
	return res.status(201).send();
}

export async function manageFriendshipDelete(req, res) {
	if (!req.params)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
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
				if (relation.status === 'accepted' || relation.initiator_id === req.user.user_id)
					await deleteFriendRelation(req.user.user_id, friendId);
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
	if (!req.params || !req.body)
		return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
	const { id, friendId } = req.params;
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
			switch (type) {
				case 1:
					return await addFriend(req, res, friendId);
					break ;
				case 2:
					return await blockFriend(req, res, friendId);
					break ;
				default:
					return res.status(errorCodes.INVALID_FIELDS.status).send(errorCodes.INVALID_FIELDS);
			}
		} else
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	} catch(error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function getAllFriends(req, res) {
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
			const friendsRow = await getAllFriendsById(user.user_id);
			const friends = await Promise.all(
				friendsRow.map(async (row) => {
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
							avatar_url : friendInfo.avatar_url,
							last_seen: friendInfo.last_seen
						}
					};
				})
			);
			return res.status(200).send(friends);
		} else
			return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};