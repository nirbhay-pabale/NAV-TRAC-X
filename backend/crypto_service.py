import hashlib
import hmac
import os

SIGNATURE_SCHEME_NAME = "Demo signature scheme (Ed25519 / Classical Stand-in)"
SECRET_KEY = os.environ.get("NAVTRAC_SIGNING_KEY", "navtrac-post-quantum-sovereign-master-key-2026").encode("utf-8")

def compute_sha3_256(data: bytes) -> str:
    """Computes SHA3-256 hash according to NIST FIPS 202."""
    hasher = hashlib.sha3_256()
    hasher.update(data)
    return hasher.hexdigest()

def compute_sha3_256_file(file_path: str) -> str:
    """Computes SHA3-256 hash of a file on disk."""
    hasher = hashlib.sha3_256()
    with open(file_path, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def sign_data(data: bytes, key: bytes = SECRET_KEY) -> str:
    """Creates a cryptographic HMAC-SHA3-256 stand-in signature."""
    sig = hmac.new(key, data, hashlib.sha3_256).hexdigest()
    return f"SIG-PQC-{sig[:48]}"

def verify_signature(data: bytes, signature_str: str, key: bytes = SECRET_KEY) -> bool:
    """Verifies the cryptographic signature."""
    expected = sign_data(data, key)
    return hmac.compare_digest(expected, signature_str)

def compute_merkle_root(leaf_hashes: list[str]) -> str:
    """Computes a Merkle root from a list of leaf hashes."""
    if not leaf_hashes:
        return compute_sha3_256(b"EMPTY_MERKLE_TREE")
    
    current = [h if len(h) == 64 else compute_sha3_256(h.encode("utf-8")) for h in leaf_hashes]
    while len(current) > 1:
        next_level = []
        for i in range(0, len(current), 2):
            left = current[i]
            right = current[i+1] if i+1 < len(current) else current[i]
            combined = compute_sha3_256((left + right).encode("utf-8"))
            next_level.append(combined)
        current = next_level
    return f"0x{current[0]}"
