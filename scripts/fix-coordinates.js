const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Coordonnées de référence pour la France
const FRANCE_BOUNDS = {
  minLat: 41.0,  // Sud de la France
  maxLat: 51.0,  // Nord de la France
  minLng: -5.0,  // Ouest de la France (longitude négative)
  maxLng: 10.0   // Est de la France
};

// Coordonnées de référence pour l'Afrique de l'Est (pour détecter les erreurs)
const EAST_AFRICA_BOUNDS = {
  minLat: -5.0,   // Sud de l'Afrique de l'Est
  maxLat: 15.0,   // Nord de l'Afrique de l'Est
  minLng: 30.0,   // Ouest de l'Afrique de l'Est
  maxLng: 55.0    // Est de l'Afrique de l'Est
};

function isInFrance(lat, lng) {
  return lat >= FRANCE_BOUNDS.minLat && 
         lat <= FRANCE_BOUNDS.maxLat && 
         lng >= FRANCE_BOUNDS.minLng && 
         lng <= FRANCE_BOUNDS.maxLng;
}

function isInEastAfrica(lat, lng) {
  return lat >= EAST_AFRICA_BOUNDS.minLat && 
         lat <= EAST_AFRICA_BOUNDS.maxLat && 
         lng >= EAST_AFRICA_BOUNDS.minLng && 
         lng <= EAST_AFRICA_BOUNDS.maxLng;
}

function fixCoordinates(lat, lng) {
  // Si les coordonnées sont en Afrique de l'Est, c'est probablement une erreur de signe
  if (isInEastAfrica(lat, lng)) {
    // Inverser le signe de la longitude (de positif à négatif)
    return { lat, lng: -lng };
  }
  
  // Si les coordonnées sont complètement hors de France mais pas en Afrique
  if (!isInFrance(lat, lng)) {
    // Essayer d'inverser le signe de la longitude
    const correctedLng = -lng;
    if (isInFrance(lat, correctedLng)) {
      return { lat, lng: correctedLng };
    }
  }
  
  return { lat, lng };
}

async function previewCoordinates() {
  console.log('👀 Aperçu des coordonnées actuelles...\n');
  
  try {
    const initiatives = await prisma.initiative.findMany({
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        city: true
      }
    });

    console.log(`📊 ${initiatives.length} initiatives trouvées\n`);

    let franceCount = 0;
    let africaCount = 0;
    let otherCount = 0;

    initiatives.forEach((initiative, index) => {
      const { latitude, longitude } = initiative;
      
      let location = '❓ Inconnu';
      let needsFix = false;
      let fixSuggestion = '';

      if (isInFrance(latitude, longitude)) {
        location = '🇫🇷 France';
        franceCount++;
      } else if (isInEastAfrica(latitude, longitude)) {
        location = '🌍 Afrique de l\'Est';
        africaCount++;
        needsFix = true;
        const fixed = fixCoordinates(latitude, longitude);
        fixSuggestion = `→ ${fixed.lat}, ${fixed.lng}`;
      } else {
        location = '🌍 Autre';
        otherCount++;
        needsFix = true;
        const fixed = fixCoordinates(latitude, longitude);
        if (isInFrance(fixed.lat, fixed.lng)) {
          fixSuggestion = `→ ${fixed.lat}, ${fixed.lng} (France)`;
        }
      }

      console.log(`${index + 1}. ${initiative.title}`);
      console.log(`   📍 ${latitude}, ${longitude} (${location})`);
      if (needsFix && fixSuggestion) {
        console.log(`   🔧 ${fixSuggestion}`);
      }
      console.log(`   🏙️  ${initiative.city}`);
      console.log('');
    });

    console.log('📈 Résumé:');
    console.log(`🇫🇷 En France: ${franceCount}`);
    console.log(`🌍 En Afrique de l'Est: ${africaCount}`);
    console.log(`🌍 Autre: ${otherCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function fixCoordinates() {
  console.log('🔧 Correction des coordonnées GPS...\n');
  
  try {
    const initiatives = await prisma.initiative.findMany();

    let fixedCount = 0;
    let errorCount = 0;

    for (const initiative of initiatives) {
      try {
        const { latitude, longitude } = initiative;
        const fixed = fixCoordinates(latitude, longitude);

        // Vérifier si une correction est nécessaire
        if (fixed.lng !== longitude) {
          await prisma.initiative.update({
            where: { id: initiative.id },
            data: {
              longitude: fixed.lng
            }
          });

          console.log(`✅ ${initiative.title}:`);
          console.log(`   📍 ${latitude}, ${longitude} → ${fixed.lat}, ${fixed.lng}`);
          console.log(`   🏙️  ${initiative.city}`);
          console.log('');
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${initiative.title}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Correction terminée:`);
    console.log(`✅ ${fixedCount} coordonnées corrigées`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

async function main() {
  const command = process.argv[2];

  try {
    switch (command) {
      case 'preview':
        await previewCoordinates();
        break;
      case 'fix':
        console.log('⚠️  ATTENTION: Ce script va corriger les coordonnées GPS');
        console.log('   Assurez-vous d\'avoir une sauvegarde si nécessaire\n');
        
        const readline = require('readline');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });

        rl.question('Êtes-vous sûr de vouloir continuer ? (oui/non): ', async (answer) => {
          rl.close();
          if (answer.toLowerCase() === 'oui') {
            await fixCoordinates();
          } else {
            console.log('❌ Opération annulée');
          }
        });
        break;
      default:
        console.log('Usage:');
        console.log('  node scripts/fix-coordinates.js preview  - Afficher les coordonnées');
        console.log('  node scripts/fix-coordinates.js fix      - Corriger les coordonnées');
        break;
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
