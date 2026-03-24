/**
 * Simple XOR-based obfuscation for API keys stored in MMKV.
 * NOT production-grade cryptography — just basic obfuscation
 * to avoid storing plaintext keys on disk.
 */

/**
 * XOR-encrypt a plaintext string with a secret key.
 * Returns a base64-encoded string.
 */
export function encrypt(plaintext: string, secret: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < plaintext.length; i++) {
    const charCode =
      plaintext.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
    bytes.push(charCode);
  }
  // Convert to base64-safe string
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Decrypt a base64-encoded XOR-encrypted string with the same secret.
 */
export function decrypt(encrypted: string, secret: string): string {
  const decoded = atob(encrypted);
  const chars: string[] = [];
  for (let i = 0; i < decoded.length; i++) {
    const charCode =
      decoded.charCodeAt(i) ^ secret.charCodeAt(i % secret.length);
    chars.push(String.fromCharCode(charCode));
  }
  return chars.join("");
}
