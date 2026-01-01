import * as fs from "fs";
import * as path from "path";

const tarixPath = path.join(
  __dirname,
  "../../frontend/test.question/tarix/tarix_100_oson_test.txt"
);

const content = fs.readFileSync(tarixPath, "utf-8");
const normalized = content.replace(/\r\n/g, "\n");

const blocks = normalized.split(/\n\n+/);

console.log(`Total blocks: ${blocks.length}`);

for (let b = 0; b < Math.min(3, blocks.length); b++) {
  const block = blocks[b];
  console.log(`\n=== BLOCK ${b} ===`);
  console.log(block.substring(0, 400));

  const lines = block.split("\n").filter((l) => l.trim());
  console.log(`\nFiltered lines: ${lines.length}`);
  lines.forEach((l, i) => console.log(`  ${i}: "${l}"`));

  // Find answer line
  let answerLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/^Javob[\s:]*([A-Da-d])/i.test(lines[i].trim())) {
      answerLineIdx = i;
      console.log(`\nAnswer line found at ${i}: "${lines[i]}"`);
      break;
    }
  }

  if (answerLineIdx === -1) {
    console.log("\nNo answer line found!");
  }
}
