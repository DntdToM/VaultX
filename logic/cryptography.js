/**
 * @file cryptography.js
 * @description Cryptography dùng để bảo vệ dữ liệu trong extension.
 *
 * Trong file này có 5 phần chính:
 * - Băm master password
 * - Kiểm tra master password
 * - Mã hóa / giải mã dữ liệu bằng AES
 * - Đánh giá độ mạnh mật khẩu
 * - Sinh mật khẩu ngẫu nhiên bằng Fisher-Yates Shuffle
 */

const MASTER_PASSWORD_ITERATIONS = 210000;
const SALT_LENGTH = 16;
const NONCE_LENGTH = 12;
const TAG_LENGTH = 16;

const LOWERCASE_CHARS = "abcdefghijkmnopqrstuvwxyz";
const UPPERCASE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const NUMBER_CHARS = "23456789";
const SYMBOL_CHARS = "!@#$%^&*()-_=+[]{}";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSubtleCrypto() {
  if (!globalThis.crypto || !globalThis.crypto.subtle) {
    throw new Error("Web Crypto API khong kha dung trong moi truong hien tai.");
  }

  return globalThis.crypto.subtle;
}

function getRandomBytes(length) {
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
    return bytes;
  }

  for (let index = 0; index < length; index += 1) {
    bytes[index] = Math.floor(Math.random() * 256);
  }

  return bytes;
}

function bytesToBase64(bytes) {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes;
}

async function deriveBitsFromPassword(password, saltBytes, iterations = MASTER_PASSWORD_ITERATIONS) {
  const subtle = getSubtleCrypto();
  const passwordKey = await subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);

  return subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations,
      hash: "SHA-256"
    },
    passwordKey,
    256
  );
}

async function deriveAesKey(masterPassword, saltBytes, iterations = MASTER_PASSWORD_ITERATIONS) {
  const subtle = getSubtleCrypto();
  const passwordKey = await subtle.importKey("raw", encoder.encode(masterPassword), "PBKDF2", false, ["deriveKey"]);

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBytes,
      iterations,
      hash: "SHA-256"
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}

function timingSafeEqualStrings(left, right) {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < left.length; i += 1) {
    diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return diff === 0;
}

function fisherYatesShuffle(array) {
  const randomBytes = getRandomBytes(array.length);

  for (let i = array.length - 1; i > 0; i -= 1) {
    const randomIndex = randomBytes[i] % (i + 1);
    [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
  }

  return array;
}

/**
 * Băm master password để lưu an toàn hơn.
 *
 * @param {string} password
 * @param {string | null} [saltBase64=null]
 * @param {number} [iterations=210000]
 * @returns {Promise<{hash: string, salt: string, iterations: number}>}
 */
export async function hashMasterPassword(password, saltBase64 = null, iterations = MASTER_PASSWORD_ITERATIONS) {
  const saltBytes = saltBase64 ? base64ToBytes(saltBase64) : getRandomBytes(SALT_LENGTH);
  const derivedBits = await deriveBitsFromPassword(password, saltBytes, iterations);
  const hashBytes = new Uint8Array(derivedBits);

  return {
    hash: bytesToBase64(hashBytes),
    salt: bytesToBase64(saltBytes),
    iterations
  };
}

/**
 * Kiểm tra master password có đúng hay không.
 *
 * @param {string} password
 * @param {{hash: string, salt: string, iterations?: number}} credential
 * @returns {Promise<boolean>}
 */
export async function verifyMasterPassword(password, credential) {
  const savedHash = credential.hash;
  const savedSalt = credential.salt;
  const savedIterations = credential.iterations ?? MASTER_PASSWORD_ITERATIONS;

  const newCredential = await hashMasterPassword(password, savedSalt, savedIterations);
  return timingSafeEqualStrings(savedHash, newCredential.hash);
}

/**
 * Mã hóa chuỗi plaintext bằng AES-GCM.
 *
 * @param {string} plaintext
 * @param {string} masterPassword
 * @param {string} saltBase64
 * @returns {Promise<string>}
 */
export async function encryptAES(plaintext, masterPassword, saltBase64) {
  const saltBytes = base64ToBytes(saltBase64);
  const key = await deriveAesKey(masterPassword, saltBytes, MASTER_PASSWORD_ITERATIONS);
  const nonce = getRandomBytes(NONCE_LENGTH);
  const subtle = getSubtleCrypto();

  const encryptedBuffer = await subtle.encrypt(
    {
      name: "AES-GCM",
      iv: nonce
    },
    key,
    encoder.encode(plaintext)
  );

  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - TAG_LENGTH);
  const tag = encryptedBytes.slice(encryptedBytes.length - TAG_LENGTH);

  const finalBytes = new Uint8Array(NONCE_LENGTH + TAG_LENGTH + ciphertext.length);
  finalBytes.set(nonce, 0);
  finalBytes.set(tag, NONCE_LENGTH);
  finalBytes.set(ciphertext, NONCE_LENGTH + TAG_LENGTH);

  return bytesToBase64(finalBytes);
}

