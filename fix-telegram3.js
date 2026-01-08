const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'backend/src/modules/telegram/telegram.service.ts');

let content = fs.readFileSync(filePath, 'utf8');

// Find the exact line and add debug logs after it
const targetLine = "const { imageUrl, videoUrl, ...restOptions } = options || {};";
const debugLogs = `
    console.log('=== [sendMediaMessage] DEBUG ===');
    console.log('[sendMediaMessage] chatId:', chatId);
    console.log('[sendMediaMessage] imageUrl:', imageUrl);
    console.log('[sendMediaMessage] videoUrl:', videoUrl);
`;

// Also add logs before sendPhoto and sendVideo
const videoLog = "console.log('[sendMediaMessage] >>> Sending VIDEO...');\n      ";
const photoLog = "console.log('[sendMediaMessage] >>> Sending PHOTO...');\n      ";
const textLog = "console.log('[sendMediaMessage] >>> Sending TEXT only...');\n    ";

// Check if already has debug
if (content.includes('[sendMediaMessage] DEBUG')) {
  console.log('✅ Debug logs already present!');
  process.exit(0);
}

// Replace target line with target + debug logs
if (content.includes(targetLine)) {
  content = content.replace(
    targetLine,
    targetLine + debugLogs
  );
  
  // Add video log
  content = content.replace(
    /if \(videoUrl\) \{\s*\n\s*return this\.sendVideo/,
    'if (videoUrl) {\n      ' + videoLog + 'return this.sendVideo'
  );
  
  // Add photo log
  content = content.replace(
    /if \(imageUrl\) \{\s*\n\s*return this\.sendPhoto/,
    'if (imageUrl) {\n      ' + photoLog + 'return this.sendPhoto'
  );
  
  // Add text log  
  content = content.replace(
    /\/\/ Otherwise just send text message\s*\n\s*return this\.sendMessage/,
    '// Otherwise just send text message\n    ' + textLog + 'return this.sendMessage'
  );
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ SUCCESS! Debug logs added to telegram.service.ts');
} else {
  console.log('❌ Target line not found!');
  console.log('Looking for:', targetLine);
}
