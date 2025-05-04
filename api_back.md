
# 📘 Internal API Documentation

Toutes les routes sont préfixées par `/api`.

## 🔐 Authentification & Sécurité

- **JWT Token requis** : `Authorization: Bearer <token>` ( Header )
- **2FA requis (si activé)** : `x-2fa-token: <code TOTP>` ( Header )
- **User ID** : `:id` peut être soit un UserID, soit `@me` (pour accéder à son propre compte)

---

## 🧾 Table des routes

| Méthode | Endpoint                     | Description                    | Auth | 2FA |
|---------|------------------------------|--------------------------------|------|-----|
| POST    | `/auth/register`             | Inscription                   | ❌    | ❌  |
| POST    | `/auth/login`                | Connexion                     | ❌    | ❌  |
| POST    | `/auth/logout`               | Déconnexion                   | ✅    | ❌  |
| GET     | `/auth/2fa/setup`            | Génère une clé 2FA            | ✅    | ❌  |
| POST    | `/auth/2fa/verify`           | Active la 2FA                 | ✅    | ❌  |
| POST    | `/auth/2fa/disable`          | Désactive la 2FA              | ✅    | ✅  |
| GET     | `/users/:id`                 | Récupère un utilisateur       | ✅    | ❌  |
| PATCH   | `/users/:id`                 | Modifie un utilisateur        | ✅    | ✅  |
| DELETE  | `/users/:id`                 | Supprime son propre compte    | ✅    | ✅  |

---

## 📂 Endpoints détaillés

### POST `/auth/register`
> Crée un nouvel utilisateur.

**Body JSON :**
```json
{
  "email": "string",
  "password": "string"
}
```

**Réponse 201** : Utilisateur créé.

### POST `/auth/login`

> Connecte un utilisateur et retourne un token.

**Body JSON :**
```json
{
  "email": "string",
  "password": "string"
}
```

**Réponse 200** :
```json
{
	"token": "string" // jwt token
}
```

### POST `/auth/logout`

> Invalide le token en base.

**Headers :**
```
Authorization: Bearer <token>
```

### GET `/auth/2fa/setup`

> Génère une clé 2FA et un lien QR code.

**Réponse 200 :**
```json
{
  "qrCode": "string", // image en b64
}
```

### POST `/auth/2fa/verify`

> Active la 2FA après avoir scanné le code.

**Body JSON :**
```json
{
  "token": "123456" // Code TOTP actuel
}
```

### POST `/auth/2fa/disable`

> Désactive la 2FA (requiert token 2FA actif).

**Headers :**
```
Authorization: Bearer <token>
x-2fa-token: 123456
```

### GET `/users/:id`

> Retourne les informations de l’utilisateur.

-   `:id` = `userid (123456789000)` ou `@me`

**Body exemple :**
```json
{
	"id":  862586213547,
	"username":  "sdfsdsdfdfsd",
	"email":  "adsadasdfsfsdsdcdassca@gmail.com",
	"created_at":  "2025-05-04 23:36:38",
	"updated_at":  "2025-05-04 23:36:38",
	"last_seen":  "2025-05-04 23:36:42"
}
```
> La date est en UTC+0. en France on est en : UTC+2

### PATCH `/users/:id`

> Modifie les infos utilisateur (avec 2FA si activée).

**Body exemple :**
```json
{
  "username": "new_username"
  "email": "new_email",
  "password": "new_password",
}
```

**form-data**:

	file: <upload>

> Note: Envoie sur le CDN (Cloudinary) et modifie avatar_url dans la db avec le nouvel avatar

### DELETE `/users/:id`

> Supprime l’utilisateur connecté (avec 2FA si activée).

## ⚠️ Codes d’erreurs (issus de `errorCodes.js`)

| Code HTTP | Code interne
| -------- | ------- |
| 500      | INTERNAL_SERVER_ERROR |
| 400      | JSON_PARSE_ERROR |
| 400      | MISSING_FIELDS   |
| 400      | EMAIL_INVALID |
| 400      | USERNAME_INVALID |
| 400      | PASSWORD_INVALID |
| 401      | INVALID_CREDENTIALS |
| 409      | USER_ALREADY_EXISTS |
| 401      | TWOFA_REQUIRED |
| 409      | TWOFA_ALREADY_ENABLED |
| 401      | TWOFA_NOT_ENABLED |
| 401      | INVALID_TWOFA_TOKEN |
| 401      | UNAUTHORIZED |
| 404      | USER_NOT_FOUND |
| 400      | INVALID_FILE_TYPE |

## Notes

> last_seen est modifié quand tu passes dans le middleware authMiddelware
> Les JWT sont supprimés toutes les heures (voir jwt.config.js) : ⚠️ Il n y a pas de refresh_token
