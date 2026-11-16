/**
 * Returns the key used to sign and verify session tokens.
 * Fails fast when NEXTAUTH_SECRET is missing instead of falling back to a
 * guessable default.
 */
export function getAuthSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is not set. Add it to your .env file.");
  }
  return new TextEncoder().encode(secret);
}
