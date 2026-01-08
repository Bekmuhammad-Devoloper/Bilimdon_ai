const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/src/modules/telegram/telegram.service.ts');

let content = fs.readFileSync(filePath, 'utf8');

const oldCode = `   async sendMediaMessage(chatId: string | number, text: string, options?: {
    imageUrl?: string;
    videoUrl?: string;
    parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
    reply_markup?: any;
  }) {
    const { imageUrl, videoUrl, ...restOptions } = options || {};

    // If video exists, send video with caption
    if (videoUrl) {
      return this.sendVideo(chatId, videoUrl, text, restOptions);
    }

    // If image exists, send photo with caption
    if (imageUrl) {
      return this.sendPhoto(chatId, imageUrl, text, restOptions);
    }

    // Otherwise just send text message
    return this.sendMessage(chatId, text, restOptions);
  }`;

const newCode = `   async sendMediaMessage(chatId: string | number, text: string, options?: {
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
      console.log('[sendMediaMessage] Photo sent, result:', JSON.stringify(result));
      return result;
    }

    // Otherwise just send text message
    console.log('[sendMediaMessage] >>> Sending TEXT only...');
    return this.sendMessage(chatId, text, restOptions);
  }`;

if (content.includes(oldCode)) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ SUCCESS: telegram.service.ts updated with debug logs!');
} else {
  console.log('❌ ERROR: Old code not found in file. Maybe already updated?');
  console.log('Checking for debug logs...');
  if (content.includes('[sendMediaMessage] DEBUG')) {
    console.log('✅ Debug logs already present!');
  } else {
    console.log('❌ Debug logs NOT found!');
  }
}
