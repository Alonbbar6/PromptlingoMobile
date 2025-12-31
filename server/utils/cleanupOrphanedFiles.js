const fs = require('fs-extra');
const path = require('path');

/**
 * Cleanup Orphaned Audio Files
 *
 * This script removes audio files that are older than a specified age.
 * Audio files should only exist temporarily during transcription processing.
 * Any file older than 10 minutes is considered orphaned and will be deleted.
 *
 * Privacy Note: This ensures no user audio data persists on the server.
 */

const UPLOADS_DIR = path.join(__dirname, '../uploads');
const MAX_FILE_AGE_MS = 10 * 60 * 1000; // 10 minutes

async function cleanupOrphanedFiles() {
  try {
    console.log('🧹 [CLEANUP] Starting orphaned file cleanup...');

    // Check if uploads directory exists
    const exists = await fs.pathExists(UPLOADS_DIR);
    if (!exists) {
      console.log('   - Uploads directory does not exist, creating it...');
      await fs.ensureDir(UPLOADS_DIR);
      return;
    }

    // Get all files in uploads directory
    const files = await fs.readdir(UPLOADS_DIR);

    if (files.length === 0) {
      console.log('   - No files to clean up');
      return;
    }

    let deletedCount = 0;
    let skippedCount = 0;
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(UPLOADS_DIR, file);

      try {
        const stats = await fs.stat(filePath);

        // Skip directories
        if (stats.isDirectory()) {
          skippedCount++;
          continue;
        }

        // Check file age
        const fileAge = now - stats.mtimeMs;

        if (fileAge > MAX_FILE_AGE_MS) {
          await fs.remove(filePath);
          console.log(`   - Deleted orphaned file: ${file} (age: ${Math.round(fileAge / 60000)}min)`);
          deletedCount++;
        } else {
          skippedCount++;
        }
      } catch (fileError) {
        console.error(`   - Error processing file ${file}:`, fileError.message);
      }
    }

    console.log(`✅ [CLEANUP] Complete: ${deletedCount} deleted, ${skippedCount} kept`);
  } catch (error) {
    console.error('❌ [CLEANUP] Failed:', error.message);
  }
}

// If run directly (not imported)
if (require.main === module) {
  cleanupOrphanedFiles()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { cleanupOrphanedFiles };
