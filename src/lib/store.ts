/**
 * siriai-admin과 같은 Postgres DB(DATABASE_URL)에 직접 붙는 데이터 계층.
 * 테이블/컬럼은 admin과 100% 공유 — 여기서 만든 신청/콘텐츠/정산은
 * 별도 동기화 없이 admin 화면에 바로 나타나요.
 *
 * 이 포털 전용으로 추가한 컬럼/테이블 (additive migration, 기존 데이터 영향 없음):
 *   - influencers.portal_code        (개인 초대 코드, unique)
 *   - campaigns.hub_visible          (포털에 노출할지, 기본 false — admin에서 켜야 노출)
 *   - campaigns.hub_is_new           (신규 캠페인 섹션 여부, 기본 false)
 *   - portal_access_logs             (코드 방문 기록, 내부 트래킹 전용)
 */
import { adminDb } from "./adminDb";
import { encryptRRN } from "./rrnCrypto";

export type CampaignSection = "ongoing" | "new";

export type Campaign = {
  id: string;
  brand: string;
  category: string;
  channels: string[];
  title: string;
  product: string;
  hashtags: string[];
  applyEnd: string | null;
  section: CampaignSection;
};

export type Influencer = {
  id: string;
  name: string;
  phone: string | null;
  instagramHandle: string;
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
  settleRrn: string | null;
};

// DB의 실제 상태값(pending/in_progress/그 외)을 포털 UI 상태로 매핑
function toUiStatus(dbStatus: string): ApplicationStatus {
  if (dbStatus === "pending") return "applied";
  if (dbStatus === "in_progress") return "selected";
  return "rejected";
}

function mapApplicationRow(r: Record<string, unknown>): Application {
  return {
    id: r.id as string,
    influencerId: r.influencer_id as string,
    campaignId: r.campaign_id as string,
    status: toUiStatus(r.status as string),
    createdAt: (r.created_at as Date).toISOString(),
    contentUrl: (r.content_url as string) ?? null,
    contentSubmittedAt: r.content_submitted_at ? (r.content_submitted_at as Date).toISOString() : null,
    settleSubmittedAt: r.settle_submitted_at ? (r.settle_submitted_at as Date).toISOString() : null,
    settleRealName: (r.settle_real_name as string) ?? null,
    settlePhone: (r.settle_phone as string) ?? null,
    settleBankName: (r.settle_bank_name as string) ?? null,
    settleBankAccount: (r.settle_bank_account as string) ?? null,
    settleHolder: (r.settle_holder as string) ?? null,
    settleRrn: (r.settle_rrn as string) ?? null,
  };
}

export async function getInfluencerByCode(code: string): Promise<Influencer | null> {
  const { rows } = await adminDb().query(
    `SELECT id, name, phone, handle FROM influencers WHERE lower(portal_code) = lower($1) LIMIT 1`,
    [code.trim()]
  );
  if (!rows.length) return null;
  const r = rows[0];
  return { id: r.id, name: r.name, phone: r.phone, instagramHandle: r.handle ? `@${r.handle}` : "" };
}

export async function logAccess(influencerId: string, code: string): Promise<void> {
  await adminDb().query(`INSERT INTO portal_access_logs (influencer_id, code) VALUES ($1, $2)`, [
    influencerId,
    code,
  ]);
}

export async function listCampaigns(): Promise<{ ongoing: Campaign[]; new: Campaign[] }> {
  const { rows } = await adminDb().query(`
    SELECT c.id, c.name, c.content_type, c.category, c.hashtags, c.product_name,
           c.timeline_apply_end, c.hub_is_new, b.name AS brand_name
      FROM campaigns c
      LEFT JOIN brands b ON b.id = c.brand_id
     WHERE c.hub_visible = true
     ORDER BY c.created_at DESC
  `);

  const campaigns: Campaign[] = rows.map((r) => ({
    id: r.id,
    brand: r.brand_name || "브랜드 미정",
    category: Array.isArray(r.category) && r.category.length ? r.category[0] : "기타",
    channels: r.content_type ? [r.content_type] : [],
    title: r.name,
    product: r.product_name || "",
    hashtags: (r.hashtags || "")
      .split(/[\s,]+/)
      .map((h: string) => h.trim())
      .filter(Boolean),
    applyEnd: r.timeline_apply_end ? new Date(r.timeline_apply_end).toISOString() : null,
    section: r.hub_is_new ? "new" : "ongoing",
  }));

  return {
    ongoing: campaigns.filter((c) => c.section === "ongoing"),
    new: campaigns.filter((c) => c.section === "new"),
  };
}

export async function listApplicationsForInfluencer(influencerId: string): Promise<Application[]> {
  const { rows } = await adminDb().query(
    `SELECT a.*, s.link AS content_url
       FROM applications a
       LEFT JOIN LATERAL (
         SELECT link FROM submissions WHERE application_id = a.id ORDER BY submitted_at DESC LIMIT 1
       ) s ON true
      WHERE a.influencer_id = $1
      ORDER BY a.created_at DESC`,
    [influencerId]
  );
  return rows.map(mapApplicationRow);
}

