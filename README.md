# 🧙‍♂️ ft_transcendence

Un projet fullstack complet réunissant backend, frontend, infrastructure Docker et gestion avancée de l’authentification, conçu pour le cursus 42.

## 🚀 Structure du projet

```
.
├── back/                # Backend (Node.js/NestJS ou similaire)
├── front/               # Frontend (React/Next.js ou similaire)
├── cli/                 # Outils CLI (C, Makefile)
├── nginx/               # Configuration Nginx Docker
├── docker-compose.dev.yml
├── docker-compose.prod.yml
├── api_back.md          # Documentation API interne
├── Makefile             # Automatisation des tâches
├── script.sh            # Script d'initialisation
├── .gitignore
├── .gitmodules
└── package-lock.json
```

---

## 🏗️ Installation & Lancement

### Prérequis

- **Docker** & **Docker Compose**
- **Node.js**, **npm** (pour le dev local frontend/backend)
- **Make** (pour l'automatisation)
- **.env à ajouter** :  
  Avant de lancer le projet, créez un fichier `.env` dans le dossier `back/` contenant vos variables d'environnement. Exemple minimal :
  ```
  DB_HOST=localhost
  DB_PORT=5432
  DB_USER=your_user
  DB_PASS=your_password
  JWT_SECRET=your_secret
  CLOUDINARY_URL=your_cloudinary_url
  ```
  > Adaptez-le selon vos besoins et ne versionnez jamais ce fichier !

- **Exécution du script d'initialisation** :  
  Avant le lancement des containers, exécutez obligatoirement :
  ```bash
  ./script.sh
  ```
  Ce script détecte et configure l'IP locale pour Docker (utile pour le réseau et certains accès).

### Lancement en développement

```bash
make dev
```
- Installe les dépendances du frontend
- Lance le script d'init (si ce n'est pas déjà fait)
- Démarre tous les services (front + back) via Docker Compose (`docker-compose.dev.yml`)

### ⚠️ Lancement en production

```bash
make prod
```
- Installe les dépendances du frontend
- Lance le script d'init
- Démarre les services via Docker Compose (`docker-compose.prod.yml`, incluant Nginx)

> ⚠️ **Attention** : La commande `make prod` est en travaux et peut ne pas fonctionner correctement pour le moment. Un patch arrive bientôt !

### Nettoyage

```bash
make clean      # Supprime node_modules front/back
make down       # Arrête les containers
make fclean     # Supprime les images Docker
make re         # Nettoyage complet + relance
```

---

## 🖥️ Backend (`back/`)

- API REST sécurisée (JWT, 2FA)
- Principales routes :
  - `/auth/register`, `/auth/login`, `/auth/logout` (gestion utilisateurs)
  - `/auth/2fa/setup`, `/auth/2fa/verify`, `/auth/2fa/disable` (authentification forte)
  - `/users/:id` (CRUD utilisateur)
- Documentation détaillée dans [`api_back.md`](./api_back.md)
- Fichier `.env` pour variables d’environnement (voir exemple ci-dessus)

---

## 🌐 Frontend (`front/`)

- Application web moderne (React, Next.js ou équivalent)
- Connectée en temps réel au backend via API REST
- Dossier monté dans Docker pour hot-reload

---

## 🛠️ CLI (`cli/`)

- Outil en C pour interface en ligne de commande (Makefile dédié)
- **Avant toute compilation, exécuter le script d'installation des dépendances :**
  ```bash
  ./command.sh
  ```
  Ce script installe automatiquement les librairies nécessaires : **cJSON** et **curl**.
- Compilation : `make` dans le dossier `cli`
- Dépendances : `curl`, `cJSON`, `X11`
- Nettoyage : `make clean`, `make cleandeps`

---

## 🐳 Docker & Infrastructure

- **docker-compose.dev.yml** : Lance `frontend` et `backend` sur le réseau `transcendance`. Ports exposés : 3000 (front), 8000 (back).
- **docker-compose.prod.yml** : Lance `backend` et `nginx` (reverse proxy SSL). Ports exposés : 443 (front via Nginx), 80 (HTTP).
- **Volumes** : Montage des dossiers pour persistance et dev live.
- **Certificats** : Stockés dans `./certs`, utilisés par Nginx.

---

## 🔐 Authentification & Sécurité

- JWT obligatoire pour toutes les routes sécurisées
- 2FA (TOTP) configurable par utilisateur
- Headers à fournir :
  - `Authorization: Bearer <token>`
  - `x-2fa-token: <code>` (si 2FA activée)
- Gestion avancée des erreurs (voir documentation API)

---

## 📝 Documentation API

Consultez [`api_back.md`](./api_back.md) pour :
- Table des routes
- Payloads d’exemple
- Gestion des erreurs (`errorCodes.js`)
- Notes sur sécurité et fonctionnement des tokens

---

## 💡 Notes

- Tous les services tournent sur le réseau Docker `transcendance`.
- La suppression des tokens JWT se fait toutes les heures, pas de refresh_token.
- Les avatars utilisateurs sont gérés et uploadés sur CDN (Cloudinary).
- Hot-reload disponible en dev (volumes Docker).

---

## 📁 Fichiers importants

- `Makefile` : Automatisation globale (build, nettoyage, lancement)
- `script.sh` : Script d’initialisation
- `.gitignore` : Liste des fichiers ignorés par git
- `.gitmodules` : Dépendances git externes (si présentes)

---

## 👤 Auteur

Projet développé par [TFHD](https://github.com/TFHD), [SatoSaki](https://github.com/SatoSakii), [Scorpionnem](https://github.com/Scorpionnem) and [Arkturius](https://github.com/Arkturius).

---
