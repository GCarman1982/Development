import { SLOT_MAP } from './constants';

export interface EquippedItem {
  name: string;
  augments?: string[];
  rank?: number;
  path?: string;
}

export type GearSet = Record<string, string | EquippedItem>;
export type AllSets = Record<string, GearSet>;

export interface ImportLog {
  status: 'success' | 'warning' | 'error';
  message: string;
  path?: string;
}

export interface ParseResult {
  sets: AllSets;
  baseSets: Record<string, string>; // Add this line
  logs: ImportLog[];
}

/**
 * FULL IMPORTER
 * Now handles set_combine by only capturing overrides to keep files tidy.
 */
export const parseLuaToSets = (luaText: string): ParseResult => {
  const sets: AllSets = {};
  const baseSets: Record<string, string> = {}; // 2. Initialize the map
  const logs: ImportLog[] = [];

  const cleanLua = luaText.replace(/--.*$/gm, "");
  const setFinder = /sets((?:[\.\[]['"]?[\w\d_ \-\+:]+['"]?\]?)+)\s*=\s*/g;

  let match;
  while ((match = setFinder.exec(cleanLua)) !== null) {
    let path = match[1].trim();
    if (path.startsWith('.')) path = path.substring(1);

    const startIndex = setFinder.lastIndex;
    const remainingText = cleanLua.substring(startIndex).trim();

    if (remainingText.startsWith('set_combine')) {
      const baseSetMatch = remainingText.match(/set_combine\s*\(\s*sets((?:[\.\[]['"]?[\w\d_ \-\+:]+['"]?\]?)+)/);

      // 3. Capture the base set relationship
      if (baseSetMatch) {
        const baseSetName = baseSetMatch[1].replace(/^\./, "").trim();
        baseSets[path] = `sets.${baseSetName}`;
      }

      const absoluteStart = cleanLua.indexOf('{', startIndex);
      const endIndex = findClosingBrace(cleanLua, absoluteStart);

      if (absoluteStart !== -1 && endIndex !== -1) {
        const setBlock = cleanLua.substring(absoluteStart + 1, endIndex);
        sets[path] = parseGearBlock(setBlock);

        logs.push({
          status: 'success',
          message: `Imported overrides for ${path}`,
          path
        });
      }
    }
    else if (remainingText.startsWith('{')) {
      const absoluteStart = cleanLua.indexOf('{', startIndex);
      const endIndex = findClosingBrace(cleanLua, absoluteStart);

      if (endIndex !== -1) {
        const setBlock = cleanLua.substring(absoluteStart + 1, endIndex);
        sets[path] = parseGearBlock(setBlock);
      }
    }
    else if (remainingText.startsWith('sets')) {
      const pointerMatch = remainingText.match(/^sets((?:[\.\[]['"]?[\w\d_ \-\+:]+['"]?\]?)+)/);
      if (pointerMatch) {
        const sourcePath = pointerMatch[1].trim().replace(/^\./, "");
        if (sets[sourcePath]) {
          sets[path] = JSON.parse(JSON.stringify(sets[sourcePath]));
        }
      }
    }
  }

  // 4. Return the baseSets along with sets and logs
  return { sets, baseSets, logs };
};

/**
 * Helper to find the matching closing brace for any nested level
 */
function findClosingBrace(text: string, startIdx: number): number {
  if (startIdx === -1) return -1;
  let depth = 0;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') depth--;
    if (depth === 0) return i;
  }
  return -1;
}

/**
 * Parses the internal content of a gear set
 */
function parseGearBlock(block: string): GearSet {
  const gear: GearSet = {};

  // 1. Parse Table Items: slot={name="...", augments={...}}
  // Handles nested braces for augments correctly
  const tableRegex = /([\w\d_]+)\s*=\s*\{([^{}]*?\{[^{}]*?\}[^{}]*?|[^{}]*?)\}/g;

  let match;
  while ((match = tableRegex.exec(block)) !== null) {
    const rawSlot = match[1].toLowerCase();
    if (['name', 'augments', 'path', 'rank'].includes(rawSlot)) continue;

    const slot = SLOT_MAP[rawSlot] || rawSlot;
    const content = match[2];

    const nameMatch = content.match(/name\s*=\s*(["'])(.*?)\1/);
    if (nameMatch) {
      const item: EquippedItem = { name: nameMatch[2].trim() };

      // Cleanly extract augments
      if (content.includes("augments")) {
        const augStart = content.indexOf('{', content.indexOf('augments'));
        const augEnd = content.indexOf('}', augStart);
        if (augStart !== -1 && augEnd !== -1) {
          item.augments = content.substring(augStart + 1, augEnd)
            .split(',')
            .map(a => a.replace(/['"\r\n\t]/g, '').trim())
            .filter(a => a !== "");
        }
      }

      const pathMatch = content.match(/path\s*=\s*(["'])(.*?)\1/);
      if (pathMatch) item.path = pathMatch[2];

      const rankMatch = content.match(/rank\s*=\s*(\d+)/);
      if (rankMatch) item.rank = parseInt(rankMatch[1]);

      gear[slot] = item;
    }
  }

  // 2. Parse Simple Strings: slot="Item Name"
  const stringRegex = /([\w\d_]+)\s*=\s*(["'])(.*?)\2/g;
  while ((match = stringRegex.exec(block)) !== null) {
    const slotName = match[1].toLowerCase();
    const slot = SLOT_MAP[slotName] || slotName;

    // Skip if it's a property or already filled by a table
    if (!gear[slot] && !['name', 'path', 'augments'].includes(slot)) {
      gear[slot] = match[3].trim();
    }
  }

  return gear;
}