# P00-01 — ความเข้าใจข้อกำหนด FoundIt

วันที่: 2026-11-01 | Agent: GitHub Copilot | โปรเจกต์ที่ยืนยันแล้ว: p01
อ้างอิง: spec.md Version 1.0 Locked Baseline ทุกหัวข้อ 0–19 และ task.md ทุกหัวข้อ 0–22
เอกสารนี้เป็นสรุปเพื่อการตรวจรับ ไม่ใช่ข้อกำหนดทดแทนหรือการแก้ spec.md

## ขอบเขตผลิตภัณฑ์

FoundIt เป็นแพลตฟอร์มแจ้งของหาย/พบสิ่งของในโรงเรียนที่ทำงานจริง เริ่มหนึ่งโรงเรียนและเตรียม institutions สำหรับหลายโรงเรียน เป้าหมายคือประกาศ ค้นหา จับคู่ ตรวจสอบเจ้าของ และส่งคืน พร้อม Activity/Audit/Security Monitoring ไม่ใช่ static mockup (Spec 1, 4, 15)

หน้าจอครอบคลุม Public/Auth (Landing, Login, Register, Pending/Status, Forgot/Reset), Member (Dashboard, Lost/Found, Detail, สร้างประกาศแบบขั้นตอน, My Reports/Claims, Claim Submission/Detail, Notifications, Profile) และ Admin (Dashboard, Users, Reports, Claims, Ownership, Cash, Returns, Matching, Security, Logs, Notifications, Settings, Profile และ Maintenance แบบ optional) ตาม Spec 4

## Locked Rules ที่ต้องรักษา

