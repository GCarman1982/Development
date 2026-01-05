import { useEffect } from "react";
import { TopNav } from "./components/TopNav";
import { GearGrid } from "./components/GearGrid";
import { LuaPreview } from "./components/LuaPreview";
import { Sidebar } from "./components/Sidebar";
import { useGearStore } from "./store/useGearStore";
import { AugmentModal } from "./components/gear/augment-modal";

export default function App() {
  const theme = useGearStore((state) => state.theme);
  const {
    initializeItems,
    setIsLoadingItems,
    isAugmentModalOpen,
    closeAugmentModal,
    modalTarget,
    updateSlot
  } = useGearStore();

  useEffect(() => {
    async function loadItems() {
      setIsLoadingItems(true);
      try {
        // Items are in public/data or we move them to a place where they can be fetched
        // Since it was imported from @/data/items.json, Vite would have bundled it.
        // For standard Vite setup, we can move items.json to public/ and fetch it.
        // Or we can use dynamic import if it's still in src/data.

        // Let's try dynamic import first as it's cleaner with current structure
        const ITEM_DATA = await import("@/data/items.json");
        initializeItems(ITEM_DATA.default);
      } catch (error) {
        console.error("Failed to load items:", error);
        setIsLoadingItems(false);
      }
    }
    loadItems();
  }, [initializeItems, setIsLoadingItems]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <TopNav />

      {/* This container holds everything below the header */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Navigation Tree (Fixed width) */}
        <Sidebar />

        {/* CENTER: The Grid Area - Using flex-[1.4] to give more weight to center than sidebar */}
        <main className="flex-[1.4] min-w-[600px] overflow-y-auto bg-background/50 p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto">
            <GearGrid />
          </div>
        </main>

        {/* RIGHT: Code Preview - Using flex-1 to make it grow/shrink proportionally */}
        {/* Removed fixed 420px, added min-width to prevent squishing */}
        <aside className="ff-window no-hand flex-1 min-w-[480px] border-l border-white/10 flex flex-col overflow-hidden bg-black/20 backdrop-blur-sm">
          <LuaPreview />
        </aside>
      </div>

      {modalTarget && (
        <AugmentModal
          item={modalTarget.item}
          isOpen={isAugmentModalOpen}
          onOpenChange={closeAugmentModal}
          onUpdate={(newData) => updateSlot(modalTarget.setName, modalTarget.slot, newData)}
        />
      )}
    </div>
  );
}