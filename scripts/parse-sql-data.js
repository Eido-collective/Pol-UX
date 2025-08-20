const fs = require('fs');
const path = require('path');

// Fonction pour parser correctement les données SQL
function parseSQLValues(sqlContent) {
  const results = [];
  
  // Regex pour capturer toutes les valeurs entre parenthèses
  const regex = /VALUES\s*\(((?:[^()]+|\([^()]*\))*)\)/g;
  let match;
  
  while ((match = regex.exec(sqlContent)) !== null) {
    const valuesString = match[1];
    const values = parseValuesString(valuesString);
    results.push(values);
  }
  
  // Si on n'a qu'un seul résultat, essayer de parser différemment
  if (results.length <= 1) {
    // Essayer de capturer toutes les lignes de valeurs
    const allValuesRegex = /\(((?:[^()]+|\([^()]*\))*)\)/g;
    const allMatches = sqlContent.match(allValuesRegex);
    
    if (allMatches && allMatches.length > 1) {
      results.length = 0; // Vider le tableau
      allMatches.forEach(match => {
        const valuesString = match.slice(1, -1); // Enlever les parenthèses externes
        const values = parseValuesString(valuesString);
        if (values.length > 0) {
          results.push(values);
        }
      });
    }
  }
  
  return results;
}

// Fonction pour parser une chaîne de valeurs SQL
function parseValuesString(valuesString) {
  const values = [];
  let currentValue = '';
  let inQuotes = false;
  let quoteChar = null;
  let i = 0;
  
  while (i < valuesString.length) {
    const char = valuesString[i];
    
    if (!inQuotes) {
      if (char === "'" || char === '"') {
        inQuotes = true;
        quoteChar = char;
        i++;
        continue;
      } else if (char === ',') {
        values.push(currentValue.trim());
        currentValue = '';
        i++;
        continue;
      } else if (char === ' ' && currentValue === '') {
        i++;
        continue;
      }
    } else {
      if (char === quoteChar) {
        // Vérifier si c'est un guillemet échappé
        if (i + 1 < valuesString.length && valuesString[i + 1] === quoteChar) {
          currentValue += char;
          i += 2;
          continue;
        } else {
          inQuotes = false;
          quoteChar = null;
          i++;
          continue;
        }
      }
    }
    
    currentValue += char;
    i++;
  }
  
  // Ajouter la dernière valeur
  if (currentValue.trim()) {
    values.push(currentValue.trim());
  }
  
  return values;
}

// Fonction pour nettoyer les valeurs
function cleanValue(value) {
  if (!value) return '';
  
  // Supprimer les guillemets externes
  value = value.replace(/^['"]|['"]$/g, '');
  
  // Décoder les caractères échappés
  value = value.replace(/\\"/g, '"');
  value = value.replace(/\\'/g, "'");
  value = value.replace(/\\\\/g, '\\');
  
  return value;
}

// Fonction pour parser les tags JSON
function parseTags(tagsString) {
  if (!tagsString || tagsString === '"{]}"' || tagsString === 'null') {
    return [];
  }
  
  try {
    // Nettoyer la chaîne
    let cleaned = tagsString.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/^"|"$/g, '');
    
    // Gérer le format spécifique avec accolades {} au lieu de crochets []
    if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
      // Convertir {"tag1","tag2"} en ["tag1","tag2"]
      cleaned = cleaned.replace(/^{/, '[').replace(/}$/, ']');
      // Ajouter des guillemets autour des valeurs si elles n'en ont pas
      cleaned = cleaned.replace(/"([^"]+)"/g, '"$1"');
      // Gérer les valeurs sans guillemets
      cleaned = cleaned.replace(/,([^",\]]+)(?=,|])/g, ',"$1"');
      // Gérer la première valeur sans guillemets
      cleaned = cleaned.replace(/^\[([^",\]]+)(?=,|])/, '["$1"');
    }
    
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    // Si le parsing JSON échoue, essayer d'extraire manuellement
    try {
      let cleaned = tagsString.replace(/\\"/g, '"');
      cleaned = cleaned.replace(/^"|"$/g, '');
      
      // Extraire les tags entre accolades ou crochets
      const match = cleaned.match(/[{\[](.*)[}\]]/);
      if (match) {
        const tagsContent = match[1];
        // Diviser par virgules et nettoyer
        const tags = tagsContent.split(',')
          .map(tag => tag.trim().replace(/^"|"$/g, ''))
          .filter(tag => tag.length > 0);
        return tags;
      }
    } catch (fallbackError) {
      console.warn('Erreur parsing tags (fallback):', tagsString, fallbackError.message);
    }
    
    console.warn('Erreur parsing tags:', tagsString, e.message);
    return [];
  }
}

// Fonction pour parser la localisation
function parseLocation(locationString) {
  if (!locationString || locationString === 'null') {
    return { latitude: 0, longitude: 0, address: '' };
  }
  
  try {
    // Nettoyer la chaîne
    let cleaned = locationString.replace(/\\"/g, '"');
    cleaned = cleaned.replace(/^"|"$/g, '');
    
    const location = JSON.parse(cleaned);
    
    if (location.coordinates && Array.isArray(location.coordinates)) {
      return {
        latitude: location.coordinates[1] || 0,
        longitude: location.coordinates[0] || 0,
        address: location.address || ''
      };
    } else if (location.lat && location.lng) {
      return {
        latitude: location.lat,
        longitude: location.lng,
        address: location.address || ''
      };
    }
  } catch (e) {
    console.warn('Erreur parsing location:', locationString, e.message);
  }
  
  return { latitude: 0, longitude: 0, address: '' };
}

// Fonction pour extraire les données d'un fichier SQL
function extractSQLData(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const values = parseSQLValues(content);
    
    return values.map(row => {
      return row.map(cleanValue);
    });
  } catch (error) {
    console.error(`Erreur lecture fichier ${filePath}:`, error.message);
    return [];
  }
}

// Fonction pour analyser la structure des données
function analyzeDataStructure(data, filename) {
  console.log(`\n📊 Analyse de ${filename}:`);
  console.log(`Nombre d'enregistrements: ${data.length}`);
  
  if (data.length > 0) {
    console.log(`Nombre de colonnes: ${data[0].length}`);
    console.log('Premier enregistrement:', data[0]);
  }
  
  // Analyser les types de données
  if (data.length > 0) {
    console.log('\nTypes de données par colonne:');
    data[0].forEach((value, index) => {
      console.log(`Colonne ${index}: ${typeof value} - "${value}"`);
    });
  }
}

// Fonction principale pour analyser tous les fichiers
function analyzeAllFiles() {
  const dataDir = path.join(__dirname, '../data');
  const files = [
    'advices_rows.sql',
    'articles_rows.sql',
    'initiatives_rows.sql',
    'actors_rows.sql',
    'forum_topics_rows.sql',
    'forum_replies_rows.sql'
  ];
  
  console.log('🔍 Analyse des fichiers de données...\n');
  
  files.forEach(filename => {
    const filePath = path.join(dataDir, filename);
    if (fs.existsSync(filePath)) {
      const data = extractSQLData(filePath);
      analyzeDataStructure(data, filename);
    } else {
      console.log(`❌ Fichier non trouvé: ${filename}`);
    }
  });
}

// Exporter les fonctions pour utilisation dans le script de migration
module.exports = {
  parseSQLValues,
  parseValuesString,
  cleanValue,
  parseTags,
  parseLocation,
  extractSQLData,
  analyzeAllFiles
};

// Si exécuté directement, analyser tous les fichiers
if (require.main === module) {
  analyzeAllFiles();
}
