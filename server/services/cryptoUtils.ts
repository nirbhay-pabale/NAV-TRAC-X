import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY || 'navtrac_fallback_key_32_bytes_len!';
  return crypto.createHash('sha256').update(envKey).digest();
}

/**
 * Encrypts sensitive data (e.g. OAuth refresh token) using AES-256-GCM.
 */
export function encryptSensitiveData(text: string): { iv: string; ciphertext: string; tag: string } {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let ciphertext = cipher.update(text, 'utf8', 'hex');
  ciphertext += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    iv: iv.toString('hex'),
    ciphertext,
    tag,
  };
}

/**
 * Decrypts sensitive data using AES-256-GCM.
 */
export function decryptSensitiveData(encrypted: { iv: string; ciphertext: string; tag: string }): string {
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(encrypted.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(encrypted.tag, 'hex'));
  
  let plaintext = decipher.update(encrypted.ciphertext, 'hex', 'utf8');
  plaintext += decipher.final('utf8');
  return plaintext;
}

/**
 * Deterministic cryptographic hash utility (SHA-256 / SHA3-256).
 */
export function sha256(data: string | Buffer): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function generateUUID(): string {
  return crypto.randomUUID();
}
