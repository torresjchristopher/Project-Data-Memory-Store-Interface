import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 */

class ExportServiceImpl {
  /**
   * Export memory tree as organized ZIP archive
   */
  async exportAsZip(
    tree: MemoryTree,
    _familyBio: string
  ): Promise<Blob> {
    const zip = new JSZip();
    const root = zip.folder("Schnitzel Bank Archive");
    if (!root) throw new Error("Could not create ZIP root");

    const familyFolder = root.folder("The Murray Family");
    
    // Track downloads to avoid duplicates
    const processedIds = new Set<string>();

    // 1. Process Memories
    const downloadPromises = tree.memories.map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        // Fetch the actual artifact blob
        const response = await fetch(memory.photoUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();

        // Determine target folder
        let targetFolder = familyFolder;
        
        if (!memory.tags.isFamilyMemory && memory.tags.personIds.length > 0) {
          const personId = memory.tags.personIds[0];
          const person = tree.people.find(p => p.id === personId);
          if (person && person.id !== 'FAMILY_ROOT') {
            targetFolder = root.folder(person.name) || familyFolder;
          }
        }

        // Add to ZIP
        const fileName = this.sanitizeFileName(memory.name || 'artifact') + this.getExtension(memory.photoUrl);
        targetFolder?.file(fileName, blob);
      } catch (err) {
        console.error(`Failed to download artifact: ${memory.name}`, err);
      }
    });

    await Promise.all(downloadPromises);

    // 2. Generate ZIP
    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }

  private sanitizeFileName(name: string): string {
    return name.replace(/[/\\?%*:|"<>]/g, '-').trim();
  }

  private getExtension(url: string): string {
    const cleanUrl = url.split('?')[0];
    const parts = cleanUrl.split('.');
    if (parts.length > 1) {
      const ext = parts.pop()?.toLowerCase();
      return ext ? `.${ext}` : '.jpg';
    }
    return '.jpg';
  }
}

// Singleton instance
let instance: ExportServiceImpl | null = null;

export const ExportService = {
  getInstance(): ExportServiceImpl {
    if (!instance) {
      instance = new ExportServiceImpl();
    }
    return instance;
  },
};