import { updateUser } from "../models/userModel.js";
import { errorCodes } from "../utils/errorCodes.js";

import speakeasy from "speakeasy";
import QRCode from "qrcode";

export async function setup2FA(req, res) {
	try {
		if (!req.user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		if (req.user.twofa_enabled)
			return res.status(errorCodes.TWOFA_ALREADY_ENABLED.status).send(errorCodes.TWOFA_ALREADY_ENABLED);
		const secret = speakeasy.generateSecret({ name: `ft_transcendence: (${req.user.username})` });

		await updateUser(req.user.user_id, {
			twofa_secret: secret.base32
		});

		const otpAuthUrl = secret.otpauth_url;
		const qrCode = await QRCode.toDataURL(otpAuthUrl);

		return res.status(200).send({
			qrCode
		});
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	};
};

export async function verify2FA(req, res) {
	try {
		if (!req.body)
			return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
		if (!req.user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);

		const { token } = req.body;

		if (!token)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (!req.user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);
		if (!req.user.twofa_secret)
			return res.status(errorCodes.TWOFA_NOT_ENABLED.status).send(errorCodes.TWOFA_NOT_ENABLED);

		const verified = speakeasy.totp.verify({
			secret: req.user.twofa_secret,
			encoding: 'base32',
			token: token,
			window: 1
		});
		if (!verified)
			return res.status(errorCodes.INVALID_TWOFA_TOKEN.status).send(errorCodes.INVALID_TWOFA_TOKEN);
		
		await updateUser(req.user.user_id, {
			twofa_enabled: true
		});

		return res.status(204).send();
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
};

export async function delete2FA(req, res) {
	try {
		if (!req.body)
			return res.status(errorCodes.JSON_PARSE_ERROR.status).send(errorCodes.JSON_PARSE_ERROR);
		if (!req.user)
			return res.status(errorCodes.USER_NOT_FOUND.status).send(errorCodes.USER_NOT_FOUND);

		const { token } = req.body;

		if (!token)
			return res.status(errorCodes.MISSING_FIELDS.status).send(errorCodes.MISSING_FIELDS);
		if (!req.user.twofa_enabled)
			return res.status(errorCodes.TWOFA_NOT_ENABLED.status).send(errorCodes.TWOFA_NOT_ENABLED);

		const verified = speakeasy.totp.verify({
			secret: req.user.twofa_secret,
			encoding: 'base32',
			token: token,
			window: 1
		});
		if (!verified)
			return res.status(errorCodes.INVALID_TWOFA_TOKEN.status).send(errorCodes.INVALID_TWOFA_TOKEN);

		await updateUser(req.user.user_id, {
			twofa_enabled: false,
			twofa_secret: null
		});

		return res.status(204).send();
	} catch (error) {
		return res.status(errorCodes.INTERNAL_SERVER_ERROR.status).send(errorCodes.INTERNAL_SERVER_ERROR);
	}
}