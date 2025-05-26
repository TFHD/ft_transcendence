import crypto from 'crypto';

const key = crypto.createHash('sha256').update(String(process.env.SECRET_KEY)).digest();
const algorithm = 'aes-256-cbc';

export function hashEmail(email) {
	if (!email)
		return ;
	const hash = crypto.createHash('sha256').update(email).digest('hex');
	return hash;
}

export function encrypt(text) {
	const iv = crypto.randomBytes(16);
	const cipher = crypto.createCipheriv(algorithm, key, iv);
	let encrypted = cipher.update(text, 'utf8', 'hex');
	encrypted += cipher.final('hex');
	return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text) {
	const parts = text.split(':');
	const iv = Buffer.from(parts.shift(), 'hex');
	const encryptedText = Buffer.from(parts.join(':'), 'hex');
	const decipher = crypto.createDecipheriv(algorithm, key, iv);
	let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
	decrypted += decipher.final('utf8');
	return decrypted;
}

