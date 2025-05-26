export const errorCodes = Object.freeze({
	INTERNAL_SERVER_ERROR: {
		code: 'INTERNAL_SERVER_ERROR',
		type: 'server_error',
		message: 'An internal server error occurred.',
		status: 500
	},
	JSON_PARSE_ERROR: {
		code: 'JSON_PARSE_ERROR',
		type: 'validation_error',
		message: 'Invalid JSON format.',
		status: 400
	},
	MISSING_FIELDS: {
		code: 'MISSING_FIELDS',
		type: 'validation_error',
		message: 'All fields are required.',
		status: 400
	},
	EMAIL_INVALID: {
		code: 'EMAIL_INVALID',
		type: 'validation_error',
		message: 'The email address format is invalid.',
		status: 400
	},
	USERNAME_INVALID: {
		code: 'USERNAME_INVALID',
		type: 'validation_error',
		message: 'The username format is invalid.',
		status: 400
	},
	PASSWORD_INVALID: {
		code: 'PASSWORD_INVALID',
		type: 'validation_error',
		message: 'The password format is invalid.',
		status: 400
	},
	INVALID_CREDENTIALS: {
		code: 'INVALID_CREDENTIALS',
		type: 'authentication_error',
		message: 'Invalid email or password.',
		status: 401
	},
	USER_ALREADY_EXISTS: {
		code: 'USER_ALREADY_EXISTS',
		type: 'validation_error',
		message: 'A user with this email or username already exists.',
		status: 409
	},
	TWOFA_REQUIRED: {
		code: 'TWOFA_REQUIRED',
		type: 'authentication_error',
		message: 'Two-factor authentication is required.',
		status: 401
	},
	TWOFA_ALREADY_ENABLED: {
		code: 'TWOFA_ALREADY_ENABLED',
		type: 'validation_error',
		message: 'Two-factor authentication is already enabled.',
		status: 409
	},
	TWOFA_NOT_ENABLED: {
		code: '2FA_NOT_ENABLED',
		type: 'authentication_error',
		message: 'Two-factor authentication is not enabled.',
		status: 401
	},
	INVALID_TWOFA_TOKEN: {
		code: 'INVALID_2FA_TOKEN',
		type: 'authentication_error',
		message: 'Invalid two-factor authentication token.',
		status: 401
	},
	UNAUTHORIZED: {
		code: 'UNAUTHORIZED',
		type: 'authentication_error',
		message: 'Unauthorized access.',
		status: 401
	},
	USER_NOT_FOUND: {
		code: 'USER_NOT_FOUND',
		type: 'validation_error',
		message: 'User not found.',
		status: 404
	},
	INVALID_FILE_TYPE: {
		code: 'INVALID_FILE_TYPE',
		type: 'validation_error',
		message: 'Invalid file type. Only image files are allowed.',
		status: 400
	},
	FRIENDS_ALREADY_ADDED: {
		code: 'FRIENDS_ALREADY_ADDED',
		type: 'validation_error',
		message: 'You are already friends with this user.',
		status: 409
	},
	FRIENDS_BLOCKED: {
		code: 'FRIENDS_BLOCKED',
		type: 'validation_error',
		message: 'You have blocked this user.',
		status: 409
	},
	FRIENDS_NOT_FOUND: {
		code: 'FRIENDS_NOT_FOUND',
		type: 'validation_error',
		message: 'Friend not found.',
		status: 404
	},
	FRIENDS_PENDING: {
		code: 'FRIENDS_PENDING',
		type: 'validation_error',
		message: 'Friend request is pending.',
		status: 409
	},
	INVALID_FIELDS: {
		code: 'INVALID_FIELDS',
		type: 'validation_error',
		message: 'Invalid fields provided.',
		status: 400
	},
	BAD_REQUEST: {
		code: 'BAD_REQUEST',
		type: 'validation_error',
		message: 'Bad request.',
		status: 400
	},
	MESSAGE_NOT_FOUND: {
		code: 'MESSAGE_NOT_FOUND',
		type: 'validation_error',
		message: 'Message not found.',
		status: 404
	},
	GOOGLE_USER: {
		code: 'GOOGLE_USER',
		type: 'validation_error',
		message: 'Google users are not allowed to change their email or username.',
		status: 403
	}
});