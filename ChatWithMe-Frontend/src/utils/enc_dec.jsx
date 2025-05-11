import CryptoJS from "crypto-js";
import * as utilsEncDec from "../constants" // for testing

import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
import { encodeUTF8, decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

export const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, utilsEncDec.SHARED_SECRET).toString();
};

export const decryptMessage = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, utilsEncDec.SHARED_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Generate a new keypair
export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: naclUtil.encodeBase64(keyPair.publicKey),
    privateKey: naclUtil.encodeBase64(keyPair.secretKey),
  };
}

// Store keys in localStorage (for simplicity)
export function storeKeys(publicKey, privateKey) {
  localStorage.setItem("publicKey", publicKey);
  localStorage.setItem("privateKey", privateKey);
}

export function getStoredPublicKey() {
  return localStorage.getItem("publicKey");
}

export function getStoredPrivateKey() {
  return localStorage.getItem("privateKey");
}


// Generate shared secret
export function deriveSharedSecret(ownPrivateKeyBase64, receiverPublicKeyBase64) {
  const ownPrivateKeyUint8 = decodeBase64(ownPrivateKeyBase64);
  const receiverPublicKeyUint8 = decodeBase64(receiverPublicKeyBase64);
  const sharedSecret = nacl.box.before(receiverPublicKeyUint8, ownPrivateKeyUint8);
  return sharedSecret;
}

// Encrypt using shared secret
export function encryptMessageShared(message, sharedSecret) {
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const messageUint8 = decodeUTF8(message);
  const box = nacl.box.after(messageUint8, nonce, sharedSecret);
  return {
    nonce: encodeBase64(nonce),
    box: encodeBase64(box),
  };
}

// Decrypt using shared secret
export function decryptMessageShared(encryptedData, sharedSecret) {
  console.log("Encrypted Data Received: ", encryptedData);
  const nonce = decodeBase64(encryptedData.nonce);
  console.log("Decoded Nonce: ", nonce);
  const box = decodeBase64(encryptedData.box);
  console.log("Decoded Box: ", box); 
  console.log("Shared Secret: ", sharedSecret)
  const messageUint8 = nacl.box.open.after(box, nonce, sharedSecret);
  if (!messageUint8) {
    console.error("Decryption failed: Invalid message format.");
    throw new Error('Decryption failed');
  }
  return encodeUTF8(messageUint8);
}
