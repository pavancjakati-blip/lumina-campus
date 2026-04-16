import fs from 'fs';
import path from 'path';

// Cross-platform Path (works locally and on Render)
const isProd = process.env.NODE_ENV === 'production';
// In dev: __dirname is server/src. In prod: __dirname is server/dist.
// We point it to the frontend's database.json which is checked into Git
const dbPath = path.join(__dirname, isProd ? '../../src/data/database.json' : '../../src/data/database.json');

export const readDb = () => {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data).luminaCampusDB;
  } catch (error) {
    console.error("Error reading database:", error);
    return null;
  }
};

// Atomic Write Strategy
export const writeDb = (data: any) => {
  try {
    const dbData = { luminaCampusDB: data };
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
