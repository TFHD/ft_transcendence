import { decrypt } from "./crypto.js";
import { getHistoryByUsername } from "../models/historyModel.js";
import { getAllFriendsById } from "../models/friendsModel.js";
import { findUserByUserId } from "../models/userModel.js";
import { getAllMessagesByUserId } from "../models/messagesModel.js";

export async function exportDataObject(user, session) {
    const data = {
        export_info: {
            export_date: new Date().toISOString(),
            user_id: user.user_id,
            username: user.username,
            format_version: "1.0"
        },
        user_profile: {
            username: user.username,
            email: decrypt(user.email),
            avatar_url: user.avatar_url,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_seen: user.last_seen,
            twofa_enabled: user.twofa_enabled,
        },
        gaming_stats: {
            multiplayer: {
                wins: user.multiplayer_win,
                losses: user.multiplayer_loose
            },
            practice: {
                wins: user.practice_win,
                losses: user.practice_loose
            },
            singleplayer: {
                wins: user.singleplayer_win,
                losses: user.singleplayer_loose
            },
            last_opponent: user.last_opponent,
        },
        match_history: (await getHistoryByUsername(user.username)).map((match) => ({
            winner: {
                id: match.winner_id,
                username: match.winner_username,
                score: match.winner_score
            },
            loser: {
                id: match.looser_id,
                username: match.looser_username,
                score: match.looser_score
            },
            equality: match.equality,
            game_mode: match.game_mode,
            timestamp: match.time,
            my_result: match.winner_id === user.user_id ? 'win' : 'loss'
        })),
        friends: await Promise.all(
            (await getAllFriendsById(user.user_id)).map(async (friend) => {
                const otherUserId = friend.user1_id === user.user_id ? friend.user2_id : friend.user1_id;
                const initiatorUser = await findUserByUserId(friend.initiator_id);
                const otherUser = await findUserByUserId(otherUserId);
                return {
                    friend_username: otherUser?.username || 'Unknown User',
                    status: friend.status,
                    initiator_username: initiatorUser?.username || 'Unknown User',
                    request_direction: friend.initiator_id === user.user_id ? 'sent' : 'received'
                };
            })
        ),
        messages: await Promise.all(
            (await getAllMessagesByUserId(user.user_id)).map(async (message) => {
                const senderUser = await findUserByUserId(message.sender_id);
                const receiverUser = await findUserByUserId(message.receiver_id);
                return {
                    message_id: message.message_id,
                    sender_username: senderUser?.username || 'Unknown User',
                    receiver_username: receiverUser?.username || 'Unknown User',
                    content: decrypt(message.content),
                    type: message.type,
                    room_id: message.room_id,
                    timestamp: message.timestamp,
                    direction: message.sender_id === user.user_id ? 'sent' : 'received'
                };
            })
        ),
    };
    return data;
}
