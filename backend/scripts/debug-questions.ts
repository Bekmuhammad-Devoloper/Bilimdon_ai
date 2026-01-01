import * as fs from 'fs';
import * as path from 'path';

interface ParsedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

function parseQuestions(content: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const lines = content.split('\n');
  
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    
    // Check if line starts with a number followed by a period (question number)
    const questionMatch = line.match(/^\d+\.\s+(.+)$/);
    if (questionMatch) {
      const question = questionMatch[1];
      const options: string[] = [];
      let correctAnswerLetter = '';
      let j = i + 1;
      
      // Skip empty lines after question
      while (j < lines.length && !lines[j].trim()) {
        j++;
      }
      
      // Collect options (both uppercase A-D and lowercase a-d)
      while (j < lines.length && lines[j].trim().match(/^[A-Da-d]\)/)) {
        const option = lines[j].trim().replace(/^[A-Da-d]\)\s*/, '');
        options.push(option);
        j++;
      }
      
      // Skip empty lines before answer
      while (j < lines.length && !lines[j].trim()) {
        j++;
      }
      
      // Find the answer
      if (j < lines.length) {
        const answerLine = lines[j].trim();
        console.log(`[Answer Line] "${answerLine}"`);
        if (answerLine.toLowerCase().includes('javob')) {
          // Match: Javob: a, Javob: b, etc. (case insensitive)
          const answerMatch = answerLine.match(/javob[^:]*:\s*([A-Da-d])/i);
          console.log(`[Match Result]`, answerMatch);
          if (answerMatch) {
            correctAnswerLetter = answerMatch[1].toUpperCase();
            console.log(`[Answer Letter] ${correctAnswerLetter}`);
          }
        }
      }
      
      // Convert letter to index (A=0, B=1, C=2, D=3)
      const correctAnswer = correctAnswerLetter ? correctAnswerLetter.charCodeAt(0) - 65 : -1;
      
      if (options.length === 4 && correctAnswer >= 0 && correctAnswer <= 3) {
        questions.push({
          question,
          options,
          correctAnswer,
        });
      }
      
      i = j + 1;
    } else {
      i++;
    }
  }
  
  return questions;
}

async function main() {
  const testQuestionPath = path.join(__dirname, '../../frontend/test.question');
  const goPath = path.join(testQuestionPath, 'go');
  
  const file = 'go_100ta_ortacha.txt';
  const filePath = path.join(goPath, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const questions = parseQuestions(content);
  
  console.log(`\n📄 ${file}`);
  console.log(`   Total: ${questions.length} questions parsed`);
  
  if (questions.length > 0) {
    console.log(`\n   First 2 questions:`);
    for (let i = 0; i < Math.min(2, questions.length); i++) {
      const q = questions[i];
      console.log(`   Q${i + 1}: ${q.question.substring(0, 50)}...`);
      console.log(`        Answer: ${q.correctAnswer} (${String.fromCharCode(65 + q.correctAnswer)})`);
    }
  }
}

main().catch(console.error);
