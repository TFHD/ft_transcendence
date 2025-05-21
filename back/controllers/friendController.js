import { errorCodes } from '../utils/errorCodes.js';
import {createFriend, deleteFriendDB, updateFriendDB, getFriendsList, getSentRequests, deleteFriendRequest} from '../models/friendsModels.js'

export async function createFriendRequest(req, res) {
    if (!req.params)
        return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
    
    const { id } = req.params;

    try {
            if (!id)
                return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
            const user = req.user;
            if (!user)
                return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
            const sesssion = req.session
            if (!sesssion)
                return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
            await createFriend(user.user_id, id);
            return res.status(200).send({ sucess: true });
        } catch (error) {
            console.error(error);
            return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
        }
}

export async function deleteFriend(req, res) {
    if (!req.params)
        return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
    const { id } = req.params;

    try {
            
            let res1 = false
            if (!id)
                return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
            const user = req.user;
            if (!user)
                return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
            const sesssion = req.session
            if (!sesssion)
                return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
            const reponse = await deleteFriendRequest(user.user_id, id);
            if (!reponse)
                res1 = await deleteFriendDB(user.user_id, id);
            if (reponse || res1)
                return res.status(200).send({ sucess: true });
            else
                return res.status(200).send({ sucess: false });
        } catch (error) {
            console.error(error);
            return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
        }
}

export async function updateFriend(req, res) {
    if (!req.params)
        return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
    const { id } = req.params;

    try {
            if (!id)
                return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
            const user = req.user;
            if (!user)
                return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
            const sesssion = req.session
            if (!sesssion)
                return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
            await updateFriendDB(user.user_id, id);
            return res.status(200).send( { sucess: true } );
        } catch (error) {
            console.error(error);
            return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
        }
}

export async function getAllfriendsRequests(req, res) {
    try {
            const user = req.user;
            if (!user)
                return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
            const sesssion = req.session;
            if (!sesssion)
                return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
            const reponse = await getSentRequests(user.user_id);
            return res.status(200).send( { friends_req: reponse } );
        } catch (error) {
            console.error(error);
            return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
        }
}

export async function getAllfriends(req, res) {
    if (!req.params)
        return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
    const { id } = req.params;
    try {
            const user = req.user;
            if (!user)
                return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
            const sesssion = req.session;
            if (!sesssion)
                return res.status(errorCodes.UNAUTHORIZED.status).send(errorCodes.UNAUTHORIZED);
            const reponse = await getFriendsList(id);
            return res.status(200).send( { friends: reponse } );
        } catch (error) {
            console.error(error);
            return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
        }
}