/**
 * Giải mã dữ liệu đã mã hóa bằng AES-GCM.
 *
 * @param {string} ciphertextBase64
 * @param {string} masterPassword
 * @param {string} saltBase64
 * @returns {Promise<string>}
 */
export async function decryptAES(ciphertextBase64, masterPassword, saltBase64) {
  const encryptedBytes = base64ToBytes(ciphertextBase64);
  const nonce = encryptedBytes.slice(0, NONCE_LENGTH);
  const tag = encryptedBytes.slice(NONCE_LENGTH, NONCE_LENGTH + TAG_LENGTH);
  const ciphertext = encryptedBytes.slice(NONCE_LENGTH + TAG_LENGTH);

  const combinedCiphertext = new Uint8Array(ciphertext.length + tag.length);
  combinedCiphertext.set(ciphertext, 0);
  combinedCiphertext.set(tag, ciphertext.length);

  const saltBytes = base64ToBytes(saltBase64);
  const key = await deriveAesKey(masterPassword, saltBytes, MASTER_PASSWORD_ITERATIONS);
  const subtle = getSubtleCrypto();

  const plaintextBuffer = await subtle.decrypt(
    {
      name: "AES-GCM",
      iv: nonce
    },
    key,
    combinedCiphertext
  );

  return decoder.decode(plaintextBuffer);
}

/**
 * Đánh giá độ mạnh của mật khẩu.
 *
 * @param {string} password
 * @returns {{score: number, label: string, feedback: string}}
 */
export function estimatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: "Yếu", feedback: "Mật khẩu không được để trống." };
  }

  const checks = [
    password.length >= 12,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ];

  const varietyBonus = checks.filter(Boolean).length * 15;
  const lengthBonus = Math.min(password.length, 20) * 2;
  const score = Math.min(100, varietyBonus + lengthBonus);

  if (score >= 85) {
    return { score, label: "Rất mạnh", feedback: "Đủ tốt để dùng làm Master Password." };
  }

  if (score >= 65) {
    return { score, label: "Mạnh", feedback: "Nên thêm một ký tự đặc biệt để tăng độ khó." };
  }

  if (score >= 40) {
    return { score, label: "Trung bình", feedback: "Cần thêm độ dài hoặc đa dạng ký tự." };
  }

  return { score, label: "Yếu", feedback: "Quá ngắn hoặc quá dễ đoán." };
}

/**
 * Sinh mật khẩu ngẫu nhiên theo tùy chọn đầu vào.
 *
 * @param {{length?: number, uppercase?: boolean, lowercase?: boolean, numbers?: boolean, symbols?: boolean}} [options={}]
 * @returns {string}
 */
export function generateSecurePassword(options = {}) {
  const config = {
    length: Math.max(8, Math.min(options.length || 18, 128)),
    uppercase: options.uppercase ?? true,
    lowercase: options.lowercase ?? true,
    numbers: options.numbers ?? true,
    symbols: options.symbols ?? true
  };

  const charSets = [
    config.uppercase ? UPPERCASE_CHARS : "",
    config.lowercase ? LOWERCASE_CHARS : "",
    config.numbers ? NUMBER_CHARS : "",
    config.symbols ? SYMBOL_CHARS : ""
  ];

  const alphabet = charSets.join("");
  if (!alphabet) {
    return "";
  }

  const poolSize = Math.max(config.length * 2, alphabet.length);
  const randomBytes = getRandomBytes(poolSize);
  const pool = Array.from(randomBytes, (byte) => alphabet[byte % alphabet.length]);

  fisherYatesShuffle(pool);
  return pool.slice(0, config.length).join("");
}
