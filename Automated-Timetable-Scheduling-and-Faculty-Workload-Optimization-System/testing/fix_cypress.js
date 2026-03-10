const fs = require('fs');
const glob = require('glob');

const files = glob.sync('cypress/**/*.js');
for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/input\[type=email\]/g, 'input[type=text]');
  content = content.replace(/input\[type="email"\]/g, 'input[type="text"]');
  fs.writeFileSync(file, content);
}
