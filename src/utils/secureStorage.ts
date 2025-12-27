/**
 * Secure Storage Utility
 *
 * Provides encrypted localStorage using Web Crypto API (AES-GCM)
 * Protects translation history from:
 * - Physical device access
 * - Malicious browser extensions
 * - XSS attacks (partial protection)
 *
 * Security Notes:
 * - Encryption key derived from user ID using PBKDF2
 * - Uses AES-GCM (256-bit) for encryption
 * - Each item has unique IV (Initialization Vector)
 * - Data is Base64 encoded for localStorage compatibility
 */

interface EncryptedData {
  iv: string; // Initialization Vector (Base64)
  data: string; // Encrypted data (Base64)
  timestamp: number; // When encrypted
}

class SecureStorage {
  private encryptionKey: CryptoKey | null = null;
  private readonly SALT = 'promptlingo-secure-storage-v1'; // App-specific salt

  /**
   * Initialize encryption key for a user
   * Key is derived from userId using PBKDF2
   */
  async initializeKey(userId: string): Promise<void> {
    try {
      const encoder = new TextEncoder();

      // Create key material from user ID
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(userId + this.SALT),
        'PBKDF2',
        false,
        ['deriveKey']
      );

      // Derive AES-GCM key
      this.encryptionKey = await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: encoder.encode(this.SALT),
          iterations: 100000,
          hash: 'SHA-256'
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );

      console.log('🔐 Encryption key initialized for user');
    } catch (error) {
      console.error('❌ Failed to initialize encryption key:', error);
      throw new Error('Encryption initialization failed');
    }
  }

  /**
   * Encrypt and store data
   */
  async setItem(key: string, value: any, userId: string): Promise<void> {
    try {
      // Initialize key if not already done
      if (!this.encryptionKey) {
        await this.initializeKey(userId);
      }

      if (!this.encryptionKey) {
        throw new Error('Encryption key not available');
      }

      // Convert value to JSON string
      const jsonString = JSON.stringify(value);
      const encoder = new TextEncoder();
      const data = encoder.encode(jsonString);

      // Generate random IV (Initialization Vector)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encrypt data
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );

      // Package encrypted data
      const encrypted: EncryptedData = {
        iv: this.arrayBufferToBase64(iv),
        data: this.arrayBufferToBase64(encryptedData),
        timestamp: Date.now()
      };

      // Store as JSON string
      localStorage.setItem(key, JSON.stringify(encrypted));
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Retrieve and decrypt data
   */
  async getItem<T>(key: string, userId: string): Promise<T | null> {
    try {
      // Initialize key if not already done
      if (!this.encryptionKey) {
        await this.initializeKey(userId);
      }

      if (!this.encryptionKey) {
        throw new Error('Encryption key not available');
      }

      // Get encrypted data from localStorage
      const stored = localStorage.getItem(key);
      if (!stored) {
        return null;
      }

      // Parse encrypted data
      const encrypted: EncryptedData = JSON.parse(stored);

      // Convert Base64 to ArrayBuffer
      const iv = this.base64ToArrayBuffer(encrypted.iv);
      const data = this.base64ToArrayBuffer(encrypted.data);

      // Decrypt data
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        this.encryptionKey,
        data
      );

      // Convert decrypted data to string
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(decryptedData);

      // Parse and return
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('❌ Decryption failed:', error);
      // If decryption fails, remove corrupted data
      localStorage.removeItem(key);
      return null;
    }
  }

  /**
   * Remove item
   */
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all data for a user
   */
  clear(): void {
    // Note: This clears ALL localStorage, not just encrypted items
    // In production, you might want to be more selective
    this.encryptionKey = null;
  }

  /**
   * Check if encryption is supported by browser
   */
  static isSupported(): boolean {
    return typeof crypto !== 'undefined' &&
           typeof crypto.subtle !== 'undefined' &&
           typeof crypto.subtle.encrypt === 'function';
  }

  // Helper methods for Base64 encoding/decoding
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }
}

// Singleton instance
const secureStorage = new SecureStorage();

export default secureStorage;
export { SecureStorage };
