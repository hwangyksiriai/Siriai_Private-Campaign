/**
 * 개발용 로컬 데이터 저장소 (JSON 파일 기반).
 *
 * ⚠️ 이 파일은 "전체 구조"를 보여주기 위한 임시 구현이에요.
 * 실제 서비스에서는 siriai-admin과 같은 Postgres(DATABASE_URL)를 붙이는 걸 권장해요 —
 * 그때는 이 파일의 함수 시그니처만 그대로 유지한 채 내부 구현을 adminDb() 쿼리로
 * 바꾸면 나머지 API 라우트/페이지 코드는 손댈 필요가 없도록 설계했습니다.
 * (컬럼명도 siriai-admin의 applications / influencers / submissions 테이블과 맞췄어요.)
 */
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { encryptRRN, decryptRRN } from "./rrnCrypto";

const DB_PATH = path.join(process.cwd(), ".data", "portal-db.json");

export type CampaignSection = "ongoing" | "new";

export type Campaign = {
  id: string;
  brand: string;
  category: string;
  channels: string[];
  title: string;
  product: string;
  hashtags: string[];
  applyEnd: string | null; // ISO date
  section: CampaignSection;
};

export type Influencer = {
  id: string;
  name: string;
  phone: string;
  instagramHandle: string;
  code: string;
};

export type ApplicationStatus = "applied" | "selected" | "rejected";

export type Application = {
  id: string;
  influencerId: string;
  campaignId: string;
  status: ApplicationStatus;
  createdAt: string;
  contentUrl: string | null;
  contentSubmittedAt: string | null;
  settleSubmittedAt: string | null;
  settleRealName: string | null;
  settlePhone: string | null;
  settleBankName: string | null;
  settleBankAccount: string | null;
  settleHolder: string | null;
  settleRrn: string | null; // encrypted
};

export type SecureProfile = {
  influencerId: string;
  realName: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  holder: string;
  rrn: string; // encrypted
  updatedAt: string;
};

export type AccessLog = {
  id: string;
  influencerId: string;
  code: string;
  accessedAt: string;
};

type Db = {
  influencers: Influencer[];
  campaigns: Campaign[];
  applications: Application[];
  secureProfiles: SecureProfile[];
  accessLogs: AccessLog[];
};

function seed(): Db {
  const influencers: Influencer[] = [
    { id: "inf_1", name: "김유나", phone: "010-1234-5678", instagramHandle: "@yuna_beauty", code: "YUNA2026" },
    { id: "inf_2", name: "박서준", phone: "010-2222-3333", instagramHandle: "@seojun.log", code: "SEOJUN01" },
    { id: "inf_3", name: "이하은", phone: "010-9999-8888", instagramHandle: "@haeun.daily", code: "HAEUN99" },
  ];

  const campaigns: Campaign[] = [
    {
      id: "c1",
      brand: "라니에르",
      category: "스킨케어",
      channels: ["Instagram", "YouTube"],
      title: "라니에르 9월 세라마이드 앰플 무상 협업",
      product: "세라마이드 리페어 앰플 30ml",
      hashtags: ["#라니에르", "#세라마이드", "#수분앰플", "#피부장벽"],
      applyEnd: addDays(7),
      section: "ongoing",
    },
    {
      id: "c2",
      brand: "볕뜰",
      category: "선케어",
      channels: ["Instagram", "YouTube", "TikTok"],
      title: "볕뜰 무기자차 선스틱 2종 기획 협업",
      product: "미네랄 선스틱 SPF50+ 2종",
      hashtags: ["#볕뜰", "#무기자차", "#선스틱", "#자외선차단"],
      applyEnd: addDays(3),
      section: "ongoing",
    },
    {
      id: "c3",
      brand: "결",
      category: "헤어케어",
      channels: ["Instagram", "YouTube"],
      title: "결 두피 스케일링 샴푸 무상 협업",
      product: "두피 스케일링 샴푸 500ml",
      hashtags: ["#결헤어", "#두피케어", "#탈모샴푸"],
      applyEnd: addDays(10),
      section: "ongoing",
    },
    {
      id: "c4",
      brand: "무이",
      category: "홈프래그런스",
      channels: ["Instagram"],
      title: "무이 가을 우드 디퓨저 신제품 시딩",
      product: "우드머스크 리드 디퓨저 200ml",
      hashtags: ["#무이", "#디퓨저", "#가을향"],
      applyEnd: addDays(5),
      section: "new",
    },
    {
      id: "c5",
      brand: "소반",
      category: "푸드",
      channels: ["Instagram", "TikTok"],
      title: "소반 저당 그래놀라 3종 체험단",
      product: "저당 그래놀라 오리지널/초코/베리",
      hashtags: ["#소반", "#저당간식", "#그래놀라"],
      applyEnd: addDays(9),
      section: "new",
    },
  ];

  const applications: Application[] = [
    {
      id: "app_1",
      influencerId: "inf_1",
      campaignId: "c1",
      status: "selected",
      createdAt: addDays(-6),
      contentUrl: null,
      contentSubmittedAt: null,
      settleSubmittedAt: null,
      settleRealName: null,
      settlePhone: null,
      settleBankName: null,
      settleBankAccount: null,
      settleHolder: null,
      settleRrn: null,
    },
    {
      id: "app_2",
      influencerId: "inf_2",
      campaignId: "c2",
      status: "applied",
      createdAt: addDays(-1),
      contentUrl: null,
      contentSubmittedAt: null,
      settleSubmittedAt: null,
      settleRealName: null,
      settlePhone: null,
      settleBankName: null,
      settleBankAccount: null,
      settleHolder: null,
      settleRrn: null,
    },
  ];

  // 김유나는 예전 캠페인에서 이미 정산정보를 한 번 제출한 적이 있다고 가정 (재사용 프롬프트 데모)
  const secureProfiles: SecureProfile[] = [
    {
      influencerId: "inf_1",
      realName: "김유나",
      phone: "010-1234-5678",
      bankName: "국민은행",
      bankAccount: "123456-78-901234",
      holder: "김유나",
      rrn: encryptRRN("9501011234567"),
      updatedAt: addDays(-40),
    },
  ];

  return { influencers, campaigns, applications, secureProfiles, accessLogs: [] };
}

