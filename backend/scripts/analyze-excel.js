const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '../../Fichier Reference/Liste personnel 102025.xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  console.log('📊 Analyse du fichier Excel:\n');
  console.log(`📄 Nom de la feuille: ${sheetName}`);
  console.log(`📝 Nombre de lignes: ${data.length}`);
  console.log('\n🔍 En-têtes (première ligne):');
  console.log(JSON.stringify(data[0], null, 2));

  console.log('\n📋 Aperçu des 3 premières lignes de données:');
  data.slice(1, 4).forEach((row, index) => {
    console.log(`\nLigne ${index + 2}:`);
    console.log(JSON.stringify(row, null, 2));
  });

  console.log('\n✅ Analyse terminée!');
} catch (error) {
  console.error('❌ Erreur:', error.message);
}
