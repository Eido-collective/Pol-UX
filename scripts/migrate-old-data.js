const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { extractSQLData, parseTags, parseLocation } = require('./parse-sql-data');

const prisma = new PrismaClient();

// Vérifier si on est en mode test
const isTestMode = process.argv.includes('--test');

// Mapping des catégories
const tipCategoryMapping = {
  'Numérique': 'OTHER',
  'Accessibilité': 'OTHER',
  'IA': 'OTHER',
  'Environnement': 'OTHER',
  'Guide': 'OTHER',
  'Outil': 'OTHER',
  'Rapport': 'OTHER',
  'Méthode': 'OTHER',
  'Vidéo': 'OTHER',
  'Livre': 'OTHER',
  'Manifeste': 'OTHER',
  'Référentiel': 'OTHER',
  'Aide': 'OTHER',
  'Conseils': 'OTHER',
  'Éthique': 'OTHER',
  'Responsable': 'OTHER',
  'Sobriété': 'OTHER',
  'Impact': 'OTHER',
  'Lecture': 'OTHER'
};

const articleCategoryMapping = {
  'IA': 'GREEN_TECHNOLOGY',
  'Environnement': 'ENVIRONMENT',
  'Numérique': 'SUSTAINABILITY',
  'Accessibilité': 'EDUCATION',
  'Éthique': 'EDUCATION',
  'Sobriété': 'SUSTAINABILITY',
  'Impact': 'ENVIRONMENT',
  'Ressources': 'SUSTAINABILITY',
  'Design': 'EDUCATION',
  'Développement': 'GREEN_TECHNOLOGY',
  'Web': 'GREEN_TECHNOLOGY',
  'SEO': 'GREEN_TECHNOLOGY',
  'Green SEO': 'GREEN_TECHNOLOGY',
  'Numérique responsable': 'SUSTAINABILITY',
  'Green Hosting': 'GREEN_TECHNOLOGY',
  'Hébergement vert': 'GREEN_TECHNOLOGY',
  'Éco-conception': 'GREEN_TECHNOLOGY',
  'Déclaration': 'SUSTAINABILITY',
  'Responsable': 'SUSTAINABILITY',
  'Cognitif': 'EDUCATION',
  'Data Center': 'GREEN_TECHNOLOGY',
  'Réseau': 'GREEN_TECHNOLOGY',
  'Public': 'POLICY',
  'Sobriété': 'SUSTAINABILITY',
  'Éthique': 'EDUCATION',
  'Collectif': 'EDUCATION',
  'Banque': 'POLICY',
  'Association': 'EDUCATION',
  'Agence': 'GREEN_TECHNOLOGY',
  'Coopérative': 'SUSTAINABILITY',
  'ESUS': 'EDUCATION',
  'Média': 'EDUCATION',
  'Collectif': 'EDUCATION'
};

const initiativeTypeMapping = {
  'Rencontre': 'EVENT',
  'Green It': 'EVENT',
  'Physique': 'EVENT',
  'Conférence': 'EVENT',
  'Forum': 'EVENT',
  'Webinaire': 'EVENT',
  'Table-ronde': 'EVENT',
  'Conference': 'EVENT',
  'Webinair': 'EVENT',
  'Hackathon': 'EVENT',
  'Entreprise': 'COMPANY',
  'Association': 'ACTOR',
  'Collectif': 'ACTOR',
  'Agence': 'COMPANY',
  'Coopérative': 'COMPANY',
  'ESUS': 'ACTOR',
  'Média': 'COMPANY',
  'Banque': 'COMPANY',
  'SAS': 'COMPANY',
  'Espace': 'ACTOR',
  'Numérique responsable': 'COMPANY',
  'Eco-conception digitale': 'COMPANY',
  'Développeur Web, Accessibilité, éco-conception, desiger graphique': 'COMPANY'
};

const forumCategoryMapping = {
  'réparation': 'GENERAL',
  'matériel': 'GENERAL',
  'paris': 'GENERAL',
  'atelier': 'GENERAL',
  'écologie': 'GENERAL',
  'initiatives': 'GENERAL',
  'numérique': 'GENERAL',
  'développement': 'GENERAL'
};

// Fonction pour mapper les catégories
function mapCategory(tags, mapping) {
  if (!tags || tags.length === 0) return mapping['Numérique'] || 'OTHER';
  
  for (const tag of tags) {
    if (mapping[tag]) {
      return mapping[tag];
    }
  }
  return mapping['Numérique'] || 'OTHER';
}

// Fonction pour créer un username à partir de l'email
function generateUsername(email) {
  const base = email.split('@')[0];
  return base.replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);
}

