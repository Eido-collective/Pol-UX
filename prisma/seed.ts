import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Début du seeding...')

  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@polux.fr' },
    update: {},
    create: {
      name: 'Administrateur Pol-UX',
      email: 'admin@polux.fr',
      username: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Créer quelques utilisateurs de test
  const user1 = await prisma.user.upsert({
    where: { email: 'user1@polux.fr' },
    update: {},
    create: {
      name: 'Jean Dupont',
      email: 'user1@polux.fr',
      username: 'jean_dupont',
      password: await bcrypt.hash('password123', 12),
      role: 'CONTRIBUTOR',
    },
  })

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@polux.fr' },
    update: {},
    create: {
      name: 'Marie Martin',
      email: 'user2@polux.fr',
      username: 'marie_martin',
      password: await bcrypt.hash('password123', 12),
      role: 'EXPLORER',
    },
  })

  // Créer quelques initiatives de test
  const initiative1 = await prisma.initiative.create({
    data: {
      title: 'Nettoyage du Parc de la Villette',
      description: 'Grande opération de nettoyage du parc avec la communauté locale. Venez nombreux pour rendre notre parc plus propre !',
      type: 'EVENT',
      latitude: 48.8907,
      longitude: 2.3878,
      address: '211 Avenue Jean Jaurès',
      city: 'Paris',
      postalCode: '75019',
      startDate: new Date('2024-06-15'),
      endDate: new Date('2024-06-15'),
      website: 'https://example.com',
      contactEmail: 'contact@example.com',
      contactPhone: '01 23 45 67 89',
      authorId: user1.id
    },
  })

  const initiative2 = await prisma.initiative.create({
    data: {
      title: 'Association Éco-Citoyens Lyon',
      description: 'Association locale dédiée à la promotion de pratiques écologiques dans la région lyonnaise.',
      type: 'ASSOCIATION',
      latitude: 45.7578,
      longitude: 4.8320,
      address: '15 Rue de la République',
      city: 'Lyon',
      postalCode: '69001',
      website: 'https://eco-citoyens-lyon.fr',
      contactEmail: 'contact@eco-citoyens-lyon.fr',
      authorId: user2.id
    },
  })

  const initiative3 = await prisma.initiative.create({
    data: {
      title: 'Projet de Jardin Partagé',
      description: 'Création d\'un jardin partagé dans le quartier pour promouvoir l\'agriculture urbaine et la biodiversité.',
      type: 'PROJECT',
      latitude: 43.2965,
      longitude: 5.3698,
      address: '25 Boulevard Michelet',
      city: 'Marseille',
      postalCode: '13008',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-12-31'),
      contactEmail: 'jardin@example.com',
      authorId: user1.id
    },
  })

  // Créer quelques posts de forum
  const post1 = await prisma.forumPost.create({
    data: {
      title: 'Comment réduire ses déchets au quotidien ?',
      content: 'Je cherche des conseils pratiques pour réduire mes déchets ménagers. Quelles sont vos astuces ?',
      category: 'TIPS',
      authorId: user1.id
    },
  })

  const post2 = await prisma.forumPost.create({
    data: {
      title: 'Événement écologique à Paris',
      content: 'Il y a un grand événement écologique qui se prépare à Paris. Qui est intéressé pour y participer ?',
      category: 'EVENTS',
      authorId: user2.id
    },
  })

  // Créer quelques commentaires
  await prisma.forumComment.create({
    data: {
      content: 'Je recommande le compostage ! C\'est très efficace pour réduire les déchets organiques.',
      authorId: user2.id,
      postId: post1.id,

    },
  })

  await prisma.forumComment.create({
    data: {
      content: 'Moi aussi je suis intéressé ! Quand est-ce que ça se passe ?',
      authorId: user1.id,
      postId: post2.id,

    },
  })

  // Créer quelques conseils écologiques
  const tip1 = await prisma.tip.create({
    data: {
      title: 'Remplacer les bouteilles en plastique',
      content: 'Utilisez une gourde réutilisable en inox ou en verre. Cela permet d\'économiser des centaines de bouteilles en plastique par an !',
      category: 'WASTE_REDUCTION',
      authorId: user1.id
    },
  })

  const tip2 = await prisma.tip.create({
    data: {
      title: 'Économiser l\'énergie avec les LED',
      content: 'Remplacez vos ampoules classiques par des LED. Elles consomment jusqu\'à 80% moins d\'énergie et durent plus longtemps.',
      category: 'ENERGY_SAVING',
      authorId: user2.id
    },
  })

  const tip3 = await prisma.tip.create({
    data: {
      title: 'Privilégier les transports en commun',
      content: 'Pour vos trajets quotidiens, privilégiez les transports en commun, le vélo ou la marche. C\'est bon pour la planète et pour votre santé !',
      category: 'TRANSPORT',
      authorId: user1.id
    },
  })

  // Créer quelques articles de test
  const article1 = await prisma.article.create({
    data: {
      title: 'L\'impact du changement climatique sur la biodiversité française',
      content: `Le changement climatique représente l'un des plus grands défis de notre époque, avec des conséquences directes sur la biodiversité française.

Les températures moyennes en France ont augmenté de 1,7°C depuis 1900, un rythme plus rapide que la moyenne mondiale. Cette hausse affecte directement les écosystèmes et les espèces qui les habitent.

**Les impacts observés :**

1. **Modification des cycles de vie** : De nombreuses espèces voient leurs cycles de reproduction et de migration perturbés par les changements de température.

2. **Déplacement des habitats** : Les espèces migrent vers le nord ou en altitude pour trouver des conditions climatiques favorables.

3. **Perturbation des interactions** : Les relations entre espèces (pollinisation, prédation) sont déséquilibrées.

**Solutions locales :**

- Création de corridors écologiques
- Protection des zones humides
- Réduction des émissions de gaz à effet de serre
- Éducation et sensibilisation

La France, avec sa riche biodiversité, a un rôle crucial à jouer dans la protection de l'environnement. Chaque action locale compte dans cette lutte globale.`,
      excerpt: 'Analyse approfondie des conséquences du réchauffement climatique sur les écosystèmes français et les solutions pour y faire face.',
      category: 'CLIMATE_CHANGE',
      imageUrl: 'https://images.unsplash.com/photo-1569163136547-3c23a60a1c2d?w=800&h=400&fit=crop',
      authorId: user1.id,
      publishedAt: new Date('2024-01-15')
    },
  })

  const article2 = await prisma.article.create({
    data: {
      title: 'Les énergies renouvelables : l\'avenir de la production électrique',
      content: `Les énergies renouvelables représentent aujourd'hui la solution la plus viable pour décarboner notre production électrique et lutter contre le changement climatique.

**Les différentes sources d'énergies renouvelables :**

1. **Énergie solaire** : La France dispose d'un excellent potentiel solaire, particulièrement dans le sud du pays. Les panneaux photovoltaïques peuvent être installés sur les toits, les parkings ou en centrales au sol.

2. **Énergie éolienne** : L'éolien terrestre et offshore offre un potentiel considérable. La France possède le deuxième gisement éolien d'Europe.

3. **Énergie hydraulique** : Avec ses nombreux cours d'eau, la France bénéficie d'une hydroélectricité mature et fiable.

4. **Biomasse** : La valorisation des déchets organiques et du bois énergie contribue à la transition énergétique.

**Avantages des énergies renouvelables :**

- Réduction des émissions de CO2
- Indépendance énergétique
- Création d'emplois locaux
- Prix de l'électricité plus stable
- Décentralisation de la production

**Défis à relever :**

- Intermittence de certaines sources
- Besoin de stockage
- Acceptabilité sociale
- Coûts d'investissement initiaux

La transition vers les énergies renouvelables est en marche et s'accélère. Chaque citoyen peut contribuer en installant des panneaux solaires, en choisissant un fournisseur d'énergie verte ou en investissant dans des projets citoyens.`,
      excerpt: 'Découvrez comment les énergies renouvelables révolutionnent la production électrique et contribuent à la transition écologique.',
      category: 'RENEWABLE_ENERGY',
      imageUrl: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=400&fit=crop',
      authorId: admin.id,
      publishedAt: new Date('2024-02-20')
    },
  })

  const article3 = await prisma.article.create({
    data: {
      title: 'L\'économie circulaire : un modèle économique durable',
      content: `L'économie circulaire propose un nouveau modèle économique qui s'oppose au modèle linéaire traditionnel "extraire, produire, consommer, jeter".

**Les principes de l'économie circulaire :**

1. **Écoconception** : Concevoir des produits en pensant à leur fin de vie dès le départ
2. **Réduction des déchets** : Minimiser la production de déchets à chaque étape
3. **Réutilisation** : Donner une seconde vie aux produits et composants
4. **Recyclage** : Transformer les déchets en nouvelles ressources
5. **Récupération d'énergie** : Valoriser énergétiquement les déchets non recyclables

**Exemples concrets en France :**

- **L'industrie textile** : Recyclage des vêtements en nouvelles fibres
- **Le secteur du bâtiment** : Réutilisation des matériaux de déconstruction
- **L'agriculture** : Compostage et méthanisation des déchets organiques
- **L'électronique** : Réparation et recyclage des composants

**Bénéfices pour l'environnement :**

- Réduction de l'extraction de ressources naturelles
- Diminution des émissions de gaz à effet de serre
- Limitation de la pollution
- Préservation de la biodiversité

**Bénéfices économiques :**

- Création d'emplois locaux
- Réduction des coûts de production
- Innovation et compétitivité
- Résilience face aux crises

L'économie circulaire n'est pas seulement un concept, c'est une réalité qui se développe partout en France. Chaque citoyen peut participer en privilégiant les produits durables, en réparant plutôt qu'en jetant, et en triant ses déchets.`,
      excerpt: 'Découvrez comment l\'économie circulaire transforme notre modèle économique pour un avenir plus durable.',
      category: 'CIRCULAR_ECONOMY',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
      authorId: user1.id,
      publishedAt: new Date('2024-03-10')
    },
  })

  console.log('✅ Seeding terminé !')
  console.log(`👤 Admin créé: ${admin.email}`)
  console.log(`👥 Utilisateurs créés: ${user1.email}, ${user2.email}`)
  console.log(`🗺️ Initiatives créées: ${initiative1.title}, ${initiative2.title}, ${initiative3.title}`)
  console.log(`💬 Posts créés: ${post1.title}, ${post2.title}`)
  console.log(`💡 Conseils créés: ${tip1.title}, ${tip2.title}, ${tip3.title}`)
  console.log(`📰 Articles créés: ${article1.title}, ${article2.title}, ${article3.title}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
