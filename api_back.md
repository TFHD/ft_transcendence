# 📘 Internal API Documentation

Toutes les routes sont préfixées par `/api`.

---

## 🔐 Authentification & Sécurité

- **JWT Token requis** :  
  Utilisez le header `Authorization: Bearer <token>` pour toute requête authentifiée.
- **2FA requis (si activé)** :  
  Si la double authentification est activée sur votre compte, fournissez aussi le header `x-2fa-token: <code TOTP>`.
- **User ID** :  
  L’URL paramètre `:id` peut être soit un UserID, soit la valeur spéciale `@me` pour accéder à son propre compte.

---

## 🧾 Table des routes

| Méthode | Endpoint                 | Description                   | Auth | 2FA |
|---------|--------------------------|-------------------------------|------|-----|
| POST    | `/auth/register`         | Inscription                   | ❌   | ❌  |
| POST    | `/auth/login`            | Connexion                     | ❌   | ❌  |
| POST    | `/auth/logout`           | Déconnexion                   | ✅   | ❌  |
| GET     | `/auth/2fa/setup`        | Génère une clé 2FA            | ✅   | ❌  |
| POST    | `/auth/2fa/verify`       | Active la 2FA                 | ✅   | ❌  |
| POST    | `/auth/2fa/disable`      | Désactive la 2FA              | ✅   | ✅  |
| GET     | `/users/:id`             | Récupère un utilisateur       | ✅   | ❌  |
| PATCH   | `/users/:id`             | Modifie un utilisateur        | ✅   | ✅  |
| DELETE  | `/users/:id`             | Supprime son propre compte    | ✅   | ✅  |

---

## 📂 Endpoints détaillés

### POST `/auth/register`
> Crée un nouvel utilisateur.

**Body JSON :**
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
**Réponse 201** : Utilisateur créé.

---

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

---

### POST `/auth/logout`
> Invalide le token en base.

**Headers :**
```
Authorization: Bearer <token>
```

---

### GET `/auth/2fa/setup`
> Génère une clé 2FA et un lien QR code.

**Réponse 200 :**
```json
{
  "qrCode": "string",        // image en b64
  "qrCodeImage": "string"    // image QRCode (ascii terminal)
}
```

---

### POST `/auth/2fa/verify`
> Active la 2FA après avoir scanné le code.

**Body JSON :**
```json
{
  "token": "123456" // Code TOTP actuel
}
```

---

### POST `/auth/2fa/disable`
> Désactive la 2FA (requiert token 2FA actif).

**Headers :**
```
Authorization: Bearer <token>
x-2fa-token: 123456
```

---

### GET `/users/:id`
> Retourne les informations de l’utilisateur

- `:id` = `userid (123456789000)` ou `@me`

**Body exemple :**
```json
{
  "id":  862586213547,
  "username":  "sdfsdsdfdfsd",
  "email":  "adsadasdfsfsdsdcdassca@gmail.com",
  "created_at":  "2025-05-04 23:36:38",
  "updated_at":  "2025-05-04 23:36:38",
  "twofa_enabled":  "1",
  "avatar_url":  "https://res.cl[...].png",
  "last_seen":  "2025-05-04 23:36:42"
}
```
> Les dates sont en UTC+0. En France, UTC+2.

---

### PATCH `/users/:id`
> Modifie les infos utilisateur (avec 2FA si activée).

**Body JSON exemple :**
```json
{
  "username": "new_username",
  "email": "new_email",
  "password": "new_password"
}
```
**form-data** :
```
file: <upload>
```
> Note : L’avatar utilisateur est uploadé sur Cloudinary et l’URL est mise à jour dans la base.

---

### DELETE `/users/:id`
> Supprime l’utilisateur connecté (avec 2FA si activée).

---

## ⚠️ Codes d’erreurs (`errorCodes.js`)

| Code HTTP | Code interne              |
|-----------|--------------------------|
| 500       | INTERNAL_SERVER_ERROR    |
| 400       | JSON_PARSE_ERROR         |
| 400       | MISSING_FIELDS           |
| 400       | EMAIL_INVALID            |
| 400       | USERNAME_INVALID         |
| 400       | PASSWORD_INVALID         |
| 401       | INVALID_CREDENTIALS      |
| 409       | USER_ALREADY_EXISTS      |
| 401       | TWOFA_REQUIRED           |
| 409       | TWOFA_ALREADY_ENABLED    |
| 401       | TWOFA_NOT_ENABLED        |
| 401       | INVALID_TWOFA_TOKEN      |
| 401       | UNAUTHORIZED             |
| 404       | USER_NOT_FOUND           |
| 400       | INVALID_FILE_TYPE        |

---

## Notes

- `last_seen` est mis à jour automatiquement lors du passage dans le middleware d’authentification.
- Les tokens JWT sont supprimés toutes les heures (voir `jwt.config.js`).  
  ⚠️ Il n’y a pas de refresh_token !
- Les avatars utilisateurs sont stockés sur Cloudinary après upload.
- Pour toute requête modifiant ou supprimant un utilisateur, la 2FA est exigée si elle est activée sur le compte.

---
