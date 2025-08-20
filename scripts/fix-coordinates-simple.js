const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCoordinates() {
  console.log('🔧 Correction des coordonnées GPS (inversion latitude/longitude)...\n');
  
  try {
    const initiatives = await prisma.initiative.findMany({
      where: {
        latitude: { not: 0 },
        longitude: { not: 0 }
      }
    });

    console.log(`📊 ${initiatives.length} initiatives trouvées avec des coordonnées non nulles\n`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const initiative of initiatives) {
      try {
        const oldLat = initiative.latitude;
        const oldLng = initiative.longitude;
        
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
      },
      take: 10
    });

    console.log(`📊 ${initiatives.length} initiatives avec coordonnées non nulles\n`);

    initiatives.forEach((initiative, index) => {
      const { latitude, longitude } = initiative;
      
      console.log(`${index + 1}. ${initiative.title}`);
      console.log(`   📍 Actuel: ${latitude}, ${longitude}`);
      console.log(`   🔧 Après correction: ${longitude}, ${latitude}`);
      console.log(`   🏙️  ${initiative.city}`);
      console.log('');
    });

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
        console.log('⚠️  ATTENTION: Ce script va inverser latitude et longitude');
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
        console.log('  node scripts/fix-coordinates-simple.js preview  - Afficher les coordonnées');
        console.log('  node scripts/fix-coordinates-simple.js fix      - Corriger les coordonnées');
        break;
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

main();
