export function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export function isValidPassword(password) {
	return typeof password === 'string' && password.length >= 8 && password.length <= 32 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?":{}|<>]/.test(password);
};

export function isValidUsername(username) {
	return typeof username === 'string' && username.length >= 3 && username.length <= 16 && /^[a-zA-Z0-9_]+$/.test(username);
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