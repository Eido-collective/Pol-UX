const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Coordonnées de référence pour la France
const FRANCE_BOUNDS = {
  minLat: 41.0,  // Sud de la France
  maxLat: 51.0,  // Nord de la France
  minLng: -5.0,  // Ouest de la France (longitude négative)
  maxLng: 10.0   // Est de la France
};

function isInFrance(lat, lng) {
  return lat >= FRANCE_BOUNDS.minLat && 
         lat <= FRANCE_BOUNDS.maxLat && 
         lng >= FRANCE_BOUNDS.minLng && 
         lng <= FRANCE_BOUNDS.maxLng;
}

function needsCorrection(lat, lng) {
  // Si les coordonnées sont déjà en France, pas besoin de correction
  if (isInFrance(lat, lng)) {
    return false;
  }
  
  // Si les coordonnées inversées sont en France, alors il faut corriger
  if (isInFrance(lng, lat)) {
    return true;
  }
  
  // Si aucune des deux positions n'est en France, on ne corrige pas
  return false;
}

async function fixCoordinates() {
  console.log('🔧 Correction intelligente des coordonnées GPS...\n');
  
  try {
    const initiatives = await prisma.initiative.findMany({
      where: {
        latitude: { not: 0 },
        longitude: { not: 0 }
      }
    });

    console.log(`📊 ${initiatives.length} initiatives trouvées avec des coordonnées non nulles\n`);

    let fixedCount = 0;
    let alreadyCorrectCount = 0;
    let errorCount = 0;

    for (const initiative of initiatives) {
      try {
        const oldLat = initiative.latitude;
        const oldLng = initiative.longitude;
        
        if (needsCorrection(oldLat, oldLng)) {
          // Inverser latitude et longitude
          const newLat = oldLng;
          const newLng = oldLat;

          await prisma.initiative.update({
            where: { id: initiative.id },
            data: {
              latitude: newLat,
              longitude: newLng
            }
          });

          console.log(`✅ ${initiative.title}:`);
          console.log(`   📍 ${oldLat}, ${oldLng} → ${newLat}, ${newLng}`);
          console.log(`   🏙️  ${initiative.city}`);
          console.log('');
          
          fixedCount++;
        } else {
          console.log(`✅ ${initiative.title}:`);
          console.log(`   📍 ${oldLat}, ${oldLng} (déjà correct)`);
          console.log(`   🏙️  ${initiative.city}`);
          console.log('');
          
          alreadyCorrectCount++;
        }
      } catch (error) {
        console.error(`❌ Erreur pour ${initiative.title}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Correction terminée:`);
    console.log(`✅ ${fixedCount} coordonnées corrigées`);
    console.log(`✅ ${alreadyCorrectCount} coordonnées déjà correctes`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function previewCoordinates() {
  console.log('👀 Aperçu des coordonnées actuelles...\n');
  
  try {
    const initiatives = await prisma.initiative.findMany({
      where: {
        latitude: { not: 0 },
        longitude: { not: 0 }
      },
      select: {
        id: true,
        title: true,
        latitude: true,
        longitude: true,
        city: true
      }
    });

    console.log(`📊 ${initiatives.length} initiatives avec coordonnées non nulles\n`);

    let franceCount = 0;
    let africaCount = 0;
    let otherCount = 0;

    initiatives.forEach((initiative, index) => {
      const { latitude, longitude } = initiative;
      
      let status = '';
      let suggestion = '';

      if (isInFrance(latitude, longitude)) {
        status = '🇫🇷 En France (correct)';
        franceCount++;
      } else if (isInFrance(longitude, latitude)) {
        status = '🌍 Inversé (à corriger)';
        suggestion = `→ ${longitude}, ${latitude}`;
        africaCount++;
      } else {
        status = '❓ Position inconnue';
        otherCount++;
      }

      console.log(`${index + 1}. ${initiative.title}`);
      console.log(`   📍 ${latitude}, ${longitude} (${status})`);
      if (suggestion) {
        console.log(`   🔧 ${suggestion}`);
      }
      console.log(`   🏙️  ${initiative.city}`);
      console.log('');
    });

    console.log('📈 Résumé:');
    console.log(`🇫🇷 En France: ${franceCount}`);
    console.log(`🌍 Inversées: ${africaCount}`);
    console.log(`❓ Autres: ${otherCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
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
        console.log('⚠️  ATTENTION: Ce script va corriger intelligemment les coordonnées GPS');
        console.log('   Seules les coordonnées manifestement incorrectes seront corrigées\n');
        
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
        console.log('  node scripts/fix-coordinates-smart.js preview  - Afficher les coordonnées');
        console.log('  node scripts/fix-coordinates-smart.js fix      - Corriger les coordonnées');
        break;
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

main();
