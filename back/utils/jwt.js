import jwt from 'jsonwebtoken';
import { jwtSecret, jwtExpiration } from '../config/jwt.config.js';

export const generateToken = (payload) => {
	return jwt.sign(payload, jwtSecret, {
		expiresIn: jwtExpiration,
	});
};

export const verifyToken = (token) => {
	try {
		jwt.verify(token, jwtSecret);
		return true;
	} catch (error) {
		return false;
	}
};