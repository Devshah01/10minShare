import crypto from 'crypto';

/**
 * Generates an 8-character URL-safe random string for share links
 */
export function generateShortCode(length = 8) {
  const characters = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += characters[bytes[i] % characters.length];
  }
  return result;
}
