/**
 * Saves a string content to a file.
 * Tries to use the modern File System Access API (showSaveFilePicker) first.
 * Falls back to the classic anchor link download method if the API is unavailable or fails.
 */
export async function saveStringToFile(content: string, suggestedName: string, mimeType = "text/x-lua"): Promise<void> {
  // 1. Try Modern File System Access API
  if ('showSaveFilePicker' in window) {
    try {
      // @ts-ignore - types for window.showSaveFilePicker might not be fully available in all setups
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: 'Lua Script',
          accept: { [mimeType]: ['.lua'] },
        }],
      });

      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled the picker, do nothing
        return;
      }
      console.warn("File System Access API failed, falling back to download anchor.", err);
    }
  }

  // 2. Fallback: Standard Download Anchor
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = suggestedName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
