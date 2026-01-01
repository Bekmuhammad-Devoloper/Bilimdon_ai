import * as fs from "fs";
import * as path from "path";

const javaPath = path.join(
  __dirname,
  "../../frontend/test.question/java/java_100ta_qiyin.txt"
);

const content = fs.readFileSync(javaPath, "utf-8");

// Show first 2000 chars
console.log("=== FILE CONTENT SAMPLE ===");
console.log(content.substring(0, 2000));
console.log("\n=== TESTING REGEX ===\n");

// Test regex
const questionBlocks = content.split(/\n(?=\*?\*?\d+[\.\)]\*?\*?)/);
console.log(`Total blocks after split: ${questionBlocks.length}`);

// Show first 3 blocks
for (let i = 0; i < Math.min(3, questionBlocks.length); i++) {
  const block = questionBlocks[i];
  console.log(`\n--- BLOCK ${i} ---`);
  console.log(block.substring(0, 500));

  const numberMatch = block.match(/^\*?\*?(\d+)[\.\)]\*?\*?\s*(.+?)(?=\n|$)/);
  console.log(
    `Number match:`,
    numberMatch ? `"${numberMatch[2]}"` : "NO MATCH"
  );

  const optionMatches = block.match(/^[\s-]*[A-Da-d]\)[:\s]*(.+?)(?=\n|$)/gm);
  console.log(
    `Options found:`,
    optionMatches ? optionMatches.length : 0,
    optionMatches ? optionMatches.slice(0, 2) : []
  );

  const answerMatch = block.match(/\*?\*?Javob[\s:]*([A-Da-d])\*?\*?/i);
  console.log(
    `Answer match:`,
    answerMatch ? `"${answerMatch[1]}"` : "NO MATCH"
  );
}
