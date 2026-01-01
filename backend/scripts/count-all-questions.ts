import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const testQuestionPath = path.join(__dirname, '../../frontend/test.question');
  
  const folders = fs.readdirSync(testQuestionPath).filter(f => {
    const fullPath = path.join(testQuestionPath, f);
    return fs.statSync(fullPath).isDirectory();
  });

  console.log(`\n📊 Test Questions Statistics for All Categories:\n`);
  console.log('Kategoriya                   | txt Fayllar | Jami Savollar');
  console.log('-----------------------------------------------------------');

  let totalQuestions = 0;

  for (const folder of folders.sort()) {
    const folderPath = path.join(testQuestionPath, folder);
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.txt'));
    
    let categoryTotal = 0;
    
    // Count questions in each file
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      // Count question numbers (lines starting with digit.)
      const questionCount = lines.filter(l => l.trim().match(/^\d+\./)).length;
      categoryTotal += questionCount;
    }

    totalQuestions += categoryTotal;

    const folderDisplay = folder.padEnd(28);
    const filesDisplay = String(files.length).padEnd(11);
    const totalDisplay = String(categoryTotal).padStart(13);
    
    console.log(`${folderDisplay} | ${filesDisplay} | ${totalDisplay}`);
  }

  console.log('-----------------------------------------------------------');
  console.log(`${'JAMI:'.padEnd(28)} | ${'27'.padEnd(11)} | ${String(totalQuestions).padStart(13)}`);
  console.log(`\n✅ Barcha kategoriyalardan ${totalQuestions} ta test savol mavjud!`);
}

main().catch(console.error);