export async function createApplication(influencerId: string, campaignId: string): Promise<Application> {
  const db = adminDb();
  const { rows: existing } = await db.query(
    `SELECT * FROM applications WHERE influencer_id = $1 AND campaign_id = $2 LIMIT 1`,
    [influencerId, campaignId]
  );
  if (existing.length) return mapApplicationRow(existing[0]);

  const { rows } = await db.query(
    `INSERT INTO applications (campaign_id, influencer_id, applicant_name, applicant_phone, applicant_handle)
     SELECT $2, $1, name, phone, handle FROM influencers WHERE id = $1
     RETURNING *`,
    [influencerId, campaignId]
  );
  return mapApplicationRow(rows[0]);
}

export async function getApplication(id: string): Promise<Application | null> {
  const { rows } = await adminDb().query(
    `SELECT a.*, s.link AS content_url
       FROM applications a
       LEFT JOIN LATERAL (
         SELECT link FROM submissions WHERE application_id = a.id ORDER BY submitted_at DESC LIMIT 1
       ) s ON true
      WHERE a.id = $1`,
    [id]
  );
  if (!rows.length) return null;
  return mapApplicationRow(rows[0]);
}

export async function submitContent(applicationId: string, contentUrl: string): Promise<Application | null> {
  const db = adminDb();
  const upd = await db.query(`UPDATE submissions SET link = $2, submitted_at = now() WHERE application_id = $1`, [
    applicationId,
    contentUrl,
  ]);
  if (upd.rowCount === 0) {
    await db.query(`INSERT INTO submissions (application_id, link, submitted_at) VALUES ($1, $2, now())`, [
      applicationId,
      contentUrl,
    ]);
  }
  await db.query(`UPDATE applications SET content_submitted_at = now() WHERE id = $1`, [applicationId]);
  return getApplication(applicationId);
}

export async function getSecureProfileSummary(
  influencerId: string
): Promise<{ hasProfile: boolean; bankName?: string; maskedAccount?: string }> {
  const { rows } = await adminDb().query(
    `SELECT bank_name, bank_account FROM influencers WHERE id = $1 AND bank_account IS NOT NULL AND bank_account <> ''`,
    [influencerId]
  );
  if (!rows.length) return { hasProfile: false };
  const digits = String(rows[0].bank_account).replace(/\D/g, "");
  return {
    hasProfile: true,
    bankName: rows[0].bank_name || undefined,
    maskedAccount: digits.length > 4 ? "•".repeat(digits.length - 4) + digits.slice(-4) : digits,
  };
}

export async function submitSettlementNew(
  applicationId: string,
  influencerId: string,
  payload: { realName: string; phone: string; bankName: string; bankAccount: string; holder: string; rrn: string }
): Promise<Application | null> {
  const db = adminDb();
  const rrnEnc = encryptRRN(payload.rrn);

  await db.query(
    `UPDATE applications SET
       settle_real_name = $2, settle_phone = $3, settle_bank_name = $4,
       settle_bank_account = $5, settle_holder = $6, settle_rrn = $7, settle_submitted_at = now()
     WHERE id = $1`,
    [applicationId, payload.realName, payload.phone, payload.bankName, payload.bankAccount, payload.holder, rrnEnc]
  );

  // 인플루언서 프로필에도 저장 — 다음 캠페인부터 재사용 가능
  await db.query(
    `UPDATE influencers SET real_name = $2, phone = COALESCE(phone, $3), bank_name = $4, bank_account = $5, account_holder = $6
     WHERE id = $1`,
    [influencerId, payload.realName, payload.phone, payload.bankName, payload.bankAccount, payload.holder]
  );
  await db.query(
    `INSERT INTO influencer_secure (influencer_id, rrn, updated_at) VALUES ($1, $2, now())
     ON CONFLICT (influencer_id) DO UPDATE SET rrn = $2, updated_at = now()`,
    [influencerId, rrnEnc]
  );

  return getApplication(applicationId);
}

export async function submitSettlementFromExistingProfile(
  applicationId: string,
  influencerId: string
): Promise<Application | null> {
  const db = adminDb();
  const { rows: infRows } = await db.query(
    `SELECT real_name, phone, bank_name, bank_account, account_holder FROM influencers WHERE id = $1`,
    [influencerId]
  );
  const { rows: secRows } = await db.query(`SELECT rrn FROM influencer_secure WHERE influencer_id = $1`, [
    influencerId,
  ]);
  if (!infRows.length || !infRows[0].bank_account) return null;
  const inf = infRows[0];
  const rrn = secRows[0]?.rrn ?? null;

  await db.query(
    `UPDATE applications SET
       settle_real_name = $2, settle_phone = $3, settle_bank_name = $4,
       settle_bank_account = $5, settle_holder = $6, settle_rrn = $7, settle_submitted_at = now()
     WHERE id = $1`,
    [applicationId, inf.real_name, inf.phone, inf.bank_name, inf.bank_account, inf.account_holder, rrn]
  );

  return getApplication(applicationId);
}
