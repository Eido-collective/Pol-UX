const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Fonction pour afficher toutes les adresses actuelles
async function showAllAddresses() {
  console.log('📋 Toutes les adresses actuelles:\n');
  
  try {
    const initiatives = await prisma.initiative.findMany({
      orderBy: { title: 'asc' }
    });

    initiatives.forEach((initiative, index) => {
      console.log(`${index + 1}. ${initiative.title}`);
      console.log(`   ID: ${initiative.id}`);
      console.log(`   Address: "${initiative.address}"`);
      console.log(`   City: "${initiative.city}"`);
      console.log(`   Postal: "${initiative.postalCode}"`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Fonction pour corriger des initiatives spécifiques par leur titre
async function correctSpecificInitiatives() {
  const corrections = [
    {
      title: "Hubblo",
      address: "Rue François Pinson",
      city: "Châtillon",
      postalCode: "92320"
    },
    {
      title: "Latitudes",
      address: "84 avenue Paul Doumer",
      city: "Paris", 
      postalCode: "75116"
    },
    {
      title: "Emancip'Asso",
      address: "10 bis, Rue Jangot",
      city: "Lyon",
      postalCode: "69007"
    },
    {
      title: "Noesya",
      address: "5, Rue Frédéric Joliot Curie",
      city: "Cenon",
      postalCode: "33150"
    },
    {
      title: "Institut du Numérique Responsable (INR)",
      address: "23 avenue Albert Einstein",
      city: "La Rochelle",
      postalCode: "17031"
    },
    {
      title: "La Clik éthique",
      address: "",
      city: "Rennes",
      postalCode: "35000"
    },
    {
      title: "Les e-novateurs",
      address: "Boulevard Gambetta",
      city: "Villefranche-sur-Saône",
      postalCode: "69400"
    },
    {
      title: "Les Augures",
      address: "26, Rue des Montibœufs",
      city: "Paris",
      postalCode: "75020"
    },
    {
      title: "Talents For The Planet",
      address: "Parc Floral, Avenue des Minimes",
      city: "Paris",
      postalCode: "75012"
    },
    {
      title: "Pixelis",
      address: "127 Avenue Ledru-Rollin",
      city: "Paris",
      postalCode: "75011"
    },
    {
      title: "Faire mieux avec moins : Design et innovation dans le service public malgré les restrictions budgétaires",
      address: "127 Avenue Ledru-Rollin",
      city: "Paris",
      postalCode: "75011"
    }
  ];

  console.log('🎯 Correction des initiatives spécifiques...\n');

  let correctedCount = 0;

  for (const correction of corrections) {
    try {
      const result = await prisma.initiative.updateMany({
        where: {
          title: {
            contains: correction.title
          }
        },
        data: {
          address: correction.address,
          city: correction.city,
          postalCode: correction.postalCode
        }
      });

      if (result.count > 0) {
        console.log(`✅ ${correction.title}: "${correction.address}" | "${correction.city}" | "${correction.postalCode}"`);
        correctedCount += result.count;
      }
    } catch (error) {
      console.error(`❌ Erreur pour ${correction.title}:`, error.message);
    }
  }

  console.log(`\n🎉 ${correctedCount} initiatives corrigées spécifiquement`);
}

// Fonction principale
async function main() {
  const command = process.argv[2];

  try {
    if (command === 'show') {
      await showAllAddresses();
    } else if (command === 'fix') {
      console.log('⚠️  ATTENTION: Ce script va corriger manuellement les adresses');
      console.log('   Corrections basées sur l\'analyse manuelle\n');
      
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
      
      await correctSpecificInitiatives();
    } else {
      console.log('Usage:');
      console.log('  node scripts/manual-fix-addresses.js show  - Afficher toutes les adresses');
      console.log('  node scripts/manual-fix-addresses.js fix   - Corriger manuellement');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
