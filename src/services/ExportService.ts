import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Respects local overrides for Name and Era.
 * Fixes: Strict person-to-folder mapping and robust archival fetching.
 */

class ExportServiceImpl {
  async exportAsZip(
    tree: MemoryTree,
    _familyBio: string
  ): Promise<Blob> {
    const zip = new JSZip();
    
    // We create folders directly at the ZIP root for maximum visibility upon extraction
    const familyFolderName = "The Murray Family";
    const familyFolder = zip.folder(familyFolderName);
    
    const processedIds = new Set<string>();

    const downloadPromises = (tree.memories || []).map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        // Fetch the artifact data
        const response = await fetch(memory.photoUrl);
        if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
        const blob = await response.blob();

        let targetFolder = familyFolder;
        
        // --- ARCHIVAL SORTING LOGIC ---
        const personIds = memory.tags?.personIds || [];
        const isFamilywide = memory.tags?.isFamilyMemory;

        if (!isFamilywide && personIds.length > 0) {
          // Get the primary person attributed to this artifact
          const personId = personIds[0];
          const person = tree.people.find(p => String(p.id) === String(personId));
          
          if (person && person.id !== 'FAMILY_ROOT') {
            // Create or access the folder named after the person
            const personName = this.sanitizeFileName(person.name);
            targetFolder = zip.folder(personName) || familyFolder;
          }
        }

        // --- FILENAME GENERATION ---
        const year = new Date(memory.date || Date.now()).getFullYear();
        let baseName = this.sanitizeFileName(memory.name || 'artifact');
        const extension = this.getExtension(memory.photoUrl);
        
        // Prevent double extensions (e.g. Murray.jpg.jpg)
        const dotIdx = baseName.lastIndexOf('.');
        if (dotIdx !== -1 && baseName.substring(dotIdx).length < 6) {
          baseName = baseName.substring(0, dotIdx);
        }

        const fileName = `${year}_${baseName}${extension}`;
        
        if (targetFolder) {
          targetFolder.file(fileName, blob);
        }
      } catch (err) {
        console.error(`Archival Export Error [${memory.name}]:`, err);
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
    return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'artifact';
  }

  private getExtension(url: string): string {
    try {
      const cleanUrl = url.split('?')[0];
      const parts = cleanUrl.split('.');
      if (parts.length > 1) {
        const ext = parts.pop()?.toLowerCase();
        if (ext && ext.length < 5) return `.${ext}`;
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
