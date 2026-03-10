const fs = require('fs/promises');
const path = require('path');

class FileStorage {
  constructor(baseDir) {
    this.baseDir = baseDir;
  }

  getDocPath(documentId) {
    return path.join(this.baseDir, `${documentId}.bin`);
  }

  async ensureDir() {
    await fs.mkdir(this.baseDir, { recursive: true });
  }

  async loadSnapshot(documentId) {
    await this.ensureDir();
    const filePath = this.getDocPath(documentId);

    try {
      const data = await fs.readFile(filePath);
      return new Uint8Array(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  async saveSnapshot(documentId, stateVector) {
    await this.ensureDir();
    const filePath = this.getDocPath(documentId);
    const buffer = Buffer.from(stateVector);
    await fs.writeFile(filePath, buffer);
  }

  async deleteSnapshot(documentId) {
    const filePath = this.getDocPath(documentId);
    try {
      await fs.unlink(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

module.exports = FileStorage;
