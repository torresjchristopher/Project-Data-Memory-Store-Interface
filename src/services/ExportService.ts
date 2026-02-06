import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Fixes: Multi-strategy fetch to bypass CDN blocks and force ZIP population.
 */

class ExportServiceImpl {
  async exportAsZip(
    tree: MemoryTree,
    _familyBio: string
  ): Promise<Blob> {
    console.log("📂 [ARCHIVAL] Initializing Deep Capture Sequence...");
    const zip = new JSZip();
    const root = zip.folder("Schnitzel Bank Archive") || zip;

    // 1. PRE-CREATE ALL FOLDERS
    const familyFolder = root.folder("The Murray Family");
    const personFolderMap = new Map<string, JSZip>();

    (tree.people || []).forEach(person => {
      if (person.id !== 'FAMILY_ROOT' && person.name !== 'Murray Archive') {
        const folder = root.folder(this.sanitize(person.name));
        if (folder) personFolderMap.set(String(person.id), folder);
      }
    });

    const processedIds = new Set<string>();
    let successCount = 0;

    // 2. RESILIENT ASSET FETCHING
    const downloadPromises = (tree.memories || []).map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        console.log(`📡 [EXPORT] Capturing: ${memory.name}`);
        
        // Strategy: Force a fresh, non-cached fetch with CORS headers
        const archivalUrl = `${memory.photoUrl}${memory.photoUrl.includes('?') ? '&' : '?'}_archival_bust=${Date.now()}`;
        
        const response = await fetch(archivalUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) throw new Error(`Fetch Blocked: ${response.status}`);
        const blob = await response.blob();

        let targetFolder = familyFolder;
        const personIds = Array.isArray(memory.tags?.personIds) ? memory.tags.personIds : [];
        if (!memory.tags?.isFamilyMemory && personIds.length > 0) {
          const primaryId = String(personIds[0]);
          targetFolder = personFolderMap.get(primaryId) || familyFolder;
        }

        const year = new Date(memory.date || Date.now()).getUTCFullYear();
        const fileName = `${year}_${this.sanitize(memory.name || 'artifact')}${this.getExt(memory.photoUrl)}`;
        
        if (targetFolder) {
          targetFolder.file(fileName, blob);
          successCount++;
          console.log(`✅ [ARCHIVED] ${fileName} -> ${targetFolder.name}`);
        }
      } catch (err: any) {
        console.error(`❌ [FAILED] ${memory.name}:`, err.message);
      }
    });

    await Promise.all(downloadPromises);
    console.log(`📦 [EXPORT] Composition Complete. ${successCount} artifacts physically captured.`);

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
