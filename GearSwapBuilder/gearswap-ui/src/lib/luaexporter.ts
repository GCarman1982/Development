import { GearSet, EquippedItem } from '@/store/useGearStore';

import { SLOT_ORDER } from './constants';

export const generateUpdatedLua = (
  originalLua: string,
  allSets: Record<string, GearSet>,
  baseSets: Record<string, string>
): string => {
  let updatedLua = originalLua;
  const processedSets = new Set<string>();

  const sortedSetNames = Object.keys(allSets).sort((a, b) => b.length - a.length);

  // 1. UPDATE EXISTING SETS
  for (const setName of sortedSetNames) {
    const escapedName = setName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const startRegex = new RegExp(`(${escapedName}\\s*=\\s*(?:set_combine\\s*\\([^,]+,\\s*)?\\{)`, 'g');

    let match;
    while ((match = startRegex.exec(updatedLua)) !== null) {
      const startIndex = match.index;
      const prefix = match[1];
      const contentStart = startIndex + prefix.length;
      const endIndex = findClosingBrace(updatedLua, contentStart - 1);

      if (endIndex !== -1) {
        const gearLines = formatGearLines(allSets[setName]);
        const before = updatedLua.substring(0, contentStart);
        const after = updatedLua.substring(endIndex);
        updatedLua = before + "\n" + gearLines + "\n    " + after;
        processedSets.add(setName);
        startRegex.lastIndex = before.length + gearLines.length + 10;
      }
    }
  }

  // 2. COLLISION-AWARE APPEND
  const newSets = Object.keys(allSets).filter(s => !processedSets.has(s));

  if (newSets.length > 0) {
    const filteredNewSets = newSets.filter(setName => {
      // Create a regex to find the set name anywhere (including comments/strings)
      // to avoid double-defining or injecting into commented-out code.
      const collisionRegex = new RegExp(`\\b${setName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return !collisionRegex.test(updatedLua);
    });

    if (filteredNewSets.length === 0) return updatedLua;

    const newSetsLua = filteredNewSets.map(setName => {
      const gearLines = formatGearLines(allSets[setName]);
      const base = baseSets[setName];
      return base
        ? `    ${setName} = set_combine(${base}, {\n${gearLines}\n    })`
        : `    ${setName} = {\n${gearLines}\n    }`;
    }).join("\n\n");

    const initFuncStart = updatedLua.search(/function\s+init_gear_sets\s*\(/);

    if (initFuncStart !== -1) {
      const funcSearchArea = updatedLua.substring(initFuncStart);
      const lastEndMatch = [...funcSearchArea.matchAll(/\bend\b/g)].pop();

      if (lastEndMatch) {
        const absoluteEndIndex = initFuncStart + lastEndMatch.index!;
        const lastBraceBeforeEnd = updatedLua.lastIndexOf('}', absoluteEndIndex);

        if (lastBraceBeforeEnd !== -1) {
          updatedLua =
            updatedLua.substring(0, lastBraceBeforeEnd + 1) +
            "\n\n    -- [[ New Sets Added via Studio ]]\n" +
            newSetsLua +
            "\n" +
            updatedLua.substring(lastBraceBeforeEnd + 1);
        } else {
          updatedLua =
            updatedLua.substring(0, absoluteEndIndex) +
            "\n    " + newSetsLua + "\n" +
            updatedLua.substring(absoluteEndIndex);
        }
      }
    }
  }

  return updatedLua;
};

function findClosingBrace(text: string, startIdx: number): number {
  let depth = 0;
  for (let i = startIdx; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

const formatGearLines = (gear: GearSet): string => {
  const keys = Object.keys(gear);
  if (keys.length === 0) return `        -- No overrides`;

  // Sort gear by standard SLOT_ORDER
  return SLOT_ORDER
    .filter(slot => gear[slot] !== undefined)
    .map(slot => `        ${slot}=${itemToLua(gear[slot])},`)
    .join('\n');
};

const itemToLua = (item: string | EquippedItem): string => {
  if (typeof item === 'string') return `"${item}"`;
  const parts = [`name="${item.name}"`];
  if (item.augments?.length) {
    const cleanAugs = item.augments.filter(a => a.trim() !== "");
    const augs = cleanAugs.map(a => `'${a.replace(/'/g, "\\'")}'`).join(',');
    parts.push(`augments={${augs}}`);
  }
  return `{${parts.join(', ')}}`;
};