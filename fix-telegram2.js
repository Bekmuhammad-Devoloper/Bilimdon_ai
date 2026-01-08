const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/src/modules/telegram/telegram.service.ts');

let content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find sendMediaMessage function
let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('async sendMediaMessage(chatId:')) {
    startIdx = i;
  }
  if (startIdx !== -1 && endIdx === -1) {
    // Find closing brace at same indentation level
    if (i > startIdx && lines[i].match(/^  \}$/) || lines[i].match(/^   \}$/)) {
      endIdx = i;
      break;
    }
  }
}

console.log('Found sendMediaMessage at lines:', startIdx + 1, 'to', endIdx + 1);

if (startIdx === -1) {
  console.log('❌ sendMediaMessage function not found!');
  process.exit(1);
}

// New function code
const newFunction = `   async sendMediaMessage(chatId: string | number, text: string, options?: {
    imageUrl?: string;
    videoUrl?: string;
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    reply_markup?: any;
  }) {
    const { imageUrl, videoUrl, ...restOptions } = options || {};

    console.log('=== [sendMediaMessage] DEBUG ===');
    console.log('[sendMediaMessage] chatId:', chatId);
    console.log('[sendMediaMessage] imageUrl:', imageUrl);
    console.log('[sendMediaMessage] videoUrl:', videoUrl);

    // If video exists, send video with caption
    if (videoUrl) {
      console.log('[sendMediaMessage] >>> Sending VIDEO...');
      return this.sendVideo(chatId, videoUrl, text, restOptions);
    }

    // If image exists, send photo with caption
    if (imageUrl) {
      console.log('[sendMediaMessage] >>> Sending PHOTO...');
      const result = await this.sendPhoto(chatId, imageUrl, text, restOptions);
      console.log('[sendMediaMessage] Photo sent!');
      return result;
    }

    // Otherwise just send text message
    console.log('[sendMediaMessage] >>> Sending TEXT only...');
    return this.sendMessage(chatId, text, restOptions);
  }`;

// Replace the function
const newLines = [
  ...lines.slice(0, startIdx),
  ...newFunction.split('\n'),
  ...lines.slice(endIdx + 1)
];

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
console.log('✅ SUCCESS! File updated with debug logs!');
