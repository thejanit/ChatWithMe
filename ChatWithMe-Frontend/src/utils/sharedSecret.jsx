// utils/sharedSecret.js
import baseURL from "../constants";
import { deriveSharedSecret } from "../utils/enc_dec";

const getOrCreateSharedSecret = async (otherUsername, token, sharedSecretsRef) => {
    let secret = sharedSecretsRef.current[otherUsername];
    if (!secret) {
        const res = await fetch(`${baseURL}/get-public-key/${otherUsername}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        if (!res.ok) {
        throw new Error("Failed to fetch public key");
        }
        const data = await res.json();
        const publicKey = data.public_key;
        const ownPrivateKey = localStorage.getItem("privateKey");
        secret = deriveSharedSecret(ownPrivateKey, publicKey);
        sharedSecretsRef.current[otherUsername] = secret;
    }
    return secret;
};

export default getOrCreateSharedSecret;
