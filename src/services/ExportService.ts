import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Respects local overrides for Name and Era.
 * Fixes: Robust cross-origin fetch for ZIP population.
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
    const rootFolder = zip.folder("Schnitzel Bank Archive");
    if (!rootFolder) throw new Error("Could not create ZIP root");

    const familyFolder = rootFolder.folder("The Murray Family");
    
    const processedIds = new Set<string>();

    const downloadPromises = (tree.memories || []).map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        // Robust fetch with cross-origin considerations
        const response = await fetch(memory.photoUrl, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const blob = await response.blob();

        let targetFolder = familyFolder;
        
        // Person-specific folders
        const personIds = memory.tags?.personIds || [];
        if (!memory.tags?.isFamilyMemory && personIds.length > 0) {
          const personId = personIds[0];
          const person = tree.people.find(p => p.id === personId);
          if (person && person.id !== 'FAMILY_ROOT') {
            // Create or get the person's folder
            targetFolder = rootFolder.folder(person.name) || familyFolder;
          }
        }

        // Sanitize and name the file
        const year = new Date(memory.date).getFullYear();
        let baseName = this.sanitizeFileName(memory.name || 'artifact');
        const sourceExt = this.getExtension(memory.photoUrl);
        
        // Strip existing extensions to prevent double-extensions
        const lastDotIndex = baseName.lastIndexOf('.');
        if (lastDotIndex !== -1 && baseName.substring(lastDotIndex).length < 6) {
          baseName = baseName.substring(0, lastDotIndex);
        }

        const fileName = `${year}_${baseName}${sourceExt}`;
        targetFolder?.file(fileName, blob);
      } catch (err) {
        console.error(`Failed to export artifact: ${memory.name}`, err);
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
    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('.');
      if (parts.length > 1) {
        const ext = parts.pop()?.toLowerCase();
        return ext ? `.${ext}` : '.jpg';
      }
    } catch(e) {}
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