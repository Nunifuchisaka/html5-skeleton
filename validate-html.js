const validator = require('html-validator');
const glob = require('glob');
const fs = require('fs');

async function validateAllHtml() {
  const files = glob.sync('dist_uncompressed/htdocs/**/*.html', {
    ignore: ['dist_uncompressed/htdocs/assets/html/**/*.html'],
  });

  if (files.length === 0) {
    console.log('\x1b[33m%s\x1b[0m', '検証対象のHTMLファイルが見つかりません。');
    return;
  }

  console.log(`Validating ${files.length} HTML file(s)...`);
  let hasErrors = false;

  for (const file of files) {
    try {
      const htmlContent = fs.readFileSync(file, 'utf-8');
      
      const options = {
        data: htmlContent,
        format: 'text',
      };

      const result = await validator(options);

      if (result.includes('Error:')) {
        hasErrors = true;
        console.log(`\n--- Validation results for: \x1b[36m${file}\x1b[0m ---`);
        console.log(result);
      }
    } catch (error) {
      hasErrors = true;
      console.error(`Error validating ${file}:`, error);
    }
  }

  console.log('\n--- Validation Summary ---');
  if (hasErrors) {
    console.error('\x1b[31m%s\x1b[0m', 'HTML validation failed with errors.');
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', 'All HTML files are valid!');
  }
}

validateAllHtml();