async function migrateUsers() {
  console.log('🔄 Migration des utilisateurs...');
  
  const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
  let migratedCount = 0;
  
  for (const userData of usersData) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });
      
      if (!existingUser) {
        if (!isTestMode) {
          await prisma.user.create({
            data: {
              id: userData.id,
              email: userData.email,
              password: userData.encrypted_password,
              username: generateUsername(userData.email),
              emailConfirmed: true,
              createdAt: new Date(userData.created_at),
              updatedAt: new Date(userData.updated_at)
            }
          });
        }
        migratedCount++;
      }
    } catch (error) {
      console.error(`Erreur lors de la migration de l'utilisateur ${userData.email}:`, error.message);
    }
  }
  
  console.log(`✅ Migration des utilisateurs terminée: ${migratedCount} utilisateurs migrés`);
}

async function migrateTips() {
  console.log('🔄 Migration des conseils...');
  
  const tipsData = extractSQLData(path.join(__dirname, '../data/advices_rows.sql'));
  
  if (tipsData.length === 0) {
    console.log('Aucune donnée de conseils trouvée');
    return;
  }
  
  let migratedCount = 0;
  
  // Ignorer la première ligne (en-têtes) et traiter les données
  for (let i = 1; i < tipsData.length; i++) {
    const values = tipsData[i];
    try {
      const [id, title, content, author, publishDate, tags, imageUrl, other, published] = values;
      
      if (published === 'true') {
        const parsedTags = parseTags(tags);
        const category = mapCategory(parsedTags, tipCategoryMapping);
        
        // Trouver un utilisateur existant ou utiliser un utilisateur par défaut
        const existingUser = await prisma.user.findFirst();
        if (!existingUser) {
          console.log('Aucun utilisateur trouvé pour créer les conseils');
          continue;
        }
        
        if (!isTestMode) {
          await prisma.tip.create({
            data: {
              id: id,
              title: title || 'Conseil sans titre',
              content: content || '',
              category: category,
              imageUrl: imageUrl || null,
              isPublished: true,
              createdAt: publishDate ? new Date(publishDate) : new Date(),
              updatedAt: new Date(),
              authorId: existingUser.id
            }
          });
        }
        
        migratedCount++;
      }
    } catch (error) {
      console.error('Erreur lors de la migration d\'un conseil:', error.message);
    }
  }
  
  console.log(`✅ Migration des conseils terminée: ${migratedCount} conseils migrés`);
}

async function migrateArticles() {
  console.log('🔄 Migration des articles...');
  
  const articlesData = extractSQLData(path.join(__dirname, '../data/articles_rows.sql'));
  
  if (articlesData.length === 0) {
    console.log('Aucune donnée d\'articles trouvée');
    return;
  }
  
  let migratedCount = 0;
  
  // Ignorer la première ligne (en-têtes) et traiter les données
  for (let i = 1; i < articlesData.length; i++) {
    const values = articlesData[i];
    try {
      const [id, title, content, author, publishDate, tags, imageUrl, other, published] = values;
      
      if (published === 'true') {
        const parsedTags = parseTags(tags);
        const category = mapCategory(parsedTags, articleCategoryMapping);
        
        // Trouver un utilisateur existant ou utiliser un utilisateur par défaut
        const existingUser = await prisma.user.findFirst();
        if (!existingUser) {
          console.log('Aucun utilisateur trouvé pour créer les articles');
          continue;
        }
        
        if (!isTestMode) {
          await prisma.article.create({
            data: {
              id: id,
              title: title || 'Article sans titre',
              content: content || '',
              excerpt: content ? content.substring(0, 200) + '...' : null,
              category: category,
              imageUrl: imageUrl || null,
              isPublished: true,
              publishedAt: publishDate ? new Date(publishDate) : new Date(),
              createdAt: publishDate ? new Date(publishDate) : new Date(),
              updatedAt: new Date(),
              authorId: existingUser.id
            }
          });
        }
        
        migratedCount++;
      }
    } catch (error) {
      console.error('Erreur lors de la migration d\'un article:', error.message);
    }
  }
  
  console.log(`✅ Migration des articles terminée: ${migratedCount} articles migrés`);
}

async function migrateInitiatives() {
  console.log('🔄 Migration des initiatives...');
  
  const initiativesData = extractSQLData(path.join(__dirname, '../data/initiatives_rows.sql'));
  
  if (initiativesData.length === 0) {
    console.log('Aucune donnée d\'initiatives trouvée');
    return;
  }
  
  let migratedCount = 0;
  
  // Ignorer la première ligne (en-têtes) et traiter les données
  for (let i = 1; i < initiativesData.length; i++) {
    const values = initiativesData[i];
    try {
      const [id, name, description, type, createdAt, organizationName, isVirtual, startDate, endDate, domains, tags, price, registrationLink, remainingTickets, accessInfo, website, createdBy, location, published] = values;
      
      if (published === 'true') {
        const parsedTags = parseTags(tags);
        const initiativeType = initiativeTypeMapping[type] || 'EVENT';
        const locationData = parseLocation(location);
        
        // Trouver un utilisateur existant ou utiliser un utilisateur par défaut
        const existingUser = await prisma.user.findFirst();
        if (!existingUser) {
          console.log('Aucun utilisateur trouvé pour créer les initiatives');
          continue;
        }
        
        if (!isTestMode) {
          await prisma.initiative.create({
            data: {
              id: id,
              title: name || 'Initiative sans titre',
              description: description || '',
              type: initiativeType,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              address: locationData.address,
              city: locationData.address.split(',')[0] || '',
              postalCode: '',
              startDate: startDate ? new Date(startDate) : null,
              endDate: endDate ? new Date(endDate) : null,
              website: website || null,
              contactEmail: null,
              contactPhone: null,
              imageUrl: null,
              isPublished: true,
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: new Date(),
              authorId: existingUser.id
            }
          });
        }
        
        migratedCount++;
      }
    } catch (error) {
      console.error('Erreur lors de la migration d\'une initiative:', error.message);
    }
  }
  
  console.log(`✅ Migration des initiatives terminée: ${migratedCount} initiatives migrées`);
}

