# 🚀 Guide de Configuration Rapide - Pol-UX

## 📋 Prérequis

- Node.js 18+ installé
- PostgreSQL installé ou compte NeonDB
- Git installé

## ⚡ Configuration Express

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Base de données PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/polux_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here-change-this-in-production"

# OAuth Providers (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_ID=""
GITHUB_SECRET=""
```

### 2. Base de données

#### Option A : Base locale PostgreSQL
```bash
# Créer la base de données
createdb polux_db

# Appliquer les migrations
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate

# Peupler avec des données de test
npm run db:seed
```

#### Option B : NeonDB (recommandé)
1. Créez un compte sur [neon.tech](https://neon.tech)
2. Créez un nouveau projet
3. Copiez l'URL de connexion dans `DATABASE_URL`
4. Exécutez les commandes ci-dessus

### 3. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 👤 Comptes de test

Après le seeding, vous pouvez vous connecter avec :

- **Admin** : `admin@polux.fr` / `admin123`
- **Contributeur** : `user1@polux.fr` / `password123`
- **Explorateur** : `user2@polux.fr` / `password123`

## 🗺️ Fonctionnalités disponibles

- ✅ Page d'accueil avec présentation du projet
- ✅ Système d'authentification (inscription/connexion)
- ✅ Carte interactive des initiatives écologiques
- ✅ Forum collaboratif avec posts et commentaires
- ✅ Page de conseils écologiques
- ✅ Interface d'administration
- ✅ Système de rôles (Explorateur, Contributeur, Admin)
- ✅ Modération des contenus

## 🔧 Configuration OAuth (optionnel)

### Google OAuth
1. Allez sur [Google Cloud Console](https://console.cloud.google.com)
2. Créez un projet et activez l'API Google+ 
3. Créez des identifiants OAuth 2.0
4. Ajoutez `http://localhost:3000/api/auth/callback/google` aux URIs de redirection

### GitHub OAuth
1. Allez dans les paramètres de votre compte GitHub
2. Créez une nouvelle application OAuth
3. Ajoutez `http://localhost:3000/api/auth/callback/github` comme URL de callback

## 🚀 Déploiement

### Vercel (recommandé)
1. Connectez votre repo GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez !

### Autres plateformes
- Netlify
- Railway
- Heroku

## 🐛 Dépannage

### Erreur de base de données
```bash
# Vérifier la connexion
npx prisma db push

# Réinitialiser la base
npx prisma migrate reset
npm run db:seed
```

### Erreur d'authentification
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL

### Erreur de build
```bash
# Nettoyer le cache
rm -rf .next
npm run build
```

## 📞 Support

Pour toute question ou problème, consultez la documentation ou ouvrez une issue sur GitHub.
