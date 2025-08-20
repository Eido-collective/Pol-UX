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
      authorId: user1.id,
      isApproved: true,
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
      authorId: user2.id,
      isApproved: true,
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
      authorId: user1.id,
      isApproved: true,
    },
  })

  // Créer quelques posts de forum
  const post1 = await prisma.forumPost.create({
    data: {
      title: 'Comment réduire ses déchets au quotidien ?',
      content: 'Je cherche des conseils pratiques pour réduire mes déchets ménagers. Quelles sont vos astuces ?',
      category: 'TIPS',
      authorId: user1.id,
      isApproved: true,
    },
  })

  const post2 = await prisma.forumPost.create({
    data: {
      title: 'Événement écologique à Paris',
      content: 'Il y a un grand événement écologique qui se prépare à Paris. Qui est intéressé pour y participer ?',
      category: 'EVENTS',
      authorId: user2.id,
      isApproved: true,
    },
  })

  // Créer quelques commentaires
  await prisma.forumComment.create({
    data: {
      content: 'Je recommande le compostage ! C\'est très efficace pour réduire les déchets organiques.',
      authorId: user2.id,
      postId: post1.id,
      isApproved: true,
    },
  })

  await prisma.forumComment.create({
    data: {
      content: 'Moi aussi je suis intéressé ! Quand est-ce que ça se passe ?',
      authorId: user1.id,
      postId: post2.id,
      isApproved: true,
    },
  })

  // Créer quelques conseils écologiques
  const tip1 = await prisma.tip.create({
    data: {
      title: 'Remplacer les bouteilles en plastique',
      content: 'Utilisez une gourde réutilisable en inox ou en verre. Cela permet d\'économiser des centaines de bouteilles en plastique par an !',
      category: 'WASTE_REDUCTION',
      authorId: user1.id,
      isApproved: true,
    },
  })

  const tip2 = await prisma.tip.create({
    data: {
      title: 'Économiser l\'énergie avec les LED',
      content: 'Remplacez vos ampoules classiques par des LED. Elles consomment jusqu\'à 80% moins d\'énergie et durent plus longtemps.',
      category: 'ENERGY_SAVING',
      authorId: user2.id,
      isApproved: true,
    },
  })

  const tip3 = await prisma.tip.create({
    data: {
      title: 'Privilégier les transports en commun',
      content: 'Pour vos trajets quotidiens, privilégiez les transports en commun, le vélo ou la marche. C\'est bon pour la planète et pour votre santé !',
      category: 'TRANSPORT',
      authorId: user1.id,
      isApproved: true,
    },
  })

  console.log('✅ Seeding terminé !')
  console.log(`👤 Admin créé: ${admin.email}`)
  console.log(`👥 Utilisateurs créés: ${user1.email}, ${user2.email}`)
  console.log(`🗺️ Initiatives créées: ${initiative1.title}, ${initiative2.title}, ${initiative3.title}`)
  console.log(`💬 Posts créés: ${post1.title}, ${post2.title}`)
  console.log(`💡 Conseils créés: ${tip1.title}, ${tip2.title}, ${tip3.title}`)
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
