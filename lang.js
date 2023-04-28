const fs = require('fs');

const translations = './client/public/assets/i18n/translations/';
const main_tr = 'en';

const dir = fs.readdirSync(translations);

let main = {};
for (const file of dir) {
  if (file.includes(main_tr)) {
    main = JSON.parse(fs.readFileSync(translations + file));
    break;
  }
}

for (const file of dir) {
  if (!file.includes(main_tr)) {
    const not_exists = {};
    const exist = JSON.parse(fs.readFileSync(translations + file));

    for (const key of Object.keys(main))
      if (!exist[key]) not_exists[key] = main[key];
    if (Object.keys(not_exists).length > 0)
      fs.writeFileSync(
        './missing_ln/' + file,
        JSON.stringify(not_exists, null, 2)
      );
  }
}

// console.log(dir)
