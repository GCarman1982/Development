import React, { useEffect } from "react";
import { useGearStore, EquippedItem } from "../store/useGearStore";

const SLOT_ORDER = [
  "main", "sub", "range", "ammo",
  "head", "neck", "ear1", "ear2",
  "body", "hands", "ring1", "ring2",
  "back", "waist", "legs", "feet"
];

export function LuaPreview() {
  const { allSets, activeTab } = useGearStore();

  const visibleSets = Object.entries(allSets).filter(([name]) => {
    return name === activeTab || name.startsWith(`${activeTab}.`);
  });

  // SAFETY DEBUGGER: This will tell us if 'allSets' actually contains objects or just strings
  useEffect(() => {
    if (visibleSets.length > 0) {
      console.log("--- UI Data Check ---");
      console.log("Current Set Data:", visibleSets[0][1]);
    }
  }, [visibleSets]);

  return (
    <div className="flex-1 w-full h-full p-6 font-mono text-[13px] overflow-auto custom-scrollbar border-l border-white/10
                    bg-[#0a0a0c] 
                    [[data-theme='ffxi']_&]:bg-[linear-gradient(180deg,#000080_0%,#000033_100%)]">
      
      <div className="mb-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
        -- LUA OUTPUT ({activeTab})
      </div>

      {visibleSets.length > 0 ? (
        visibleSets.map(([setName, gear]) => {
          const [base, ...vParts] = setName.split('.');
          const variant = vParts.length > 0 ? `.${vParts.join('.')}` : "";

          return (
            <div key={setName} className="mb-8 select-all leading-tight">
              <div className="text-zinc-400">
                sets.<span className="text-amber-500">{base}</span>
                <span className="text-emerald-500">{variant}</span> = {"{"}
              </div>

              {SLOT_ORDER.map((slot) => {
                const itemData = gear[slot];
                
                if (!itemData || itemData === "None" || itemData === "empty" || itemData === "") return null;

                // IF STRING
                if (typeof itemData === 'string') {
                  return (
                    <div key={slot} className="pl-4 flex gap-1 items-baseline">
                      <span className="text-sky-400">{slot}</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-emerald-400">"{itemData}"</span>
                      <span className="text-zinc-400">,</span>
                    </div>
                  );
                }

                // IF OBJECT
                const item = itemData as EquippedItem;
                return (
                  <div key={slot} className="pl-4 flex flex-col my-0.5">
                    <div className="flex gap-1 items-baseline">
                      <span className="text-sky-400">{slot}</span>
                      <span className="text-zinc-400">={"{"}</span>
                      <span className="text-sky-300">name</span>
                      <span className="text-zinc-400">=</span>
                      <span className="text-emerald-400">"{item.name}"</span>
                      <span className="text-zinc-400">,</span>
                    </div>
                    
                    {item.augments && item.augments.length > 0 && (
                      <div className="pl-4 flex gap-1 items-baseline">
                        <span className="text-sky-300">augments</span>
                        <span className="text-zinc-400">={"{"}</span>
                        <span className="text-emerald-200">
                          {item.augments.map((a, i) => (
                            <React.Fragment key={i}>
                              "{a}"{i < item.augments!.length - 1 ? "," : ""}
                            </React.Fragment>
                          ))}
                        </span>
                        <span className="text-zinc-400">{"}"},</span>
                      </div>
                    )}

                    {item.path && (
                      <div className="pl-4 flex gap-1 items-baseline">
                        <span className="text-sky-300">path</span>
                        <span className="text-zinc-400">=</span>
                        <span className="text-emerald-400">"{item.path}"</span>
                        <span className="text-zinc-400">,</span>
                      </div>
                    )}

                    {item.rank !== undefined && (
                      <div className="pl-4 flex gap-1 items-baseline">
                        <span className="text-sky-300">rank</span>
                        <span className="text-zinc-400">=</span>
                        <span className="text-amber-400">{item.rank}</span>
                        <span className="text-zinc-400">,</span>
                      </div>
                    )}

                    <div className="text-zinc-400">{"},"}</div>
                  </div>
                );
              })}

              <div className="text-zinc-400">{"}"}</div>
            </div>
          );
        })
      ) : (
        <div className="h-full flex items-center justify-center text-zinc-700 italic text-xs">
          No sets found for "{activeTab}"
        </div>
      )}
    </div>
  );
}