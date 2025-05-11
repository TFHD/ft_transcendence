import { getMatchesByGameId } from "../models/tournamentModel.js";
import { getGameByGameId } from "../models/gameModels.js";
import { errorCodes } from '../utils/errorCodes.js';

export async function getMatchsById(req, res) {
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
            const matchs = await getMatchesByGameId(id);
            if (!matchs)
                return res.status(200).send(false);
            return res.status(200).send({ matchs: matchs });
    } catch (error) {
        return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
};

export async function getGameById(req, res) {
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
            const game = await getGameByGameId(id);
            if (!game)
                return res.status(200).send(false);
            return res.status(200).send({
                id : game.game_id,
                mode : game.game_mode,
                players: game.players,
                limit : game.players_limit
             });
    } catch (error) {
        return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
    }
};