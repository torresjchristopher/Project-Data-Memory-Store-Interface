import JSZip from 'jszip';
import type { MemoryTree } from '../types';

/**
 * ARCHIVE EXPORT SERVICE (OBSIDIAN EDITION)
 * Implements a high-caliber flat-folder structure for family preservation.
 * Fixes: Robust cross-origin fetch and precise person-to-folder mapping.
 */

class ExportServiceImpl {
  async exportAsZip(
    tree: MemoryTree,
    _familyBio: string
  ): Promise<Blob> {
    console.log("📂 [EXPORT] Initializing Archival Generation...");
    const zip = new JSZip();
    const root = zip.folder("Schnitzel Bank Archive") || zip;

    // 1. PRE-CREATE ALL FOLDERS
    const familyFolder = root.folder("The Murray Family");
    const personFolderMap = new Map<string, JSZip>();

    (tree.people || []).forEach(person => {
      if (person.id !== 'FAMILY_ROOT' && person.name !== 'Murray Archive') {
        const folderName = this.sanitize(person.name);
        const folder = root.folder(folderName);
        if (folder) {
          personFolderMap.set(String(person.id), folder);
          console.log(`📁 [EXPORT] Created folder for: ${person.name}`);
        }
      }
    });

    const processedIds = new Set<string>();
    let successCount = 0;
    let failCount = 0;

    // 2. DOWNLOAD AND SORT
    const downloadPromises = (tree.memories || []).map(async (memory) => {
      if (!memory.photoUrl || processedIds.has(memory.id)) return;
      processedIds.add(memory.id);

      try {
        console.log(`📡 [EXPORT] Downloading: ${memory.name}`);
        
        // Attempt to fetch the artifact
        // Adding a timestamp to bypass potential aggressive browser/CORS caching
        const fetchUrl = `${memory.photoUrl}${memory.photoUrl.includes('?') ? '&' : '?'}_archival=${Date.now()}`;
        
        const response = await fetch(fetchUrl, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit'
        });

        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
        
        const blob = await response.blob();
        console.log(`💎 [EXPORT] Received blob for ${memory.name} (${blob.size} bytes)`);

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
        
        // Strip double extensions
        const dotIdx = baseName.lastIndexOf('.');
        if (dotIdx !== -1 && baseName.substring(dotIdx).length < 6) {
          baseName = baseName.substring(0, dotIdx);
        }

        const fileName = `${year}_${baseName}${extension}`;
        
        if (targetFolder) {
          targetFolder.file(fileName, blob);
          successCount++;
          console.log(`✅ [EXPORT] Successfully archived: ${fileName}`);
        }
      } catch (err: any) {
        failCount++;
        console.error(`❌ [EXPORT] Failed artifact [${memory.name}]:`, err.message);
        console.warn("Hint: Ensure Firebase Storage CORS rules allow 'schnitzelbank.org'");
      }
    });

    await Promise.all(downloadPromises);
    
    console.log(`📦 [EXPORT] ZIP Composition Complete.`);
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Failed: ${failCount}`);

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