function addDays(n: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function readDb(): Db {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw) as Db;
  } catch {
    const db = seed();
    writeDb(db);
    return db;
  }
}

function writeDb(db: Db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

export function getInfluencerByCode(code: string): Influencer | null {
  const db = readDb();
  return db.influencers.find((i) => i.code.toLowerCase() === code.trim().toLowerCase()) || null;
}

export function logAccess(influencerId: string, code: string): { visitCount: number } {
  const db = readDb();
  db.accessLogs.push({ id: randomUUID(), influencerId, code, accessedAt: new Date().toISOString() });
  writeDb(db);
  return { visitCount: db.accessLogs.filter((l) => l.influencerId === influencerId).length };
}

export function getVisitCount(influencerId: string): number {
  const db = readDb();
  return db.accessLogs.filter((l) => l.influencerId === influencerId).length;
}

export function listCampaigns(): { ongoing: Campaign[]; new: Campaign[] } {
  const db = readDb();
  return {
    ongoing: db.campaigns.filter((c) => c.section === "ongoing"),
    new: db.campaigns.filter((c) => c.section === "new"),
  };
}

export function listApplicationsForInfluencer(influencerId: string): Application[] {
  const db = readDb();
  return db.applications
    .filter((a) => a.influencerId === influencerId)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function createApplication(influencerId: string, campaignId: string): Application {
  const db = readDb();
  const existing = db.applications.find((a) => a.influencerId === influencerId && a.campaignId === campaignId);
  if (existing) return existing;
  const app: Application = {
    id: `app_${randomUUID().slice(0, 8)}`,
    influencerId,
    campaignId,
    status: "applied",
    createdAt: new Date().toISOString(),
    contentUrl: null,
    contentSubmittedAt: null,
    settleSubmittedAt: null,
    settleRealName: null,
    settlePhone: null,
    settleBankName: null,
    settleBankAccount: null,
    settleHolder: null,
    settleRrn: null,
  };
  db.applications.push(app);
  writeDb(db);
  return app;
}

export function getApplication(id: string): Application | null {
  const db = readDb();
  return db.applications.find((a) => a.id === id) || null;
}

export function submitContent(applicationId: string, contentUrl: string): Application | null {
  const db = readDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) return null;
  app.contentUrl = contentUrl;
  app.contentSubmittedAt = new Date().toISOString();
  writeDb(db);
  return app;
}

/** 이 인플루언서가 이전에 제출한 정산정보(재사용용)가 있는지 — RRN은 마스킹 없이 서버 내부에서만 사용 */
export function getSecureProfileSummary(
  influencerId: string
): { hasProfile: boolean; bankName?: string; maskedAccount?: string } {
  const db = readDb();
  const p = db.secureProfiles.find((s) => s.influencerId === influencerId);
  if (!p) return { hasProfile: false };
  const digits = p.bankAccount.replace(/\D/g, "");
  return {
    hasProfile: true,
    bankName: p.bankName,
    maskedAccount: digits.length > 4 ? "•".repeat(digits.length - 4) + digits.slice(-4) : digits,
  };
}

export function submitSettlementNew(
  applicationId: string,
  influencerId: string,
  payload: { realName: string; phone: string; bankName: string; bankAccount: string; holder: string; rrn: string }
): Application | null {
  const db = readDb();
  const app = db.applications.find((a) => a.id === applicationId);
  if (!app) return null;

  const rrnEnc = encryptRRN(payload.rrn);
  app.settleRealName = payload.realName;
  app.settlePhone = payload.phone;
  app.settleBankName = payload.bankName;
  app.settleBankAccount = payload.bankAccount;
  app.settleHolder = payload.holder;
  app.settleRrn = rrnEnc;
  app.settleSubmittedAt = new Date().toISOString();

  const idx = db.secureProfiles.findIndex((s) => s.influencerId === influencerId);
  const profile: SecureProfile = {
    influencerId,
    realName: payload.realName,
    phone: payload.phone,
    bankName: payload.bankName,
    bankAccount: payload.bankAccount,
    holder: payload.holder,
    rrn: rrnEnc,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) db.secureProfiles[idx] = profile;
  else db.secureProfiles.push(profile);

  writeDb(db);
  return app;
}

export function submitSettlementFromExistingProfile(applicationId: string, influencerId: string): Application | null {
  const db = readDb();
  const app = db.applications.find((a) => a.id === applicationId);
  const profile = db.secureProfiles.find((s) => s.influencerId === influencerId);
  if (!app || !profile) return null;

  app.settleRealName = profile.realName;
  app.settlePhone = profile.phone;
  app.settleBankName = profile.bankName;
  app.settleBankAccount = profile.bankAccount;
  app.settleHolder = profile.holder;
  app.settleRrn = profile.rrn;
  app.settleSubmittedAt = new Date().toISOString();

  writeDb(db);
  return app;
}

// decryptRRN re-exported for potential future admin-facing views (not used client-side)
export { decryptRRN };
