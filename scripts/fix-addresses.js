const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour parser une adresse française
function parseFrenchAddress(address) {
  if (!address || address === 'null' || address === '') {
    return {
      street: '',
      city: '',
      postalCode: ''
    };
  }

  // Nettoyer l'adresse
  let cleanAddress = address.trim();
  
  // Supprimer les doublons et nettoyer
  cleanAddress = cleanAddress.replace(/,?\s*France\s*(métropolitaine)?,?\s*$/i, '');
  cleanAddress = cleanAddress.replace(/\s+/g, ' ');
  
  // Gérer les cas spéciaux avec espaces dans le code postal
  cleanAddress = cleanAddress.replace(/(\d{2})\s+(\d{3})/, '$1$2');
  
  // Patterns pour extraire le code postal et la ville
  const patterns = [
    // Pattern: "Rue, 75000 Ville"
    /^(.+?),\s*(\d{5})\s+(.+)$/,
    // Pattern: "Rue 75000 Ville"
    /^(.+?)\s+(\d{5})\s+(.+)$/,
    // Pattern: "Rue, Ville 75000"
    /^(.+?),\s*(.+?)\s+(\d{5})$/,
    // Pattern: "Rue Ville 75000"
    /^(.+?)\s+(.+?)\s+(\d{5})$/
  ];

  for (const pattern of patterns) {
    const match = cleanAddress.match(pattern);
    if (match) {
      return {
        street: match[1].trim(),
        postalCode: match[2].trim(),
        city: match[3].trim()
      };
    }
  }

  // Si aucun pattern ne fonctionne, essayer de trouver le code postal
  const postalCodeMatch = cleanAddress.match(/\b(\d{5})\b/);
  if (postalCodeMatch) {
    const postalCode = postalCodeMatch[1];
    const parts = cleanAddress.split(postalCode);
    
    if (parts.length >= 2) {
      let beforePostal = parts[0].trim().replace(/,\s*$/, '');
      let afterPostal = parts[1].trim().replace(/^\s*,\s*/, '');
      
      // Nettoyer la ville
      afterPostal = afterPostal.replace(/^\s*,\s*/, '');
      afterPostal = afterPostal.replace(/,\s*France\s*$/i, '');
      
      // Si la rue est vide, prendre la première partie
      if (!beforePostal && afterPostal) {
        const afterParts = afterPostal.split(',');
        if (afterParts.length > 1) {
          beforePostal = afterParts[0].trim();
          afterPostal = afterParts.slice(1).join(',').trim();
        }
      }
      
      return {
        street: beforePostal,
        postalCode: postalCode,
        city: afterPostal
      };
    }
  }

  // Fallback: tout dans street
  return {
    street: cleanAddress,
    city: '',
    postalCode: ''
  };
}

// Fonction pour corriger les adresses des initiatives
async function fixInitiativeAddresses() {
  console.log('🔧 Correction des adresses des initiatives...');
  
  try {
    const initiatives = await prisma.initiative.findMany();

    console.log(`📊 ${initiatives.length} initiatives trouvées avec des adresses`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const initiative of initiatives) {
      try {
        const parsedAddress = parseFrenchAddress(initiative.address);
        
        // Mettre à jour l'initiative
        await prisma.initiative.update({
          where: { id: initiative.id },
          data: {
            address: parsedAddress.street,
            city: parsedAddress.city,
            postalCode: parsedAddress.postalCode
          }
        });

        console.log(`✅ ${initiative.title}: "${initiative.address}" → "${parsedAddress.street}" | "${parsedAddress.city}" | "${parsedAddress.postalCode}"`);
        updatedCount++;
      } catch (error) {
        console.error(`❌ Erreur pour ${initiative.title}:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 Correction terminée:`);
    console.log(`✅ ${updatedCount} initiatives mises à jour`);
    if (errorCount > 0) {
      console.log(`❌ ${errorCount} erreurs`);
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Fonction pour afficher un aperçu des adresses
async function previewAddresses() {
  console.log('👀 Aperçu des adresses actuelles...\n');
  
  try {
    const initiatives = await prisma.initiative.findMany({
      take: 10
    });

    console.log('📋 Exemples d\'adresses actuelles:');
    initiatives.forEach((initiative, index) => {
      console.log(`${index + 1}. ${initiative.title}`);
      console.log(`   Address: "${initiative.address}"`);
      console.log(`   City: "${initiative.city}"`);
      console.log(`   Postal: "${initiative.postalCode}"`);
      
      const parsed = parseFrenchAddress(initiative.address);
      console.log(`   → Parsed: "${parsed.street}" | "${parsed.city}" | "${parsed.postalCode}"`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction principale
async function main() {
  const command = process.argv[2];

  try {
    if (command === 'preview') {
      await previewAddresses();
    } else if (command === 'fix') {
      console.log('⚠️  ATTENTION: Ce script va modifier les adresses dans la base de données');
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
      
      await fixInitiativeAddresses();
    } else {
      console.log('Usage:');
      console.log('  node scripts/fix-addresses.js preview  - Aperçu des adresses');
      console.log('  node scripts/fix-addresses.js fix      - Corriger les adresses');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
