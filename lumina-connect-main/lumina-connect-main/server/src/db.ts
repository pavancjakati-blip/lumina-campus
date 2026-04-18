import fs from 'fs';
import path from 'path';

const findDbPath = (): string => {
  const candidates = [
    path.join(__dirname, 'data', 'database.json'),
    path.join(__dirname, '..', 'data', 'database.json'),
    path.join(__dirname, 'src', 'data', 'database.json'),
    path.join(__dirname, '..', 'src', 'data', 'database.json'),
    path.join(process.cwd(), 'data', 'database.json'),
    path.join(process.cwd(), 'src', 'data', 'database.json'),
    path.join(process.cwd(), 'dist', 'data', 'database.json'),
    path.join(process.cwd(), 'dist', 'src', 'data', 'database.json'),
    'data/database.json',
    'src/data/database.json',
    'database.json'
  ];
  
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log('Found database at:', candidate);
      return candidate;
    }
  }
  
  console.error('DATABASE NOT FOUND. Tried:');
  candidates.forEach(c => console.error(' -', c));
  throw new Error('database.json not found in any expected location');
};

console.log('=== DATABASE PATH DEBUG ===');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());
try {
  const DB_PATH = findDbPath();
  console.log('DB_PATH:', DB_PATH);
  const exists = fs.existsSync(DB_PATH);
  console.log('DB file exists:', exists);
  if (exists) {
    const raw = fs.readFileSync(DB_PATH, 'utf-8').replace(/^\uFEFF/, '');
    const parsed = JSON.parse(raw);
    const facultyCount = parsed?.luminaCampusDB?.faculty?.length || parsed?.faculty?.length || 0;
    console.log('Faculty count in DB:', facultyCount);
  }
} catch(e: any) {
  console.log('DB check error:', e.message);
}
console.log('===========================');

export const readDb = () => {
  const dbPath = findDbPath();
  // Strip BOM (\uFEFF) which can corrupt JSON.parse on some systems/editors
  const raw = fs.readFileSync(dbPath, 'utf-8').replace(/^\uFEFF/, '').trim();
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e: any) {
    console.error('JSON parse failed. First 200 chars:', JSON.stringify(raw.slice(0, 200)));
    throw new Error('Invalid JSON in database.json: ' + e.message);
  }
  // Preserving backward compatibility - unwrap the inner DB object
  // so that db.faculty works throughout index.ts without crashing
  return parsed.luminaCampusDB ? parsed.luminaCampusDB : parsed;
};

// Atomic Write Strategy
export const writeDb = (data: any) => {
  try {
    const dbPath = findDbPath();
    
    let originalRaw = '{}';
    if (fs.existsSync(dbPath)) originalRaw = fs.readFileSync(dbPath, 'utf-8').replace(/^\uFEFF/, '').trim();
    let dbData = data;
    
    // Determine if original json was wrapped in luminaCampusDB
    try {
      if (JSON.parse(originalRaw).luminaCampusDB) {
        dbData = { luminaCampusDB: data };
      }
    } catch(e) {}
    
    const tempPath = `${dbPath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dbData, null, 2), 'utf8');
    fs.renameSync(tempPath, dbPath);
  } catch (error) {
    console.error("Error writing database atomically:", error);
  }
};

// Dynamic ID Helper
export const generateId = (prefix: string, items: any[]) => {
  if (!items || items.length === 0) return `${prefix}001`;
  let maxNum = 0;
  for (const item of items) {
    if (item.id && item.id.startsWith(prefix)) {
      const numPart = item.id.replace(prefix, '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
};
