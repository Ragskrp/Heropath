import { EncryptJWT, jwtDecrypt } from "jose";
import { JWTSessionPayload } from "@/types/auth";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "default_jwt_secret_must_be_exactly_32_characters_long";
const key = new TextEncoder().encode(SECRET.padEnd(32, "0").slice(0, 32));

/**
 * Encrypts a payload into a JWE token.
 */
export async function encryptSession(payload: JWTSessionPayload): Promise<string> {
  return await new EncryptJWT({ ...payload })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .encrypt(key);
}

/**
 * Decrypts a JWE token and returns the payload.
 */
export async function decryptSession(token: string): Promise<JWTSessionPayload | null> {
  try {
    const { payload } = await jwtDecrypt(token, key);
    return payload as unknown as JWTSessionPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Gets the current session from the cookies.
 */
export async function getSession(): Promise<JWTSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return await decryptSession(token);
}

/**
 * Sets the JWE token in a secure HttpOnly cookie.
 */
export async function setSessionCookie(payload: JWTSessionPayload) {
  const token = await encryptSession(payload);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

/**
 * Clears the session cookie.
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
