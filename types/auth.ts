
export type Gender = "boy" | "girl";
export type StudentTheme = "marvel" | "princess";

export interface Avatar {
  id: string;
  name: string;
  imageUrl: string;
  theme: StudentTheme;
  minLevel: number;
}

export interface StudentProfile {
  uid: string;
  username: string;
  pinHash: string;
  gender: Gender;
  theme: StudentTheme;
  avatarId: string;
  yearGroup: number; // 7, 8, 9, 10, 11
  gcseExamDate?: string; // ISO string for Year 10-11
  xp: number;
  level: number;
  streak: number;
  lastLoginAt: string; // ISO string
  createdAt: string; // ISO string
}

export interface JWTSessionPayload {
  uid: string;
  username: string;
  gender: Gender;
  theme: StudentTheme;
  avatarId: string;
  yearGroup: number;
  gcseExamDate?: string;
  exp?: number;
}
