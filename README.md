# Pol-UX - Plateforme Collaborative Écologique

Pol-UX est une plateforme web collaborative dédiée à la promotion d'événements et d'initiatives écologiques sur tout le territoire français. Le site met l'accent sur l'écologie et vise à minimiser son impact environnemental tout en offrant une expérience fluide et interactive.

## 🚀 Fonctionnalités

### Pages Principales
- **Page d'accueil** : Présentation du projet avec design écologique
- **Carte interactive** : Visualisation des initiatives écologiques sur une carte
- **Forum collaboratif** : Espace d'échange inspiré de Reddit
- **Conseils écologiques** : Liste de conseils pratiques pour réduire son impact
- **Inscription** : Authentification avec système personnalisé
- **Administration** : Interface de gestion pour les administrateurs

### Rôles Utilisateurs
- **Explorateur** : Accès en lecture seule
- **Contributeur** : Peut soumettre des initiatives, articles et conseils
- **Administrateur** : Gestion complète des utilisateurs et contenus

### Technologies Utilisées
- **Frontend** : Next.js 14, React, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL (NeonDB recommandé)
- **Authentification** : Système de session sécurisé avec JWT et cookies HTTP-only
- **Carte** : Leaflet.js pour la cartographie interactive
- **Performance** : Optimisation EcoIndex, lazy loading, SSG

## 🔐 Système d'Authentification

**Nouveau** : Système de session complet et sécurisé mis en place !

### ✅ Fonctionnalités
- **Sessions persistantes** : Les utilisateurs restent connectés
- **Cookies sécurisés** : HTTP-only, SameSite, expiration automatique
- **Gestion des rôles** : Vérification des permissions côté serveur
- **Nettoyage automatique** : Suppression des sessions expirées
- **Protection CSRF** : Protection contre les attaques cross-site
- **Validation email** : Confirmation obligatoire des adresses email

### 🔧 Configuration requise
```env
# Clé secrète pour les JWT (obligatoire)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# URL de l'application
NEXTAUTH_URL="http://localhost:3000"
```

### 🛡️ Sécurité
- Cookies HTTP-only (protection XSS)
- Tokens de session uniques
- Expiration automatique (7 jours)
- Hachage des mots de passe avec bcrypt
- Validation côté serveur

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Base de données PostgreSQL

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

# Authentification (obligatoire)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Application
NEXTAUTH_URL="http://localhost:3000"
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
- **Session** : Sessions utilisateur sécurisées
- **Account** : Comptes OAuth (pour évolutions futures)
- **Initiative** : Événements et projets écologiques géolocalisés
- **ForumPost** : Posts du forum avec catégories
- **ForumComment** : Commentaires sur les posts
- **Tip** : Conseils écologiques par catégorie
- **Vote** : Système de votes pour posts et conseils

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter votre repository GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer automatiquement

### Variables d'environnement de production
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Nettoyage des sessions
```bash
# Démarrer le service de nettoyage automatique
npm run session:cleanup

# Ou avec un intervalle personnalisé
SESSION_CLEANUP_INTERVAL=30 npm run session:cleanup
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

- Authentification sécurisée avec système de session
- Validation des données côté serveur
- Protection CSRF et XSS
- Hachage des mots de passe avec bcrypt
- Headers de sécurité
- Cookies HTTP-only

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

- [x] Système de session sécurisé
- [ ] Système de notifications
- [ ] Application mobile
- [ ] Intégration réseaux sociaux
- [ ] Système de badges et récompenses
- [ ] API publique pour développeurs
- [ ] Intégration avec d'autres plateformes écologiques

---

**Pol-UX** - Ensemble pour un avenir plus vert 🌱
