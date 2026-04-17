import fs from 'fs';
import path from 'path';

// Cross-platform Path (works locally and on Render)
const DB_PATH = path.join(__dirname, 'data', 'database.json');

export const readDb = () => {
  try {
    console.log('Reading DB from:', DB_PATH);
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw).luminaCampusDB;
  } catch (err: any) {
    console.error('DB READ ERROR:', err.message);
    console.error('Tried path:', DB_PATH);
    console.error('__dirname:', __dirname);
    console.error('process.cwd():', process.cwd());
    throw new Error('Cannot read database: ' + err.message);
  }
};

// Atomic Write Strategy
export const writeDb = (data: any) => {
  try {
    const dbData = { luminaCampusDB: data };
    const tempPath = `${DB_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(dbData, null, 2), 'utf8');
    fs.renameSync(tempPath, DB_PATH);
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
