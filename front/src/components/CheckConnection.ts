import axios from 'axios';

const host = import.meta.env.VITE_ADDRESS;

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