const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour détecter si une URL est une image
function isImageUrl(url) {
  if (!url) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.tiff'];
  const imageDomains = ['images.unsplash.com', 'imgur.com', 'i.imgur.com', 'cdn.example.com'];
  
  const lowerUrl = url.toLowerCase();
  
  // Vérifier les extensions d'image
  for (const ext of imageExtensions) {
    if (lowerUrl.includes(ext)) {
      return true;
    }
  }
  
  // Vérifier les domaines d'images connus
  for (const domain of imageDomains) {
    if (lowerUrl.includes(domain)) {
      return true;
    }
  }
  
  // Vérifier les patterns d'URL d'images
  if (lowerUrl.includes('/image/') || lowerUrl.includes('/img/') || lowerUrl.includes('/photos/')) {
    return true;
  }
  
  return false;
}

// Fonction pour analyser les URLs des tips
async function analyzeTipUrls() {
  console.log('🔍 Analyse des URLs des tips...\n');
  
  try {
    const tips = await prisma.tip.findMany({
      where: {
        imageUrl: {
          not: null
        }
      }
    });

    console.log(`📊 ${tips.length} tips avec des imageUrl trouvés\n`);

    tips.forEach((tip, index) => {
      const isImage = isImageUrl(tip.imageUrl);
      console.log(`${index + 1}. ${tip.title}`);
      console.log(`   URL: ${tip.imageUrl}`);
      console.log(`   Type: ${isImage ? '🖼️  Image' : '🔗 Lien/Source'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour analyser les URLs des articles
async function analyzeArticleUrls() {
  console.log('🔍 Analyse des URLs des articles...\n');
  
  try {
    const articles = await prisma.article.findMany({
      where: {
        imageUrl: {
          not: null
        }
      }
    });

    console.log(`📊 ${articles.length} articles avec des imageUrl trouvés\n`);

    articles.forEach((article, index) => {
      const isImage = isImageUrl(article.imageUrl);
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   URL: ${article.imageUrl}`);
      console.log(`   Type: ${isImage ? '🖼️  Image' : '🔗 Lien/Source'}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour corriger les URLs des tips
async function fixTipUrls() {
  console.log('🔧 Correction des URLs des tips...\n');
  
  try {
    const tips = await prisma.tip.findMany({
      where: {
        imageUrl: {
          not: null
        }
      }
    });

    let correctedCount = 0;
    let imageCount = 0;

    for (const tip of tips) {
      const isImage = isImageUrl(tip.imageUrl);
      
      if (isImage) {
        imageCount++;
        console.log(`✅ ${tip.title}: Gardé comme image - ${tip.imageUrl}`);
      } else {
        // Déplacer vers source
        await prisma.tip.update({
          where: { id: tip.id },
          data: {
            imageUrl: null,
            source: tip.imageUrl
          }
        });
        
        console.log(`🔄 ${tip.title}: Déplacé vers source - ${tip.imageUrl}`);
        correctedCount++;
      }
    }

    console.log(`\n🎉 Correction terminée:`);
    console.log(`✅ ${imageCount} images conservées`);
    console.log(`🔄 ${correctedCount} URLs déplacées vers source`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour corriger les URLs des articles
async function fixArticleUrls() {
  console.log('🔧 Correction des URLs des articles...\n');
  
  try {
    const articles = await prisma.article.findMany({
      where: {
        imageUrl: {
          not: null
        }
      }
    });

    let correctedCount = 0;
    let imageCount = 0;

    for (const article of articles) {
      const isImage = isImageUrl(article.imageUrl);
      
      if (isImage) {
        imageCount++;
        console.log(`✅ ${article.title}: Gardé comme image - ${article.imageUrl}`);
      } else {
        // Déplacer vers source
        await prisma.article.update({
          where: { id: article.id },
          data: {
            imageUrl: null,
            source: article.imageUrl
          }
        });
        
        console.log(`🔄 ${article.title}: Déplacé vers source - ${article.imageUrl}`);
        correctedCount++;
      }
    }

    console.log(`\n🎉 Correction terminée:`);
    console.log(`✅ ${imageCount} images conservées`);
    console.log(`🔄 ${correctedCount} URLs déplacées vers source`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction principale
async function main() {
  const command = process.argv[2];
  const type = process.argv[3]; // 'tips' ou 'articles'

  try {
    if (command === 'analyze') {
      if (type === 'tips') {
        await analyzeTipUrls();
      } else if (type === 'articles') {
        await analyzeArticleUrls();
      } else {
        console.log('Analyse des tips:');
        await analyzeTipUrls();
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('Analyse des articles:');
        await analyzeArticleUrls();
      }
    } else if (command === 'fix') {
      console.log('⚠️  ATTENTION: Ce script va déplacer les URLs non-images vers la colonne source');
      console.log('   Assurez-vous d\'avoir une sauvegarde si nécessaire\n');
      
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Êtes-vous sûr de vouloir continuer ? (oui/non): ', resolve);
      });
      rl.close();
      
      if (answer.toLowerCase() !== 'oui' && answer.toLowerCase() !== 'o') {
        console.log('❌ Opération annulée');
        return;
      }
      
      if (type === 'tips') {
        await fixTipUrls();
      } else if (type === 'articles') {
        await fixArticleUrls();
      } else {
        console.log('Correction des tips:');
        await fixTipUrls();
        console.log('\n' + '='.repeat(50) + '\n');
        console.log('Correction des articles:');
        await fixArticleUrls();
      }
    } else {
      console.log('Usage:');
      console.log('  node scripts/fix-image-urls.js analyze [tips|articles]  - Analyser les URLs');
      console.log('  node scripts/fix-image-urls.js fix [tips|articles]      - Corriger les URLs');
      console.log('');
      console.log('Exemples:');
      console.log('  node scripts/fix-image-urls.js analyze tips');
      console.log('  node scripts/fix-image-urls.js fix articles');
      console.log('  node scripts/fix-image-urls.js analyze');
      console.log('  node scripts/fix-image-urls.js fix');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
