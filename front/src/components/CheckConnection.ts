import axios from 'axios';

const host = window.location.hostname;

export const CheckToken = async () => {
  try {
        const res = await axios.get(`https://${host}:8000/api/users/@me`, {
            withCredentials: true
        });
        if (res.status == 200)
            return true;
        else
            return false;
    } catch (error) {
        return false;
    }
};

export const getId = async () => {
  try {
        const res = await axios.get(`https://${host}:8000/api/users/@me`, {
            withCredentials: true
        });
        if (res.status == 200)
            return res.data.id;
    } catch (error) {
        return null;
    }
};

export const generateTimeBasedId = () => {
    const timestampPart = Date.now().toString(36).substring(6);
    const randomPart = Math.random().toString(36).substring(2, 6);
    return timestampPart + randomPart;
};

export const getIsAuthA2F = async () => {

    try {
        const reponse = await axios.get(`https://${host}:8000/api/users/@me`, {
            withCredentials: true,
        });
        return reponse.data.twofa_enabled;
    } catch (err) { return false; }
};

export const checkCode = async (code2FA : string) => {
    try {
        const response = await axios.post(`https://${host}:8000/api/auth/2fa/disable`, {
          token: code2FA
        }, {
          withCredentials: true
        });
        return true;
        } catch (err) {
          return false;
        }
};

export const getUsername = async () => {

    try {
        const reponse = await axios.get(`https://${host}:8000/api/users/@me`, {
            withCredentials: true,
        });
        return reponse.data.username;
    } catch (err) { return false; }
};

export const getUsernamebyID = async (id: number) => {

    try {
        const reponse = await axios.get(`https://${host}:8000/api/users/${id}`, {
            withCredentials: true,
        });
        return reponse.data.username;
    } catch (err) { return false; }
};

export const IdentifyFriend = (myID : number, user1: number, user2 : number) =>
{
    if (myID == user1)
        return user2;
    return user1;
};