1. ชื่อ FoundIt และเป้าหมาย/ฟีเจอร์หลัก/Business Rules ห้ามเปลี่ยนเอง; spec.md เป็น Source of Truth และ task.md ใช้ติดตามงาน (Spec 0)
2. permission_role มี MEMBER/ADMIN เท่านั้น ไม่มี SUPER_ADMIN; member_type เป็น STUDENT/TEACHER/STAFF แยกกัน; Admin ต้อง MFA และ re-auth สำหรับงานเสี่ยง ห้ามทำให้ไม่เหลือ Admin (Spec 1, 10)
3. สมัครใช้ชื่อจริง นามสกุล ชื่อเล่น Email Phone Password/Confirmation และ Member Type; Phone บังคับ 10 หลักเพื่อการติดต่อ ไม่ใช่ ID/Login ไม่มี Phone OTP; Student Code 5 หลักเฉพาะ STUDENT และ NULL สำหรับ TEACHER/STAFF; ห้ามเพิ่มวันเกิด/ชั้น/ห้องเอง (Spec 2)
4. Login เฉพาะ Email+Password; Email lowercase/unique ไม่สน case; Password hash เท่านั้น Confirmation ไม่เก็บ; บัญชีใหม่ MEMBER/PENDING รอ Admin และยังใช้ฟีเจอร์หลักไม่ได้ (Spec 2, 7)
5. Session ต้อง rotate หลัง Login; Cookie HttpOnly/Secure บน HTTPS/SameSite; state-changing cookie requests ใช้ CSRF; Remember Me ค่าเริ่มต้น 30 วัน เก็บ token hash และรองรับ expiry/rotation/revocation; Reset token สุ่ม มีอายุ ใช้ครั้งเดียว เก็บ hash ไม่เปิดเผยบัญชี/production token (Spec 2, 10)
6. UI ภาษาไทยเป็นหลัก Mobile-first รองรับมือถือ/แท็บเล็ต/Desktop Light/Dark พร้อมจำ preference, keyboard/focus/reduced motion, Loading/Empty/Error/Success/Disabled ตามเหมาะสม; ใช้ Anuphan และ Palette ตาม Spec 3 ไม่ใช้หน้าตา starter ปัจจุบันเป็น baseline design
7. Report LOST/FOUND มี public/private แยกชัด Status ACTIVE/MATCHED/CLAIM_PENDING/RETURNED/CLOSED ตรวจ transition ฝั่ง server; RETURNED จบงาน ย้อนเฉพาะ Admin override ที่ audit; ห้ามส่ง private ownership, cash amount/location/time, secret answers/evidence ให้ผู้ไม่มีสิทธิ์ ไม่เปิดเบอร์ตรงเป็นค่าเริ่มต้น (Spec 4–7)
8. Matching เปรียบ LOST กับ FOUND ใน institution เดียว ใช้ rule features และ image embeddings/similarity ไม่เรียก Chat AI ทุกคู่; hybrid weights ตั้งได้ บันทึก model/algorithm version และ non-secret breakdown; similarity ไม่ใช่หลักฐานเจ้าของ (Spec 5, 8)
9. Claim ตรวจสิทธิ์/สถานะ/attempt/rate limit; คำถามไม่เปิดเผยคำตอบ; answers/private details เข้ารหัส และ evidence จำกัดสิทธิ์; statuses ตาม Spec 5.2; AI labels CONSISTENT/PARTIAL/CONFLICTING/INSUFFICIENT เป็นคำแนะนำเท่านั้น Admin ตัดสินสุดท้ายและบันทึกเหตุผล/event/audit; AI ล่มยังให้ Admin review ได้
10. Cash ซ่อนยอดเงินจริงและข้อมูลส่วนตัว Exact match เป็นเพียง preliminary screening; หลาย claimant ไม่ใช้มาก่อนได้ก่อน; บันทึก custody/return และผู้รับฝาก; หลักฐานไม่พอคง review (Spec 5.5)
11. นัดส่งคืนได้หลัง Claim APPROVED; completion เปลี่ยน Claim COMPLETED กับ Report RETURNED พร้อม event/activity/audit ใน transaction (Spec 5.6)
12. DB ตาม Spec 6: MySQL 8.x InnoDB utf8mb4 UTC แสดง Asia/Bangkok; PK/FK/unique/indexes, transactions, phone/student code VARCHAR และเงิน DECIMAL; private payload application encryption และ key อยู่นอก DB; ครอบคลุมตาราง 6.2.1–6.2.26 รวม optional system_backups และ password reset/MFA/returns
13. API /api/v1 JSON envelope success/error และ HTTP status ตาม Spec 7; backend validate/authorize ทุก resource และ institution, bounded pagination, ไม่เชื่อ user_id/role/status จาก client; upload multipart ตรวจเนื้อหา/MIME/size สุ่มชื่อ เก็บ private นอก web root (Spec 6–7, 10)
14. Activity/Audit append-only ใช้ correction entry ไม่แก้ย้อนหลัง; ห้าม log password/token/keys/secret answers/private payload/evidence/PII เกินจำเป็น; Risk score และ shared IP/device เป็นเพียง signal ไม่ auto-ban/reject; รองรับ security review (Spec 9–10)
15. Stack ที่ล็อกใน Spec 8/11/12: HTML/CSS/Vanilla JS + PHP REST/PDO/PHP Session + MySQL 8 + optional Python/FastAPI แบบ modular monolith ห้ามเปลี่ยนเอง; seeds สมมติเท่านั้น ไม่มี weak admin production; bootstrap ปลอดภัยและ MFA (Spec 6, 12, 17)
16. Definition of Done ต้องมีงานจริง validation/authorization/error handling/privacy/logs/constraints ตามเหมาะสม และ happy/failure/security tests พร้อมเอกสาร; การสร้างไฟล์อย่างเดียวไม่ถือว่าเสร็จ (Spec 14–15)

## Open Decisions — ยังไม่อนุมัติหรือเลือกแทนผู้ใช้

ตาม Spec 18 มี 12 เรื่อง: Email Verification, Password Policy, Private Image Storage, Embedding Store, AI Provider/Adapter, Email Delivery, Admin MFA Method/Recovery, Institution Assignment, Report Retention, Privacy/Consent, Admin Bootstrap, Exact Locations/Map

ส่วนที่กระทบ user-visible policy ต้องเสนอและขออนุมัติก่อน ไม่มีการเปิด Email Verification/เลือก MFA/กำหนด retention/เพิ่มแผนที่ในงานนี้

## Repository เบื้องต้นก่อนแก้ไข

- Git HEAD d90963a; เริ่มงาน git status --short ว่าง ไม่มีการแก้/ย้อนงานเดิม
- มี package.json, server.js, public/index.html, public/style.css, public/index.js, README.md, .gitignore, spec.md, task.md และ local ignored .env; public/images/ เป็นโฟลเดอร์ว่าง
- อ่าน application ทั้งห้าไฟล์และ README/.gitignore แล้ว: starter Node CommonJS, static allowlist และ GET /api/health; frontend ภาษาอังกฤษ Light-only โทนเขียว ยังไม่มีระบบธุรกิจตาม Spec
- ยังไม่พบ PHP/PDO, DB schema/connection, auth/MFA, matching/claim/cash/admin หรือ automated test suite ใน tracked files; การตรวจละเอียดเป็น P00-02/P00-03 ไม่ติ๊กแทนในรอบนี้
- .env ถูกผู้ใช้แก้ก่อน session นี้: ไม่อ่านค่าลับ ไม่แก้ไฟล์ ไม่อ้างว่าค่า host/password ปัจจุบันว่างตาม README และไม่ลองเชื่อม DB

