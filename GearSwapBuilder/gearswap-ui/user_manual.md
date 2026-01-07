# FFXI GearSwap Studio: User Manual

Welcome to **GearSwap Studio**, a modern, visual suite for building and managing your Final Fantasy XI gear sets. Whether you're a veteran player or new to GearSwap, this tool is designed to make your gear management as seamless as possible.

---

## 1. Getting Started: The Interface

The Studio is divided into three main zones:

1.  **Sidebar (Left)**: Your library of gear sets (Idle, Engaged, Weapons, etc.).
2.  **Gear Grid (Center)**: The visual representation of your character's equipment slots.
3.  **Live Lua Preview (Right)**: A real-time, read-only view of the code being generated.

### Live Lua Preview Details
- **Instant Updates**: As you equip gear, edit augments, or change Odyssey paths, the code on the right updates immediately.
- **Visual Mapping**: The preview uses syntax highlighting to help you distinguish between set names (orange/emerald), slot names (sky blue), and item names (emerald green).
- **Final Set Review**: Before exporting, use this pane to verify that your `sets.idle.town` look exactly as intended.

### Themes
You can switch between a **Sleek Modern** theme and a **Classic FFXI** (Blue Gradient) theme using the toggle in the Top Navigation bar.

---

## 2. Navigation & Search

### Searching for Sets
The **Global Search Bar** at the top is your quickest way to find specific gear sets. 
- Typing in this bar instantly filters the **Sidebar** to show only the sets that match your query (e.g., searching "WS" will show all Weapon Skill sets).
- The search is case-insensitive and updates live as you type.

---

## 3. Importing Your Gear

If you already have a GearSwap `.lua` file, you don't have to start from scratch.

1.  Click the **Import** button in the top menu.
2.  Select your character's `.lua` file (e.g., `CharacterName_Job.lua`).
3.  The Studio will automatically parse your sets, character name, and job.

> [!TIP]
> **Pro Tip**: The Studio uses your filename to automatically set your Character Name and Job in the header!

---

## 4. Managing Gear Sets

### Browsing Sets
Use the Sidebar to navigate between categories. Groups like `IDLE`, `ENGAGED`, and `MIDCAST` are automatically categorized for you.

### Adding New Sets
1.  Click the **"Add Set"** button at the top of the Sidebar.
2.  Give your set a name (e.g., `sets.midcast.Cure`).
3.  *(Optional)* Choose a **Base Set** to inherit from. This is useful if you only want to change a few pieces from a standard set.

### Resetting or Clearing Sets

#### Clearing a Single Set ("Wiping")
If you want to wipe the gear from your current set without deleting the set name or its logic:
1.  Look for the **Eraser icon** in the Gear Grid header (next to "Gear Configuration").
2.  Clicking this will remove all items from the active set while keeping the set visible in your sidebar.

#### Deleting a Set
To remove a set entirely from your collection:
1.  Click the **"Delete Set"** button (Trash icon) in the Gear Grid header.
2.  Confirm the deletion in the pop-up dialog.

---

## 5. Building Your Set

### Equipping Items
1.  Select a set from the Sidebar.
2.  Click on any empty slot (e.g., Head, Body) in the Gear Grid.
3.  A search box will appear. Type the name of the item you want to equip.
4.  Select the item from the list.

### Cleaning Up
To remove an item, simply **Right-Click** the slot and select **"Clear Slot"**.

---

## 6. Advanced: Augments & Odyssey Paths

GearSwap Studio handles the complexities of modern FFXI augments with ease.

### Editing Augments
**Right-Click** any equipped item and select **"Edit Augments"**.

#### For Odyssey Items (Nyame, Sakpata, etc.):
The Studio recognizes Odyssey gear automatically. You will see a dedicated **Odyssey Path Picker** (Paths A, B, C, or D). Selecting a path will automatically format the correct GearSwap code for you.

#### For All Other Items:
You can manually add augments using the search tool:
1.  Search for a stat template (e.g., `STR+%d`).
2.  Enter the value (e.g., `10`).
3.  Drag and drop the augment badges to reorder them exactly as they appear in-game.

---

## 7. Exporting Your Work

Once you're happy with your sets:

1.  Review the **Lua Preview** on the right to ensure the code looks correct.
2.  Click the **Export** button in the Top Navigation bar.
3.  **Preview & Edit**: An **Export Preview** dialog will appear.
    - This allows you to do a final check of the full Lua code.
    - **You can edit this code directly!** If you need to add custom functions, comments, or tweak logic before saving, do it here.
4.  Click **Save Code** to download the file to your computer.

If you imported an existing file, the Studio is smart enough to **merge** your changes back into your original file structure, preserving your logic while updating the gear sets.

---

## 8. Troubleshooting & Resetting

If you want to start completely fresh, click the **Reset** button in the top menu. 
> [!CAUTION]
> This will purge all stored sets and character info from your browser's local storage. Make sure you've exported your work first!

---

*Happy Building, Adventurer!*
