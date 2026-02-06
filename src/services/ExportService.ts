import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Fixes: Robust cross-origin fetch and strict root-level folder population.
 */

class ExportServiceImpl {
  async exportAsZip(
    tree: MemoryTree,
    _familyBio: string
  ): Promise<Blob> {
    console.log("📂 Starting Archival Export...");
    const zip = new JSZip();
    const root = zip.folder("Schnitzel Bank Archive") || zip;

    // 1. PRE-CREATE ALL FOLDERS
    const familyFolder = root.folder("The Murray Family");
    const personFolderMap = new Map<string, JSZip>();

    (tree.people || []).forEach(person => {
      if (person.id !== 'FAMILY_ROOT') {
        const folder = root.folder(this.sanitize(person.name));
        if (folder) {
          personFolderMap.set(String(person.id), folder);
          console.log(`📁 Created folder for: ${person.name}`);
        }
      }
    });

    const processedIds = new Set<string>();
    let successCount = 0;

    // 2. DOWNLOAD AND SORT
    const downloadPromises = (tree.memories || []).map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        // Fetch with no-cache and cors mode to bypass stale blocks
        const response = await fetch(memory.photoUrl, { 
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();

        let targetFolder = familyFolder;
        
        // Sorting Logic
        const personIds = Array.isArray(memory.tags?.personIds) ? memory.tags.personIds : [];
        const isFamilywide = !!memory.tags?.isFamilyMemory;

        if (!isFamilywide && personIds.length > 0) {
          const primaryId = String(personIds[0]);
          targetFolder = personFolderMap.get(primaryId) || familyFolder;
        }

        // Filename Generation
        const year = new Date(memory.date || Date.now()).getFullYear();
        let baseName = this.sanitize(memory.name || 'artifact');
        const extension = this.getExt(memory.photoUrl);
        
        // Strip duplicate extensions
        const dotIdx = baseName.lastIndexOf('.');
        if (dotIdx !== -1 && baseName.substring(dotIdx).length < 6) {
          baseName = baseName.substring(0, dotIdx);
        }

        const fileName = `${year}_${baseName}${extension}`;
        if (targetFolder) {
          targetFolder.file(fileName, blob);
          successCount++;
          console.log(`✅ Added to ZIP: ${fileName}`);
        }
      } catch (err) {
        console.error(`❌ Export Failure [${memory.name}]:`, err);
      }
    });

    await Promise.all(downloadPromises);
    console.log(`📦 ZIP Composition Complete. Total Artifacts: ${successCount}`);

    return await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });
  }

  private sanitize(name: string): string {
    return name.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'artifact';
  }

  private getExt(url: string): string {
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
    if (!instance) instance = new ExportServiceImpl();
    return instance;
  },
};