## ข้อขัดแย้ง/จุดหยุดที่ต้องยืนยันก่อน implementation

| เรื่อง | Spec/Tracker | Policy ห้อง revision 2 | แนวทางตอนนี้ |
|---|---|---|---|
| Runtime/Source | Spec 8/11/12 PHP/PDO + optional FastAPI และหลาย source files | node-commonjs, server.js, public และ application 5 ไฟล์เท่านั้น | ห้ามสร้าง PHP/Python หรือเปลี่ยน stack เอง รอผู้ใช้ยืนยันแนวทางที่สอดคล้อง policy |
| Database | Spec 6 MySQL 8, ตัวอย่าง env ใช้ DB_DATABASE/DB_USERNAME | MariaDB 3306, DB_NAME/DB_USER; p01 ใช้ db_std04_p01/user std04 | ห้ามใช้ DB legacy/เดา host/password; ยังไม่เลือกวิธีปรับ compatibility |
| Migrations | Spec 6.4/Task P02-02 มี schema/seed/runner/rollback | SQL ผ่านหน้าฐานข้อมูลเท่านั้น append-only ห้ามรันจาก Git/npm/server | ไม่สร้างหรือรัน migration runner และไม่แก้ประวัติ SQL |
| Images/Storage | Spec 6/10 private upload นอก web root | รูปโปรเจกต์ public/images/ และ sanitize/re-encode ก่อนเผยแพร่ | ต้องยืนยัน private storage ที่ policy รองรับ; ห้ามย้าย evidence มา public |
| Retention/Publication | Spec 18 retention ยังเปิด และมี Public screens/deployment | retention สูงสุด 365 วันรวม backups; publication.enabled=false | ไม่อนุญาต Public route หรือเลือก retention เกินเพดาน; Public UI ไม่ใช่สิทธิ์เผยแพร่ |
| Tracker IDs | P03-01 มี 3 รายการ, P03-02 ถึง P03-13 มี ID ละ 2 รายการ และหัวข้อ Phase ซ้ำ | ต้องรักษาประวัติ | คงเดิม รออนุมัติก่อนจัด canonical IDs; สรุปจำนวนจาก checklist occurrences จริง |

## ลำดับ Phase ที่รับทราบ (ยังไม่ใช่งาน P00-04 ที่เสร็จ)

P00 อ่าน/สำรวจ/gap/plan/open points → P01 Design System/UI → P02 DB/Backend → P03 Auth → P04 Reports → P05 Rule Matching → P06 Image AI → P07 Claims → P08 Ownership Review → P09 Cash → P10 Admin → P11 Security/Quality → P12 Deployment

ทุกงานต้องมีเกณฑ์ตรวจรับและหลักฐานก่อนเดินหน้า ไม่มีการสร้างระบบทั้งหมดในรอบนี้

## หลักฐานตรวจรับ P00-01

- อ่าน spec.md จนจบ Section 19 และ task.md จนจบ Section 22; สรุปครอบคลุม product/screens/DB/API/AI/security/roadmap/testing/DoD/environment/seeds/open points
- git hash-object spec.md และ git rev-parse HEAD:spec.md ตรงกัน: e8374dd4910479f3d7e2bb3879575e5de512336a จึงไม่ได้เปลี่ยน Locked Baseline
- git check-ignore .env คืน .env และ git ls-files ไม่มี .env; ไม่ใช่การสแกนความลับทั้ง history
- npm.cmd run check ผ่าน node --check server.js และ public/index.js; เป็น syntax check เท่านั้น ไม่ใช่การยืนยันฟีเจอร์/DB/UI/security scans
- นับเฉพาะ heading checklist Pxx-xx จริง: P00=5, P01=18, P02=30, P03=28, P04=15, P05=7, P06=9, P07=11, P08=9, P09=9, P10=17, P11=17, P12=10 รวม 185 occurrences (P03 มี ID ซ้ำ)
- P00-01 เป็นงานเอกสาร: UI/API/DB tests ไม่เกี่ยวกับการเปลี่ยนครั้งนี้; ไม่ติ๊กงาน implementation ใดจากผล syntax check
