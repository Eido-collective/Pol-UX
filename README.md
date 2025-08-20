# Pol-UX - Plateforme Collaborative Écologique

Pol-UX est une plateforme web collaborative dédiée à la promotion d'événements et d'initiatives écologiques sur tout le territoire français. Le site met l'accent sur l'écologie et vise à minimiser son impact environnemental tout en offrant une expérience fluide et interactive.

## 🚀 Fonctionnalités

### Pages Principales
- **Page d'accueil** : Présentation du projet avec design écologique
- **Carte interactive** : Visualisation des initiatives écologiques sur une carte
- **Forum collaboratif** : Espace d'échange inspiré de Reddit
- **Conseils écologiques** : Liste de conseils pratiques pour réduire son impact
- **Inscription/Connexion** : Authentification avec NextAuth.js
- **Administration** : Interface de gestion pour les administrateurs

### Rôles Utilisateurs
- **Explorateur** : Accès en lecture seule
- **Contributeur** : Peut soumettre des initiatives, articles et conseils
- **Administrateur** : Gestion complète des utilisateurs et contenus

### Technologies Utilisées
- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL (NeonDB recommandé)
- **Authentification** : NextAuth.js avec Google, GitHub
- **Carte** : Leaflet.js pour la cartographie interactive
- **Performance** : Optimisation EcoIndex, lazy loading, SSG

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Base de données PostgreSQL
- Comptes développeur pour Google OAuth et GitHub OAuth

## 🛠️ Installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd polux
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env.local
```

Éditer le fichier `.env.local` avec vos configurations :
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/polux"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
```

4. **Configuration de la base de données**
```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Seeder pour les données de test
npx prisma db seed
```

5. **Lancer le serveur de développement**
```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🗄️ Structure de la Base de Données

### Modèles Principaux
- **User** : Utilisateurs avec rôles (EXPLORER, CONTRIBUTOR, ADMIN)
- **Initiative** : Événements et projets écologiques géolocalisés
- **ForumPost** : Posts du forum avec catégories
- **ForumComment** : Commentaires sur les posts
- **Tip** : Conseils écologiques par catégorie
- **Vote** : Système de votes pour posts et conseils

## 🔧 Configuration OAuth

### Google OAuth
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet
3. Activer l'API Google+ 
4. Créer des identifiants OAuth 2.0
5. Ajouter `http://localhost:3000/api/auth/callback/google` aux URIs de redirection

### GitHub OAuth
1. Aller dans les paramètres GitHub > Developer settings > OAuth Apps
2. Créer une nouvelle application OAuth
3. Ajouter `http://localhost:3000/api/auth/callback/github` comme callback URL

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement de production
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"
GOOGLE_CLIENT_ID="your-production-google-client-id"
GOOGLE_CLIENT_SECRET="your-production-google-client-secret"
GITHUB_ID="your-production-github-client-id"
GITHUB_SECRET="your-production-github-client-secret"
```

## 📱 Fonctionnalités Principales

### Carte Interactive
- Affichage des initiatives avec marqueurs colorés par type
- Filtres par type d'initiative et ville
- Recherche textuelle
- Popups détaillés avec informations complètes

### Forum Collaboratif
- Posts organisés par catégories
- Système de votes (upvote/downvote)
- Commentaires modérés
- Tri par popularité, date, etc.

### Conseils Écologiques
- Conseils par catégorie (déchets, énergie, transport, etc.)
- Système de notation
- Images et descriptions détaillées

### Administration
- Gestion des utilisateurs et rôles
- Modération des contenus (initiatives, posts, conseils)
- Interface intuitive avec onglets

## 🎨 Design et Performance

### Écologie Numérique
- Optimisation EcoIndex pour réduire l'impact environnemental
- Images optimisées et lazy loading
- Code splitting et génération statique
- Hébergement éco-responsable recommandé

### Accessibilité
- Conformité WCAG 2.1
- Contrastes adéquats
- Support des lecteurs d'écran
- Navigation au clavier

## 🔒 Sécurité

- Authentification sécurisée avec NextAuth.js
- Validation des données côté serveur
- Protection CSRF
- Hachage des mots de passe avec bcrypt
- Headers de sécurité

## 📊 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🗺️ Roadmap

- [ ] Système de notifications
- [ ] Application mobile
- [ ] Intégration réseaux sociaux
- [ ] Système de badges et récompenses
- [ ] API publique pour développeurs
- [ ] Intégration avec d'autres plateformes écologiques

---

**Pol-UX** - Ensemble pour un avenir plus vert 🌱