async function migrateActors() {
  console.log('🔄 Migration des acteurs...');
  
  const actorsData = extractSQLData(path.join(__dirname, '../data/actors_rows.sql'));
  
  if (actorsData.length === 0) {
    console.log('Aucune donnée d\'acteurs trouvée');
    return;
  }
  
  let migratedCount = 0;
  
  // Ignorer la première ligne (en-têtes) et traiter les données
  for (let i = 1; i < actorsData.length; i++) {
    const values = actorsData[i];
    try {
      const [id, name, description, location, openingHours, domains, tags, crowdLevel, ratings, website, phone, email, type, firstName, lastName, profession, isOpen, createdAt, updatedAt, createdBy, category, published] = values;
      
      if (published === 'true') {
        const locationData = parseLocation(location);
        
        // Trouver un utilisateur existant ou utiliser un utilisateur par défaut
        const existingUser = await prisma.user.findFirst();
        if (!existingUser) {
          console.log('Aucun utilisateur trouvé pour créer les acteurs');
          continue;
        }
        
        if (!isTestMode) {
          await prisma.initiative.create({
            data: {
              id: id,
              title: name || 'Acteur sans nom',
              description: description || '',
              type: 'ACTOR',
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              address: locationData.address,
              city: locationData.address.split(',')[0] || '',
              postalCode: '',
              startDate: null,
              endDate: null,
              website: website || null,
              contactEmail: email || null,
              contactPhone: phone || null,
              imageUrl: null,
              isPublished: true,
              createdAt: createdAt ? new Date(createdAt) : new Date(),
              updatedAt: new Date(),
              authorId: existingUser.id
            }
          });
        }
        
        migratedCount++;
      }
    } catch (error) {
      console.error('Erreur lors de la migration d\'un acteur:', error.message);
    }
  }
  
  console.log(`✅ Migration des acteurs terminée: ${migratedCount} acteurs migrés`);
}

async function migrateForumPosts() {
  console.log('🔄 Migration des posts de forum...');
  
  const forumData = extractSQLData(path.join(__dirname, '../data/forum_topics_rows.sql'));
  
  if (forumData.length === 0) {
    console.log('Aucune donnée de forum trouvée');
    return;
  }
  
  let migratedCount = 0;
  
  // Ignorer la première ligne (en-têtes) et traiter les données
  for (let i = 1; i < forumData.length; i++) {
    const values = forumData[i];
    try {
      const [id, title, content, userId, authorName, createdAt, updatedAt, hashtags, views, isLocked] = values;
      
      // Trouver l'utilisateur par son ID ou créer un utilisateur par défaut
      let authorId = userId;
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!existingUser) {
        const defaultUser = await prisma.user.findFirst();
        if (defaultUser) {
          authorId = defaultUser.id;
        } else {
          console.log('Aucun utilisateur trouvé pour créer les posts de forum');
          continue;
        }
      }
      
      const parsedHashtags = parseTags(hashtags);
      const category = mapCategory(parsedHashtags, forumCategoryMapping);
      
      if (!isTestMode) {
        await prisma.forumPost.create({
          data: {
            id: id,
            title: title || 'Post sans titre',
            content: content || '',
            category: category,
            isPublished: true,
            createdAt: createdAt ? new Date(createdAt) : new Date(),
            updatedAt: new Date(),
            authorId: authorId
          }
        });
      }
      
      migratedCount++;
    } catch (error) {
      console.error('Erreur lors de la migration d\'un post de forum:', error.message);
    }
  }
  
  console.log(`✅ Migration des posts de forum terminée: ${migratedCount} posts migrés`);
}

async function main() {
  try {
    if (isTestMode) {
      console.log('🧪 Mode test activé - Aucune donnée ne sera écrite en base');
    }
    
    console.log('🚀 Début de la migration des données...');
    
    await migrateUsers();
    await migrateTips();
    await migrateArticles();
    await migrateInitiatives();
    await migrateActors();
    await migrateForumPosts();
    
    if (isTestMode) {
      console.log('🎉 Test de migration terminé avec succès !');
      console.log('Pour lancer la vraie migration, exécutez: node scripts/migrate-old-data.js');
    } else {
      console.log('🎉 Migration terminée avec succès !');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
