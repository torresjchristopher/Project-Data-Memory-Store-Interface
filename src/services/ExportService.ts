import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Respects local overrides for Name and Era.
 * Fixes: Deep cache-busting to bypass CORS blocks and strict folder mapping.
 */

class ExportServiceImpl {
  async exportAsZip(
    tree: MemoryTree,
    _familyBio: string
  ): Promise<Blob> {
    console.log("📂 [EXPORT] Initializing Production Archival Build...");
    const zip = new JSZip();
    const root = zip.folder("Schnitzel Bank Archive") || zip;

    // 1. PRE-CREATE ALL FOLDERS AT THE ROOT
    const familyFolder = root.folder("The Murray Family");
    const personFolderMap = new Map<string, JSZip>();

    (tree.people || []).forEach(person => {
      if (person.id !== 'FAMILY_ROOT' && person.name !== 'Murray Archive') {
        const folderName = this.sanitize(person.name);
        const folder = root.folder(folderName);
        if (folder) personFolderMap.set(String(person.id), folder);
      }
    });

    const processedIds = new Set<string>();
    let successCount = 0;

    // 2. RESILIENT ARCHIVAL CAPTURE
    const downloadPromises = (tree.memories || []).map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        // DEEP CACHE-BUSTER: Append unique timestamp to bypass 'stale' CORS blocks in browser cache
        const archivalUrl = `${memory.photoUrl}${memory.photoUrl.includes('?') ? '&' : '?'}_archive_burst=${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        const response = await fetch(archivalUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);
        const blob = await response.blob();

        let targetFolder = familyFolder;
        const personIds = Array.isArray(memory.tags?.personIds) ? memory.tags.personIds : [];
        if (!memory.tags?.isFamilyMemory && personIds.length > 0) {
          const primaryId = String(personIds[0]);
          targetFolder = personFolderMap.get(primaryId) || familyFolder;
        }

        // --- FILENAME GENERATION ---
        const year = new Date(memory.date || Date.now()).getUTCFullYear();
        let baseName = this.sanitize(memory.name || 'artifact');
        const extension = this.getExt(memory.photoUrl);
        
        // Strip existing extensions from custom names
        const lastDot = baseName.lastIndexOf('.');
        if (lastDot !== -1 && baseName.substring(lastDot).length < 6) {
          baseName = baseName.substring(0, lastDot);
        }

        const fileName = `${year}_${baseName}${extension}`;
        if (targetFolder) {
          targetFolder.file(fileName, blob);
          successCount++;
          console.log(`✅ [ARCHIVED] ${fileName}`);
        }
      } catch (err: any) {
        console.error(`❌ [FAILED] ${memory.name}:`, err.message);
      }
    });

    await Promise.all(downloadPromises);
    console.log(`📦 [COMPLETED] ZIP composed with ${successCount} artifacts.`);

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