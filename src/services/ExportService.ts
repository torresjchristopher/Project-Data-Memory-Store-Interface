import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Respects local overrides for Name and Era.
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
    
    const processedIds = new Set<string>();

    const downloadPromises = tree.memories.map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        const response = await fetch(memory.photoUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();

        let targetFolder = familyFolder;
        
        if (!memory.tags.isFamilyMemory && memory.tags.personIds.length > 0) {
          const personId = memory.tags.personIds[0];
          const person = tree.people.find(p => p.id === personId);
          if (person && person.id !== 'FAMILY_ROOT') {
            targetFolder = root.folder(person.name) || familyFolder;
          }
        }

        // Use the memory name and year for the filename
        const year = new Date(memory.date).getFullYear();
        const baseName = this.sanitizeFileName(memory.name || 'artifact');
        const fileName = `${year}_${baseName}${this.getExtension(memory.photoUrl)}`;
        
        targetFolder?.file(fileName, blob);
      } catch (err) {
        console.error(`Failed to download artifact: ${memory.name}`, err);
      }
    });

    await Promise.all(downloadPromises);

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

let instance: ExportServiceImpl | null = null;

export const ExportService = {
  getInstance(): ExportServiceImpl {
    if (!instance) {
      instance = new ExportServiceImpl();
    }
    return instance;
  },
};
