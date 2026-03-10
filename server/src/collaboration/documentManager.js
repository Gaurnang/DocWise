const Y = require('yjs');

class DocumentManager {
  constructor(storage) {
    this.storage = storage;
    this.docs = new Map();
    this.loadPromises = new Map();
  }

  async getOrCreate(documentId, initialContent = '') {
    if (this.docs.has(documentId)) {
      return this.docs.get(documentId);
    }

    if (this.loadPromises.has(documentId)) {
      return this.loadPromises.get(documentId);
    }

    const loadPromise = this.loadDocument(documentId, initialContent);
    this.loadPromises.set(documentId, loadPromise);

    try {
      const loadedDoc = await loadPromise;
      this.docs.set(documentId, loadedDoc);
      return loadedDoc;
    } finally {
      this.loadPromises.delete(documentId);
    }
  }

  async loadDocument(documentId, initialContent) {
    const ydoc = new Y.Doc();
    const ytext = ydoc.getText('content');

    ydoc.on('update', async () => {
      try {
        const snapshot = Y.encodeStateAsUpdate(ydoc);
        await this.storage.saveSnapshot(documentId, snapshot);
      } catch (error) {
        console.error(`Failed to persist Yjs snapshot for ${documentId}:`, error);
      }
    });

    const snapshot = await this.storage.loadSnapshot(documentId);

    if (snapshot) {
      Y.applyUpdate(ydoc, snapshot, 'storage');
    } else if (typeof initialContent === 'string' && initialContent.length > 0) {
      ytext.insert(0, initialContent);
      const initialSnapshot = Y.encodeStateAsUpdate(ydoc);
      await this.storage.saveSnapshot(documentId, initialSnapshot);
    }

    return ydoc;
  }

  async getText(documentId, initialContent = '') {
    const ydoc = await this.getOrCreate(documentId, initialContent);
    return ydoc.getText('content').toString();
  }

  async setText(documentId, nextContent, initialContent = '') {
    const ydoc = await this.getOrCreate(documentId, initialContent);
    const ytext = ydoc.getText('content');
    const current = ytext.toString();

    if (current === nextContent) {
      return current;
    }

    ydoc.transact(() => {
      if (ytext.length > 0) {
        ytext.delete(0, ytext.length);
      }
      ytext.insert(0, nextContent);
    }, 'server-text-sync');

    return ytext.toString();
  }

  async applyUpdate(documentId, update, initialContent = '') {
    const ydoc = await this.getOrCreate(documentId, initialContent);
    Y.applyUpdate(ydoc, update, 'socket-remote');
    return ydoc.getText('content').toString();
  }

  async getEncodedState(documentId, initialContent = '') {
    const ydoc = await this.getOrCreate(documentId, initialContent);
    return Y.encodeStateAsUpdate(ydoc);
  }

  async destroy(documentId) {
    const ydoc = this.docs.get(documentId);
    if (ydoc) {
      ydoc.destroy();
      this.docs.delete(documentId);
    }
    await this.storage.deleteSnapshot(documentId);
  }
}

module.exports = DocumentManager;
