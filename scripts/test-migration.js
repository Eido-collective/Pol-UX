const { analyzeAllFiles } = require('./parse-sql-data');
const fs = require('fs');
const path = require('path');

console.log('🧪 Test de migration des données...\n');

// Analyser la structure des données
analyzeAllFiles();

// Vérifier que tous les fichiers existent
console.log('\n📁 Vérification des fichiers de données...');
const dataDir = path.join(__dirname, '../data');
const requiredFiles = [
  'users.json',
  'advices_rows.sql',
  'articles_rows.sql',
  'initiatives_rows.sql',
  'actors_rows.sql',
  'forum_topics_rows.sql'
];

requiredFiles.forEach(filename => {
  const filePath = path.join(dataDir, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${filename} - ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`❌ ${filename} - Fichier manquant`);
  }
});

console.log('\n🎯 Résumé de la migration:');
console.log('- Les utilisateurs seront migrés depuis users.json');
console.log('- Les conseils (Tips) seront migrés depuis advices_rows.sql');
console.log('- Les articles seront migrés depuis articles_rows.sql');
console.log('- Les initiatives seront migrés depuis initiatives_rows.sql');
console.log('- Les acteurs seront migrés depuis actors_rows.sql');
console.log('- Les posts de forum seront migrés depuis forum_topics_rows.sql');

console.log('\n⚠️  Notes importantes:');
console.log('- Les mots de passe existants seront conservés');
console.log('- Les usernames seront générés automatiquement');
console.log('- Les catégories seront mappées selon le nouveau schéma');
console.log('- Les coordonnées GPS seront extraites des données de localisation');
console.log('- Seuls les éléments publiés seront migrés');

console.log('\n🚀 Pour lancer la migration, exécutez:');
console.log('node scripts/migrate-old-data.js');
