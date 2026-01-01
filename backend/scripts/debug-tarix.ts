import * as fs from "fs";
import * as path from "path";

const tarixPath = path.join(
  __dirname,
  "../../frontend/test.question/tarix/tarix_100_oson_test.txt"
);

const content = fs.readFileSync(tarixPath, "utf-8");

// Normalize
const normalized = content.replace(/\r\n/g, "\n");

console.log("=== FIRST 1000 CHARS ===");
console.log(normalized.substring(0, 1000));
console.log("\n=== TRYING SPLIT 1 ===");

let questionBlocks = normalized.split(/\n(?=\*?\*?\d+[\.\)]\*?\*?[^0-9])/);
console.log(`Format 1 blocks: ${questionBlocks.length}`);

if (questionBlocks.length < 2) {
  console.log("Trying format 2...");
  questionBlocks = normalized.split(/\n\n(?=[A-Za-z])/);
  console.log(`Format 2 blocks: ${questionBlocks.length}`);
}

console.log("\n=== FIRST BLOCK ===");
console.log(questionBlocks[0].substring(0, 500));

console.log("\n=== SECOND BLOCK ===");
if (questionBlocks[1]) {
  console.log(questionBlocks[1].substring(0, 500));
}

// Test parsing first block
const block = questionBlocks[1];
if (block) {
  console.log("\n=== PARSING BLOCK 1 ===");
  let lines = block.split("\n");
  let optionStartIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    if (/^[\s]*[A-Da-d]\)/.test(lines[i].trim())) {
      optionStartIdx = i;
      console.log(`Option start at line ${i}: "${lines[i]}"`);
      break;
    }
  }

  const questionText = lines
    .slice(0, optionStartIdx)
    .join(" ")
    .replace(/^[#\*]*\s*\d+[\.\)]?\s*\*+\s*/i, "")
    .replace(/VARIANT.*$/i, "")
    .replace(/DARAJA.*$/i, "")
    .trim();

  console.log(`Question text: "${questionText}"`);

  const optionMatches = block.match(/[\s-]*[A-Da-d]\)[:\s]*(.+?)(?=\n|$)/gm);
  console.log(`Options found: ${optionMatches?.length || 0}`);
  if (optionMatches) {
    optionMatches.slice(0, 4).forEach((o, i) => {
      console.log(`  ${i}: "${o}"`);
    });
  }

  const answerMatch = block.match(/\*?\*?Javob[\s:]*([A-Da-d])\*?\*?/i);
  console.log(`Answer match: ${answerMatch ? answerMatch[1] : "NOT FOUND"}`);
}
