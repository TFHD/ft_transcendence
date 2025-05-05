export function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function isValidPassword(password) {
	return typeof password === 'string' && password.length >= 8;
};

export function isValidUsername(username) {
	return typeof username === 'string' && username.length >= 3;
};

export function cookieOpts() {
	return {
		httpOnly: true,
		secure: true,
		sameSite: 'Lax',
		path: '/',
		maxAge: 60 * 60
	};
};