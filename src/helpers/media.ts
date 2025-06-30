import axios from 'axios';
import crypto from 'crypto';

export const handleMedia = async (mediaPayload: {
  file_name: string;
  media_id: string;
  cdn_url: string;
  encryption_metadata: {
    encryption_key: string;
    hmac_key: string;
    hmac: string;
    iv: string;
    plaintext_hash: string;
    encrypted_hash: string;
  };
}): Promise<Buffer> => {
  const {
    file_name,
    cdn_url,
    encryption_metadata: {
      encryption_key,
      hmac_key,
      hmac,
      iv,
      plaintext_hash,
      encrypted_hash,
    },
  } = mediaPayload;

  console.log('📥 Downloading media from:', cdn_url);
  const response = await axios.get(cdn_url, { responseType: 'arraybuffer' });
  const cdnFile = Buffer.from(response.data);
  console.log('📦 File downloaded. Size:', cdnFile.length);

  const fileHash = crypto.createHash('sha256').update(cdnFile).digest('base64');
  console.log('🔐 Encrypted file hash:', fileHash);
  if (fileHash !== encrypted_hash) {
    throw new Error('Encrypted hash mismatch');
  }

  const ciphertext = cdnFile.slice(0, -10);
  const hmac10 = cdnFile.slice(-10);

  const hmacCalc = crypto.createHmac('sha256', Buffer.from(hmac_key, 'base64'));
  hmacCalc.update(Buffer.concat([Buffer.from(iv, 'base64'), ciphertext]));
  const fullHmac = hmacCalc.digest();
  const fullHmac10 = fullHmac.slice(0, 10);
  console.log('🔎 HMAC10 expected:', hmac10.toString('base64'));
  console.log('🔎 HMAC10 actual:  ', fullHmac10.toString('base64'));
  if (!hmac10.equals(fullHmac10)) {
    throw new Error('HMAC validation failed');
  }

  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(encryption_key, 'base64'),
    Buffer.from(iv, 'base64')
  );
  let decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);

  // Remove PKCS7 padding - without strict validation
  const padding = decrypted[decrypted.length - 1];
  console.log('Padding byte:', padding);
  if (padding < 1 || padding > 16) {
    console.warn('Padding byte out of range, skipping padding removal');
  } else {
    decrypted = decrypted.slice(0, -padding);
  }

  const decryptedHash = crypto.createHash('sha256').update(decrypted).digest('base64');
  console.log('✅ Plaintext hash expected:', plaintext_hash);
  console.log('✅ Plaintext hash actual:  ', decryptedHash);
  if (decryptedHash !== plaintext_hash) {
    throw new Error('Decrypted file hash mismatch');
  }

  return decrypted;
};