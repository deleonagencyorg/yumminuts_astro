import fs from 'fs';
import path from 'path';

const root = process.cwd();
const targets = [
  path.join(root, 'src/locales/es/recipes'),
  path.join(root, 'src/locales/en/recipes'),
];

const breakfastKeywords = [
  'desayuno','breakfast','yogurt','granola','chia','oat','avena','pancake','bowl'
];
const lunchKeywords = [
  'ensalada','salad','pasta','pluma','fetuchini','fettuccine','tilapia','pollo','chicken','cerdo','pork','kale','almuerzo','lunch','brocoli','brócoli','coliflor','cauliflower','ejotes','green beans','zucchini'
];
const dinnerKeywords = [
  'dinner','cena','tilapia','pasta','pollo','chicken','cerdo','pork','stew','horno','asado','rostizado','rostizada'
];
const snacksKeywords = [
  'snack','parfait','brownie','brownies','muffin','muffins','galleta','galletas','cookie','cookies','bar','bars','barrita','barritas','hummus','salsa','dip','cup','cups','tabla','party mix','jar','jars','aderezo','aderezos','pudin','pudding','postre','dessert'
];

function decideCategory(text) {
  const s = (text || '').toLowerCase();
  const has = (list) => list.some(k => s.includes(k));
  if (has(breakfastKeywords)) return 'breakfast';
  if (has(dinnerKeywords)) return 'dinner';
  if (has(lunchKeywords)) return 'lunch';
  if (has(snacksKeywords)) return 'snacks';
  return 'snacks';
}

function processDir(dir) {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  const changes = [];
  for (const file of files) {
    const full = path.join(dir, file);
    try {
      const raw = fs.readFileSync(full, 'utf8');
      const json = JSON.parse(raw);
      const baseText = [json.title, json.id, json.slug].filter(Boolean).join(' ').trim();
      const category = json.category || decideCategory(baseText);
      if (json.category !== category) {
        json.category = category;
        fs.writeFileSync(full, JSON.stringify(json, null, 2) + '\n', 'utf8');
        changes.push({ file: full, category });
      }
    } catch (e) {
      console.error('Failed processing', full, e.message);
    }
  }
  return changes;
}

let total = 0;
for (const dir of targets) {
  const out = processDir(dir);
  total += out.length;
  out.forEach(c => console.log(`[updated] ${c.file} -> ${c.category}`));
}
console.log(`Done. Updated ${total} files.`);
