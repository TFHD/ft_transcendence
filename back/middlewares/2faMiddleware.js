import speakeasy from 'speakeasy';
import { errorCodes } from '../utils/errorCodes.js';

export async function twoFAMiddleware(req, res) {
	try {
		if (req.user.twofa_enabled) {
			const token2fa = req.headers['x-2fa-token'];
			if (!token2fa)
				return res.status(errorCodes.TWOFA_REQUIRED.status).send(errorCodes.TWOFA_REQUIRED);

			const verified = speakeasy.totp.verify({
				secret: req.user.twofa_secret,
				encoding: 'base32',
				token: token2fa,
				window: 1
			});
			if (!verified)
				return res.status(errorCodes.INVALID_TWOFA_TOKEN.status).send(errorCodes.INVALID_TWOFA_TOKEN);
		}
	} catch(error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};