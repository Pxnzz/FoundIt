# FoundIt — Task & Progress Tracker

> เอกสารแตกงานจาก `spec.md` สำหรับติดตามการพัฒนาแบบ Checklist ทีละส่วน

- **เวอร์ชัน:** 1.0
- **อ้างอิง:** `spec.md` (Source of Truth)
- **สถานะเริ่มต้น:** ยังไม่เริ่มทุกงาน จนกว่าจะมีหลักฐานการทำงานจริง
- **วันที่สร้าง:** 2026-10-31

## 0. วิธีใช้ไฟล์นี้และกติกาการอัปเดต

### 0.1 ความหมายของสถานะ
- `[ ]` ยังไม่เริ่ม
- `[/]` กำลังทำ
- `[x]` เสร็จและผ่านเกณฑ์ตรวจรับแล้ว
- `[!]` ติดปัญหา/รอข้อมูล/รอการตัดสินใจ
- `[-]` ไม่อยู่ในขอบเขตของรอบนี้หรือถูกยกเลิกโดยได้รับอนุมัติเท่านั้น

**ห้ามติ๊ก `[x]` เพียงเพราะสร้างไฟล์หรือเขียนโค้ดแล้ว** ต้องมีผลทดสอบหรือหลักฐานตามเกณฑ์ของงานนั้น

### 0.2 กติกาสำหรับ AI Agent
1. อ่าน `spec.md` และ `task.md` ก่อนเริ่ม Session ทุกครั้ง
2. ตรวจ Repository และ Git Status ก่อนแก้ไข ห้ามเขียนทับงานเดิมโดยไม่ตรวจ
3. ทำงานตามลำดับ Phase และ Task ID; ทำทีละงานหรือกลุ่มงานเล็กที่มีขอบเขตชัดเจน
4. ก่อนเริ่ม ให้เปลี่ยน `[ ]` เป็น `[/]` พร้อมบันทึกวันที่และสิ่งที่จะทำ
5. หลังทำงาน ต้องรันทดสอบที่เกี่ยวข้อง ตรวจไฟล์จริง และตรวจผลกระทบกับงานเดิม
6. เมื่อผ่านเกณฑ์ทั้งหมด ให้เปลี่ยน `[ / ]` เป็น `[x]` (รูปแบบที่ถูกต้องคือ `[/]` → `[x]`) และกรอกบันทึกผล
7. ถ้าทำไม่ครบ ให้คง `[/]` หรือเปลี่ยนเป็น `[!]` พร้อมระบุส่วนที่เสร็จ/ไม่เสร็จ ห้ามติ๊กเสร็จทั้งงาน
8. ถ้าพบข้อกำหนดขัดแย้ง ให้หยุดเฉพาะจุดนั้น อ้างอิงหัวข้อใน `spec.md` และถามผู้ใช้ ห้ามแก้ Business Rules เอง
9. หลังจบแต่ละ Session ให้อัปเดต Progress Summary, Work Log และ Next Actions ในไฟล์นี้
10. ห้ามลบประวัติการทำงานเดิม ให้เพิ่มบันทึกใหม่ต่อท้าย
11. ถ้าผู้ใช้สั่งแก้เฉพาะส่วน ให้แก้เฉพาะ Task ที่เกี่ยวข้องและคงส่วนอื่นไว้
12. ห้ามบันทึก Password, Token, API Key, Encryption Key, Secret Answers หรือข้อมูลส่วนบุคคลจริงลง Task Log

### 0.3 รูปแบบการอัปเดตงานแต่ละ Task
สำหรับทุก Task ให้บันทึกอย่างน้อย:
- ทำอะไร: ฟังก์ชัน/หน้าจอ/Schema/API ที่สร้างหรือแก้
- ทำที่ไหน: Path ของไฟล์, Folder, Table, Endpoint หรือหน้า UI
- ทำอย่างไร: ขั้นตอน implementation, logic, validation, permission และ state
- ผลลัพธ์: สิ่งที่ผู้ใช้ทำได้หลังเสร็จ
- ทดสอบอย่างไร: คำสั่ง/ขั้นตอนทดสอบและผลที่ได้
- หลักฐาน: Test name, Screenshot, API response ที่ลบข้อมูลลับแล้ว, Commit hash หรือ PR
- ปัญหา/ข้อสังเกต: สิ่งที่ยังไม่เสร็จหรือรอคำตอบ

### 0.4 ข้อห้ามที่ยึดจาก spec.md
- ไม่มี `SUPER_ADMIN`; มี `MEMBER` และ `ADMIN` เท่านั้น
- `member_type` แยกจาก `permission_role`
- Phone เป็นข้อมูลติดต่อ 10 หลัก ไม่ใช่ User ID และไม่ใช้ Login
- Login ด้วย Email + Password เท่านั้น; ไม่เพิ่ม Phone OTP
- UI ภาษาไทยเป็นหลัก, Mobile-first, Responsive, Light/Dark Mode
- AI เป็นคำแนะนำ; Admin ตัดสิน Claim ขั้นสุดท้าย
- ห้ามเปิดเผย Private Ownership Details, Cash Amount, Secret Answers, Evidence ต่อ Public/ผู้ไม่มีสิทธิ์
- ห้ามเก็บ Password/Token/Secret/Encryption Key แบบ Plaintext
- ห้าม Auto-ban/Auto-reject จาก Risk Score หรือ AI Score อย่างเดียว
- ห้ามเปลี่ยน Stack หรือ Business Rules ที่ล็อกไว้โดยไม่ได้รับอนุญาต

## 1. ภาพรวมความคืบหน้า
| Phase | หัวข้อ | งานทั้งหมด | เสร็จ | กำลังทำ | ติดปัญหา |
|---|---|---:|---:|---:|---:|
| P00 | Repository Audit & Planning | 5 | 1 | 0 | 0 |
| P01 | Foundation & Design System | 18 | 0 | 0 | 0 |
| P02 | Database & Backend Foundation | 30 | 0 | 0 | 0 |
| P03 | Authentication & Account | 28 | 0 | 0 | 0 |
| P04 | Reports & Search | 15 | 0 | 0 | 0 |
| P05 | Rule-based Matching | 7 | 0 | 0 | 0 |
| P06 | AI Image Matching | 9 | 0 | 0 | 0 |
| P07 | Claim System | 11 | 0 | 0 | 0 |
| P08 | Ownership Verification | 9 | 0 | 0 | 0 |
| P09 | Cash Recovery | 9 | 0 | 0 | 0 |
| P10 | Admin Control Center | 17 | 0 | 0 | 0 |
| P11 | Security & Quality | 17 | 0 | 0 | 0 |
| P12 | Deployment & Operations | 10 | 0 | 0 | 0 |

> ให้ AI Agent คำนวณตัวเลขจาก Checklist จริงทุกครั้งที่อัปเดต ไม่เดาความคืบหน้า
> อัปเดต 2026-11-01: นับ heading Pxx-xx ตามจำนวนรายการจริง ไม่รวม Inventory/WF/DoD; รวม 185 รายการ เสร็จ 1 รายการ; P03 มี ID ซ้ำจึงยังไม่ใช่จำนวน unique deliverables และไม่ลบ/รวมรายการเอง

## 2. Phase 0 — ตรวจสอบ Repository และวางแผน
### [x] P00-01 — อ่านข้อกำหนดทั้งหมด
- **ทำอะไร:** อ่าน `spec.md` ทั้งไฟล์และแปลงเป็นความเข้าใจร่วมก่อนเริ่มพัฒนา
- **ทำที่ไหน:** Root: `spec.md`, `task.md`
- **ทำอย่างไร:** อ่านทุกหัวข้อ ตั้งแต่ Product Overview, Screen, DB, API, AI, Security, Roadmap และ Open Points; สรุป Locked Rules กับ Open Decisions
- **ถือว่าเสร็จเมื่อ:** สรุปขอบเขตและข้อห้ามได้ครบ ไม่มีการตีความเปลี่ยนกฎ
- **บันทึกผลการทำงาน:** เริ่ม 2026-11-01 | Agent: GitHub Copilot | แผน: สรุปขอบเขต Locked Rules/Open Decisions และข้อขัดแย้งกับ policy โดยไม่แก้ spec.md หรือ application | Commit/PR: ยังไม่มี
- **ผลตรวจรับ 2026-11-01:** อ่าน Spec 0–19 และ Tracker 0–22 ครบ; สรุปขอบเขต กฎล็อก Open Decisions 12 เรื่อง และข้อขัดแย้งโดยไม่ตัดสินใจแทนผู้ใช้; เสร็จเฉพาะงานอ่าน/สรุป ไม่ได้อนุมัติ stack หรือ implementation
- **ไฟล์ที่สร้าง/แก้:** สร้าง `docs/requirements-understanding.md`; แก้ `task.md` เฉพาะสถานะ/สรุป/Work Log/Handoff; ไม่แก้ `spec.md`, application หรือ `.env`
- **ผลทดสอบ/หลักฐาน:** อ่านและตรวจเทียบทุกส่วนตามรายงาน; Spec Git blob เท่ากับ HEAD: `e8374dd4910479f3d7e2bb3879575e5de512336a`; `npm.cmd run check` ผ่าน; `.env` ถูก ignore และไม่อยู่ใน tracked files; นับ Task heading จริง 185 occurrences (รวม ID ซ้ำ)
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** Spec PHP/PDO/MySQL/FastAPI ขัด policy Node CommonJS/5 application files/MariaDB; migration runner และ private storage ต้องยืนยันแนวทาง; P03 ID ซ้ำยังไม่แก้; ไม่บล็อกการอ่านแต่บล็อก implementation ที่เกี่ยวข้อง

### [ ] P00-02 — สำรวจ Repository ปัจจุบัน
- **ทำอะไร:** ตรวจไฟล์และโค้ดที่มีอยู่ก่อนสร้างหรือแก้ไข
- **ทำที่ไหน:** Root ของ Repository ทั้งหมด
- **ทำอย่างไร:** ตรวจ `tree`/รายการไฟล์, package/config, Git status, README, frontend/backend/database; ห้าม overwrite ก่อนตรวจ
- **ถือว่าเสร็จเมื่อ:** มีรายงานโครงสร้างเดิมและไฟล์สำคัญ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P00-03 — ทำ Gap Analysis
- **ทำอะไร:** เปรียบเทียบสิ่งที่มีอยู่กับ `spec.md`
- **ทำที่ไหน:** `docs/` หรือรายงานใน PR
- **ทำอย่างไร:** ทำตาราง Existing / Missing / Conflict / Risk พร้อมอ้าง Task/Spec Section
- **ถือว่าเสร็จเมื่อ:** ผู้ใช้เห็นสิ่งที่มีและสิ่งที่ต้องทำโดยไม่เดา
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P00-04 — วาง Implementation Plan
- **ทำอะไร:** แตกงานเป็น Phase และ dependency
- **ทำที่ไหน:** `task.md`, `docs/`
- **ทำอย่างไร:** จัดลำดับตาม Roadmap ระบุ dependency, deliverables, tests และ milestone
- **ถือว่าเสร็จเมื่อ:** แผนสอดคล้องกับ Phase 1–12 และไม่ทำทุกระบบพร้อมกัน
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P00-05 — ตรวจ Open Points
- **ทำอะไร:** รวบรวมเรื่องที่ยังไม่ล็อก เช่น Email delivery, MFA method, storage, AI provider
- **ทำที่ไหน:** `spec.md` Section 18 และ `docs/decisions.md` (ถ้าสร้าง)
- **ทำอย่างไร:** แยก Implementation Decision ออกจาก Locked Business Rules; ถ้ากระทบผู้ใช้ให้ขออนุมัติก่อน
- **ถือว่าเสร็จเมื่อ:** ไม่มีการตัดสินใจเชิงนโยบายแทนผู้ใช้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 3. Phase 1 — Foundation & Design System
### [ ] P01-01 — ตั้งโครงสร้างโปรเจกต์
- **ทำอะไร:** สร้างโครงสร้าง Frontend, Backend, Database, Docs, Tests และ AI Service ตาม Spec
- **ทำที่ไหน:** Root: `FoundIt/`
- **ทำอย่างไร:** สร้างเฉพาะโฟลเดอร์และไฟล์เริ่มต้นที่จำเป็น; ตรวจโครงสร้างเดิมก่อน; อย่าใส่ Secret ใน Repo
- **ถือว่าเสร็จเมื่อ:** โครงสร้างชัดเจนและรัน/ทดสอบส่วนเริ่มต้นได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-02 — ตั้งค่า Git และไฟล์พื้นฐาน
- **ทำอะไร:** จัด `.gitignore`, `.env.example`, README เบื้องต้น
- **ทำที่ไหน:** Root: `.gitignore`, `.env.example`, `README.md`
- **ทำอย่างไร:** ignore `.env`, private uploads, logs, dependencies/build artifacts; ใส่เฉพาะ Placeholder ใน env example
- **ถือว่าเสร็จเมื่อ:** ไม่มี Secret หรือ Private Upload ถูก track
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-03 — กำหนด Design Tokens
- **ทำอะไร:** กำหนดสี, spacing, radius, shadow, typography และ breakpoint
- **ทำที่ไหน:** `frontend/assets/css/` เช่น `tokens.css`
- **ทำอย่างไร:** กำหนด Primary #7457FF, Secondary #35C9E8, Lime #C7F36B, Pink #FF8299, Background #F7F7FB; ใช้สีเน้นอย่างพอดี
- **ถือว่าเสร็จเมื่อ:** ทุกหน้าดึงค่าจาก Tokens เดียวกันและเปลี่ยนธีมได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-04 — ตั้งค่าฟอนต์ไทย
- **ทำอะไร:** นำ Anuphan มาใช้เป็นฟอนต์หลัก
- **ทำที่ไหน:** `frontend/assets/fonts/`, CSS typography
- **ทำอย่างไร:** ใช้ local font หรือวิธีโหลดที่เหมาะสม; กำหนด fallback LINE Seed Sans TH/IBM Plex Sans Thai/system sans-serif
- **ถือว่าเสร็จเมื่อ:** ภาษาไทยอ่านง่ายและไม่เกิด layout แตก
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-05 — สร้าง Theme System
- **ทำอะไร:** รองรับ Light Mode และ Dark Mode
- **ทำที่ไหน:** CSS Theme Tokens, `assets/js/theme.js`, Shared Layout
- **ทำอย่างไร:** กำหนด semantic tokens สำหรับ background/surface/text/border/status; Theme Toggle; จำค่าตาม preference ที่เหมาะสม
- **ถือว่าเสร็จเมื่อ:** สลับธีมแล้วทุก component อ่านง่ายและสถานะยังชัด
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-06 — สร้าง Responsive App Shell
- **ทำอะไร:** สร้าง Header, Sidebar, Mobile Navigation และ Page Container
- **ทำที่ไหน:** `frontend/assets/`, shared layout files
- **ทำอย่างไร:** Desktop ใช้ Sidebar/Top Nav ตามเหมาะสม; Mobile ใช้ Bottom Nav/Drawer; กำหนด breakpoints และ safe spacing
- **ถือว่าเสร็จเมื่อ:** ไม่มี horizontal overflow และ navigation ใช้งานได้ทุกขนาด
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-07 — สร้าง Button และ IconButton
- **ทำอะไร:** สร้างปุ่มมาตรฐานทุกสถานะ
- **ทำที่ไหน:** Shared UI Components
- **ทำอย่างไร:** รองรับ primary/secondary/tertiary/danger, hover/focus/pressed/disabled/loading; มี accessible label
- **ถือว่าเสร็จเมื่อ:** ปุ่มมี visual state และ feedback สม่ำเสมอ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-08 — สร้าง Form Components
- **ทำอะไร:** สร้าง Input, Select, Textarea, FormField, PasswordInput
- **ทำที่ไหน:** Shared UI Components
- **ทำอย่างไร:** รองรับ label, helper text, required, validation error, disabled, focus; PasswordInput มี show/hide
- **ถือว่าเสร็จเมื่อ:** ใช้ซ้ำได้และแสดง error ต่อ field ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-09 — สร้าง Search & Filter Components
- **ทำอะไร:** สร้าง SearchBar, FilterPanel, FilterChip
- **ทำที่ไหน:** Shared UI Components
- **ทำอย่างไร:** รองรับ query, filter state, clear all, responsive drawer และ keyboard interaction
- **ถือว่าเสร็จเมื่อ:** ค้นหาและล้าง filter ได้จริง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-10 — สร้าง Data Display Components
- **ทำอะไร:** สร้าง ItemCard, StatusBadge, Avatar, Tabs, Pagination
- **ทำที่ไหน:** Shared UI Components
- **ทำอย่างไร:** ออกแบบ variants สำหรับ Lost/Found และสถานะ; รองรับข้อมูลยาวและรูปหาย
- **ถือว่าเสร็จเมื่อ:** ข้อมูลแสดงชัดและไม่ overflow
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-11 — สร้าง Feedback Components
- **ทำอะไร:** สร้าง Modal, Drawer, Toast, ConfirmDialog, EmptyState, LoadingSkeleton
- **ทำที่ไหน:** Shared UI Components
- **ทำอย่างไร:** กำหนด focus management, Escape/close, confirm destructive action, loading/error/empty
- **ถือว่าเสร็จเมื่อ:** ทุก action สำคัญมี feedback และ dialog ใช้งานได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-12 — สร้าง ImageUploader และ DateTimePicker
- **ทำอะไร:** สร้างส่วนอัปโหลดภาพและเลือกวันเวลา
- **ทำที่ไหน:** Shared UI Components
- **ทำอย่างไร:** แสดง preview, progress, remove, file type/size error; DateTimePicker รองรับ approximate/range ตามความต้องการ
- **ถือว่าเสร็จเมื่อ:** อัปโหลด/เลือกวันเวลาได้และ error ชัดเจน
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-13 — สร้าง NotificationBell และ ThemeToggle
- **ทำอะไร:** สร้าง component แจ้งเตือนและเปลี่ยนธีม
- **ทำที่ไหน:** Header/shared components
- **ทำอย่างไร:** NotificationBell แสดง unread count; ThemeToggle เปลี่ยน theme จริง
- **ถือว่าเสร็จเมื่อ:** component เชื่อม state ได้และ responsive
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-14 — ทำ Accessibility & Motion
- **ทำอะไร:** รองรับ keyboard, focus, contrast และ reduced motion
- **ทำที่ไหน:** Global CSS และทุก shared component
- **ทำอย่างไร:** ตรวจ Tab order, visible focus, semantic HTML, aria labels, `prefers-reduced-motion`; ไม่ใช้ animation มากเกินไป
- **ถือว่าเสร็จเมื่อ:** ทำงานด้วย keyboard ได้และลด motion ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-15 — สร้าง Landing Page UI
- **ทำอะไร:** สร้างหน้าแนะนำ FoundIt ตาม Screen Spec
- **ทำที่ไหน:** `frontend/index.html` และ assets
- **ทำอย่างไร:** Header, Hero, Tagline, CTA, Search Preview, How It Works, Feature Highlights, Recent Public Reports, Footer; Guest CTA redirect Login เมื่อจำเป็น
- **ถือว่าเสร็จเมื่อ:** หน้าแสดงภาษาไทยครบ Responsive และไม่มีข้อมูลลับ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-16 — สร้าง Login UI
- **ทำอะไร:** สร้างหน้า Login
- **ทำที่ไหน:** `frontend/login.html`
- **ทำอย่างไร:** Email, Password show/hide, Remember Me, Login, Register link, Forgot Password, loading/error; error ไม่บอกว่า email มีอยู่หรือไม่
- **ถือว่าเสร็จเมื่อ:** UI ตรง Spec และ form validation เบื้องต้นทำงาน
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-17 — สร้าง Register UI
- **ทำอะไร:** สร้าง Step Registration 4 ขั้น
- **ทำที่ไหน:** `frontend/register.html`
- **ทำอย่างไร:** Step 1 profile/member type; Step 2 email/phone/student code conditional; Step 3 password/confirm; Step 4 review; progress/back/next
- **ถือว่าเสร็จเมื่อ:** ทุกฟิลด์และ conditional student code ทำงานตาม Spec
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P01-18 — ตรวจ Responsive และ Theme ทุกหน้าเริ่มต้น
- **ทำอะไร:** ทดสอบ Landing/Login/Register บนมือถือ แท็บเล็ต Desktop และสองธีม
- **ทำที่ไหน:** Browser DevTools / `tests/`
- **ทำอย่างไร:** ทดสอบ viewport หลายขนาด, focus, validation, overflow, dark mode
- **ถือว่าเสร็จเมื่อ:** ไม่มีจุดแตกสำคัญและบันทึกผลทดสอบ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 4. Phase 2 — Database & Backend Foundation

### Session scope 2026-11-01 — foundation tested; deployment in progress
- User approved rebuilding from current files and commit/push to Pxnzz/FoundIt main for p01. Portal confirmed room1/std04/p01 and saved GitHub URL.
- Node CommonJS/mysql2 in server.js replaces PHP/PDO under classroom policy; locked spec is unchanged. This does not complete the product or all Phase 2 criteria.
- Router/envelopes/strict JSON and bounded DB pool implemented. Local HTTP tests: 21 cases passed; wrong DB identity returns generic 503. Syntax passed; npm audit reports zero vulnerabilities.
- Migration revision 1 accepted by the Database portal (three CREATE TABLE statements). Apply is disabled; owner std04 executed it directly after SELECT DATABASE() verified db_std04_p01 and SHOW TABLES confirmed empty.
- institutions/users/categories exist; transaction-based constraint/create/read/update tests passed and were rolled back. No seed, deletion, existing-data change or fabricated platform applied history.
- updated_at must be explicitly assigned by future UPDATE queries. Initial SQL parser compatibility changes preserved required constraints. Accepted SQL is now append-only and ignored by Git.
- Local env validated privately; managed runtime env inspected and preserved, including its separate DB identity. Auth returns AUTH_NOT_READY; no product E2E acceptance claimed.
- MCP tools unavailable; authenticated portal used instead. Evidence: docs/phase-2-backend-foundation.md. Deployment/scan/runtime confirmation pending.

### [ ] P02-01 — ออกแบบ ER Diagram
- **ทำอะไร:** แสดง Entity, PK/FK, Cardinality และ relationship
- **ทำที่ไหน:** `docs/erd.md` หรือ `docs/erd.mmd`
- **ทำอย่างไร:** ครอบคลุมตารางทั้งหมดใน Phase Database; ตรวจ Report–Claim–Return และ User–Institution relations
- **ถือว่าเสร็จเมื่อ:** ERD ตรงกับ schema และอธิบาย relation ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-02 — สร้าง Migration Framework
- **ทำอะไร:** กำหนดวิธี versioning และ rollback schema
- **ทำที่ไหน:** `database/migrations/`
- **ทำอย่างไร:** ตั้ง naming convention, migration runner และวิธี apply/rollback; ห้ามแก้ production ด้วยมือ
- **ถือว่าเสร็จเมื่อ:** สร้าง/ย้อน migration ใน local ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [/] P02-03 — สร้าง Institutions Schema
- **ทำอะไร:** สร้างตารางโรงเรียน
- **ทำที่ไหน:** Migration: `institutions`
- **ทำอย่างไร:** กำหนด PK, name, code unique, address, active, timestamps, InnoDB/utf8mb4
- **ถือว่าเสร็จเมื่อ:** FK ที่อ้าง institutions ใช้งานได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [/] P02-04 — สร้าง Users Schema
- **ทำอะไร:** สร้าง users และกฎ member/permission
- **ทำที่ไหน:** Migration: `users`
- **ทำอย่างไร:** เพิ่ม fields ตาม Spec; unique email normalized, student_code nullable unique, phone VARCHAR(10), enums; index/FK institution
- **ถือว่าเสร็จเมื่อ:** Schema แยก member_type/permission_role และ constraints ถูกต้อง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [/] P02-05 — สร้าง Categories Schema
- **ทำอะไร:** สร้างหมวดหมู่
- **ทำที่ไหน:** Migration: `categories`
- **ทำอย่างไร:** FK institution; name/slug/description/is_active/sort_order; unique institution+slug
- **ถือว่าเสร็จเมื่อ:** เพิ่ม/อ่านหมวดหมู่ตามโรงเรียนได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-06 — สร้าง Reports Schema
- **ทำอะไร:** สร้างตารางประกาศ Lost/Found
- **ทำที่ไหน:** Migration: `reports`
- **ทำอย่างไร:** เพิ่ม report_type, public fields, location, occurred_at/time_precision, status, is_cash, timestamps; indexes ตาม Spec
- **ถือว่าเสร็จเมื่อ:** แยก LOST/FOUND และสถานะได้ถูกต้อง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-07 — สร้าง Report Images Schema
- **ทำอะไร:** สร้าง metadata รูปภาพประกาศ
- **ทำที่ไหน:** Migration: `report_images`
- **ทำอย่างไร:** FK report, storage_key private, mime, size, dimensions, sort_order; ห้ามเก็บ binary ใน public path
- **ถือว่าเสร็จเมื่อ:** รูปเชื่อมกับ report และ storage key ไม่เปิดเผย
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-08 — สร้าง Matches Schema
- **ทำอะไร:** สร้างตารางผลจับคู่
- **ทำที่ไหน:** Migration: `matches`
- **ทำอย่างไร:** FK lost_report/found_report, scores 0–100, feature JSON no secret, algorithm version, status, reviewer, unique pair
- **ถือว่าเสร็จเมื่อ:** ไม่เกิดคู่ซ้ำและตรวจคู่ LOST/FOUND ฝั่ง service
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-09 — สร้าง Claims Schema
- **ทำอะไร:** สร้างตารางคำร้อง
- **ทำที่ไหน:** Migration: `claims`
- **ทำอย่างไร:** FK report/claimant/reviewer; statuses, attempt_number, claimant_description, decision reason, timestamps, indexes
- **ถือว่าเสร็จเมื่อ:** Claim เชื่อม Found Report และผู้ยื่นได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-10 — สร้าง Ownership Secrets Schema
- **ทำอะไร:** จัดเก็บ private ownership payload
- **ทำที่ไหน:** Migration: `ownership_secrets`
- **ทำอย่างไร:** FK unique report; encrypted payload LONGBLOB; key version; application encryption
- **ถือว่าเสร็จเมื่อ:** ไม่มี Secret Plaintext ใน DB
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-11 — สร้าง Claim Answers Schema
- **ทำอะไร:** จัดเก็บคำตอบลับ
- **ทำที่ไหน:** Migration: `claim_answers`
- **ทำอย่างไร:** FK claim, question_key, encrypted answer, created_at
- **ถือว่าเสร็จเมื่อ:** คำตอบถูกเข้ารหัสและไม่อยู่ใน public query
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-12 — สร้าง Claim Evidence Schema
- **ทำอะไร:** จัดเก็บหลักฐาน Claim
- **ทำที่ไหน:** Migration: `claim_evidence`
- **ทำอย่างไร:** FK claim/uploader; private storage key, sanitized filename, MIME, size, timestamp
- **ถือว่าเสร็จเมื่อ:** ไฟล์หลักฐานเข้าถึงได้เฉพาะผู้มีสิทธิ์
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-13 — สร้าง AI Reviews Schema
- **ทำอะไร:** เก็บผล AI Review
- **ทำที่ไหน:** Migration: `ai_reviews`
- **ทำอย่างไร:** review_type, label, score, summary, JSON details, model/version
- **ถือว่าเสร็จเมื่อ:** เก็บผลย้อนหลังและแยกประเภท review ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-14 — สร้าง Claim Events Schema
- **ทำอะไร:** เก็บประวัติสถานะ Claim
- **ทำที่ไหน:** Migration: `claim_events`
- **ทำอย่างไร:** actor nullable for system, event type, from/to status, safe note, timestamp
- **ถือว่าเสร็จเมื่อ:** ทุก transition สำคัญมี event
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-15 — สร้าง Cash Details Schema
- **ทำอะไร:** เก็บข้อมูลเงินสดส่วนตัว
- **ทำที่ไหน:** Migration: `found_cash_details`
- **ทำอย่างไร:** encrypted amount/location/time; currency; custody status; custodian/staff; timestamps
- **ถือว่าเสร็จเมื่อ:** ไม่มีจำนวนเงินจริงใน public data
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-16 — สร้าง Notifications Schema
- **ทำอะไร:** เก็บการแจ้งเตือน
- **ทำที่ไหน:** Migration: `notifications`
- **ทำอย่างไร:** user FK, type/title/message, target type/id, read flag/time, created_at
- **ถือว่าเสร็จเมื่อ:** ดึงเฉพาะ notification ของเจ้าของบัญชี
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-17 — สร้าง Session และ Remember Token Schemas
- **ทำอะไร:** จัดการ session/device และ persistent token
- **ทำที่ไหน:** Migrations: `user_sessions`, `remember_tokens`
- **ทำอย่างไร:** session_hash only; remember selector unique + token_hash; expiry/revocation/device metadata
- **ถือว่าเสร็จเมื่อ:** ไม่มี raw session id หรือ remember token ใน DB
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-18 — สร้าง Activity/Security Schemas
- **ทำอะไร:** สร้าง activity_logs, security_alerts, risk_scores
- **ทำที่ไหน:** Migrations ตามชื่อตาราง
- **ทำอย่างไร:** เพิ่ม metadata JSON, severity/status, signals/window; append-only design
- **ถือว่าเสร็จเมื่อ:** เก็บ event/alert/risk signals ได้โดยไม่เก็บ secret
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-19 — สร้าง Admin Review/Audit Schemas
- **ทำอะไร:** สร้าง admin_reviews และ admin_audit_logs
- **ทำที่ไหน:** Migrations ตามชื่อตาราง
- **ทำอย่างไร:** เก็บ actor, target, decision, reason, before/after redacted JSON, IP/UA/time
- **ถือว่าเสร็จเมื่อ:** มีประวัติ Admin แยกและ append-only
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-20 — สร้าง System Settings/Backup Schemas
- **ทำอะไร:** สร้าง settings และ optional backup metadata
- **ทำที่ไหน:** Migrations: `system_settings`, `system_backups`
- **ทำอย่างไร:** setting_value JSON; updated_by; backup private storage metadata; ห้ามเก็บ secret plaintext
- **ถือว่าเสร็จเมื่อ:** Admin settings และ backup metadata รองรับได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-21 — สร้าง Password Reset/MFA/Returns Schemas
- **ทำอะไร:** สร้างตารางรองรับ reset, MFA และ handover
- **ทำที่ไหน:** Migrations: `password_reset_tokens`, `admin_mfa`, `returns`
- **ทำอย่างไร:** reset token hash/expiry/used; MFA secret encrypted/recovery hashes; returns unique claim + handover fields
- **ถือว่าเสร็จเมื่อ:** รองรับ reset/MFA/return workflow
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-22 — เพิ่ม Foreign Keys, Indexes และ Constraints
- **ทำอะไร:** ตรวจ integrity ทั้งฐานข้อมูล
- **ทำที่ไหน:** ทุก Migration
- **ทำอย่างไร:** กำหนด FK actions, unique/indexes; ตรวจ MySQL 8 behavior; ใช้ DECIMAL สำหรับเงินที่ถอดรหัสใน runtime
- **ถือว่าเสร็จเมื่อ:** migration apply ได้และ integrity test ผ่าน
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-23 — สร้าง Seed Data
- **ทำอะไร:** สร้าง categories และ development institution/test data
- **ทำที่ไหน:** `database/seed.sql`
- **ทำอย่างไร:** ใช้ข้อมูลสมมติ; ห้ามใส่ข้อมูลจริงหรือ default admin password production
- **ถือว่าเสร็จเมื่อ:** Seed ซ้ำได้อย่างปลอดภัยตามแนวทาง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [/] P02-24 — ตั้ง PDO Database Layer
- **ทำอะไร:** สร้าง connection และ query handling
- **ทำที่ไหน:** `backend/config/`, `backend/` database service
- **ทำอย่างไร:** อ่าน env, PDO exceptions, utf8mb4, prepared statements, transaction helpers
- **ถือว่าเสร็จเมื่อ:** เชื่อม MySQL ได้และ query parameterized
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [/] P02-25 — สร้าง API Router และ Controller Base
- **ทำอะไร:** ตั้ง routing และ request lifecycle
- **ทำที่ไหน:** `backend/public/index.php`, `backend/routes/`, controllers
- **ทำอย่างไร:** กำหนด method/path, JSON parser, middleware pipeline, 404/405
- **ถือว่าเสร็จเมื่อ:** เรียก route ได้และไม่เปิดเผย internal errors
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [/] P02-26 — สร้าง Standard Response/Error Handler
- **ทำอะไร:** ทำ response format กลาง
- **ทำที่ไหน:** `backend/` response/error utilities
- **ทำอย่างไร:** success/error envelope, HTTP status mapping, validation errors, correlation id; production ไม่ส่ง stack trace
- **ถือว่าเสร็จเมื่อ:** API ทุกตัวมี response format เดียวกัน
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-27 — สร้าง Validation Layer
- **ทำอะไร:** รวม validation rules ฝั่ง Backend
- **ทำที่ไหน:** `backend/validators/`
- **ทำอย่างไร:** validate type/length/enum/email/phone/date/file; normalize email; return field errors
- **ถือว่าเสร็จเมื่อ:** invalid input ถูกปฏิเสธแม้ข้าม frontend
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-28 — สร้าง Authentication/Authorization Middleware Skeleton
- **ทำอะไร:** ตั้ง middleware ตรวจ login, role, verification และ institution
- **ทำที่ไหน:** `backend/middleware/`, `backend/policies/`
- **ทำอย่างไร:** แยก requireAuth, requireVerified, requireAdmin, ownership policy, institution scope
- **ถือว่าเสร็จเมื่อ:** route ป้องกันได้โดยไม่พึ่ง frontend
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-29 — สร้าง Environment & Configuration
- **ทำอะไร:** ตั้ง `.env.example` และ config loader
- **ทำที่ไหน:** Root `.env.example`, `.gitignore`, `backend/config/`
- **ทำอย่างไร:** ใส่ APP/DB/Session/Remember/Encryption/AI placeholders; .env ignored; production debug false
- **ถือว่าเสร็จเมื่อ:** ไม่มี secret ใน Git และ config แยก environment
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P02-30 — ทดสอบ Database/Backend Foundation
- **ทำอะไร:** ทดสอบ migration, connection, router, validation, error format
- **ทำที่ไหน:** `tests/backend/`, CI/local test
- **ทำอย่างไร:** import schema ใหม่, seed, invalid route, invalid payload, DB unavailable, rollback
- **ถือว่าเสร็จเมื่อ:** ผลทดสอบบันทึกและผ่านก่อน Phase 3
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 5. Phase 3 — Authentication & Account
### [ ] P03-01 — Register endpoint
- **ทำอะไร:** POST /auth/register
- **ทำที่ไหน:** `backend/routes/`, AuthController/AuthService, users
- **ทำอย่างไร:** รับฟิลด์ตาม Spec; normalize email; validate phone 10 digits; student code rules; password_hash; server-set MEMBER/PENDING; transaction
- **ถือว่าเสร็จเมื่อ:** สมัครถูกต้องสร้าง PENDING; email/student code ซ้ำและ input ผิดถูกปฏิเสธ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-01 — Register endpoint
- **ทำอะไร:** POST /auth/register
- **ทำที่ไหน:** `backend/routes/`, AuthController/AuthService, users
- **ทำอย่างไร:** รับฟิลด์ตาม Spec; normalize email; validate phone 10 digits; student code rules; password_hash; server-set MEMBER/PENDING; transaction
- **ถือว่าเสร็จเมื่อ:** สมัครถูกต้องสร้าง PENDING; email/student code ซ้ำและ input ผิดถูกปฏิเสธ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-02 — Registration frontend integration
- **ทำอะไร:** Registration frontend integration
- **ทำที่ไหน:** `frontend/register.html`
- **ทำอย่างไร:** เชื่อม Step Form กับ `/api/v1/auth/register`; map field errors; prevent double submit; success ไป pending
- **ถือว่าเสร็จเมื่อ:** ข้อมูลจริงบันทึกได้และไม่เก็บ confirmation
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-03 — Login endpoint
- **ทำอะไร:** POST /auth/login
- **ทำที่ไหน:** `AuthController/AuthService`
- **ทำอย่างไร:** email+password only; generic error; password_verify; rate limit; check account status; session regenerate; update last_login
- **ถือว่าเสร็จเมื่อ:** Email login ทำงาน; phone login ไม่รองรับ; status ถูกบังคับ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-04 — Login frontend integration
- **ทำอะไร:** Login frontend integration
- **ทำที่ไหน:** `frontend/login.html`
- **ทำอย่างไร:** เชื่อม form, remember_me, loading/error, redirect ตามสถานะ/role
- **ถือว่าเสร็จเมื่อ:** ผู้ใช้ login และเห็นสถานะที่ถูกต้อง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-05 — Logout
- **ทำอะไร:** POST /auth/logout
- **ทำที่ไหน:** Auth route/service
- **ทำอย่างไร:** invalidate session, clear cookie, revoke current session reference as designed, CSRF
- **ถือว่าเสร็จเมื่อ:** logout แล้ว protected endpoint ใช้ไม่ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-06 — Current user endpoint
- **ทำอะไร:** GET /auth/me
- **ทำที่ไหน:** Auth route/controller
- **ทำอย่างไร:** ส่งเฉพาะ profile fields ที่อนุญาตและ permission/status; ไม่ส่ง hash/token
- **ถือว่าเสร็จเมื่อ:** คืนเฉพาะผู้ใช้ปัจจุบัน
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-07 — Remember Me issue/restore/revoke
- **ทำอะไร:** Remember Me issue/restore/revoke
- **ทำที่ไหน:** remember endpoints, `remember_tokens`
- **ทำอย่างไร:** selector+random token cookie; store hash; expiry 30 days default; rotate on use; revoke on password change/logout policy
- **ถือว่าเสร็จเมื่อ:** ไม่มี plaintext token ใน DB/log และ expiry/revoke ใช้งานได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-08 — Session inventory and revoke
- **ทำอะไร:** GET /auth/sessions, DELETE /auth/sessions/{sessionId}, POST /auth/logout-all
- **ทำที่ไหน:** `user_sessions`, session service, Profile UI
- **ทำอย่างไร:** เก็บ hash/reference, device/IP/UA/last_seen/expiry; owner/admin authorization; revoke all
- **ถือว่าเสร็จเมื่อ:** ดูและยกเลิก session ได้โดยข้ามไปดูของคนอื่นไม่ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-09 — Forgot Password
- **ทำอะไร:** POST /auth/forgot-password
- **ทำที่ไหน:** `password_reset_tokens`, mail adapter
- **ทำอย่างไร:** generic response; cryptographic token; store hash; expiry; rate limit; email delivery adapter
- **ถือว่าเสร็จเมื่อ:** ไม่เปิดเผย email existence และ token ใช้ครั้งเดียว
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-10 — Reset Password
- **ทำอะไร:** POST /auth/reset-password
- **ทำที่ไหน:** Auth service + reset page
- **ทำอย่างไร:** validate token hash/expiry/used; password_hash; mark used; revoke remember tokens/sessions as policy
- **ถือว่าเสร็จเมื่อ:** reset token reuse ถูกปฏิเสธและ token เดิมใช้ซ้ำไม่ได้
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-11 — Pending/Rejected/Suspended pages
- **ทำอะไร:** account status pages
- **ทำที่ไหน:** `frontend/account/`
- **ทำอย่างไร:** render status, allowed reason, updated date, logout; restrict core actions on backend
- **ถือว่าเสร็จเมื่อ:** สถานะบัญชีสื่อสารชัดและ backend block จริง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-12 — Admin MFA
- **ทำอะไร:** Admin MFA
- **ทำที่ไหน:** `admin_mfa`, MFA endpoints, Admin login flow
- **ทำอย่างไร:** เลือกวิธีตาม Open Point; encrypt secret; recovery codes hash; verify before admin access; re-auth for sensitive actions
- **ถือว่าเสร็จเมื่อ:** Admin เข้า Admin route ไม่ได้ก่อน MFA ตาม policy
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-13 — Admin first-account bootstrap
- **ทำอะไร:** CLI/Installer documented
- **ทำที่ไหน:** `backend/` CLI or installer, README
- **ทำอย่างไร:** สร้าง Admin อย่างปลอดภัย; password hash; no weak seed; enforce MFA and last-admin guard
- **ถือว่าเสร็จเมื่อ:** มีวิธีสร้าง Admin คนแรกโดยไม่ hardcode credential
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-14 — Auth security tests
- **ทำอะไร:** Authentication test suite
- **ทำที่ไหน:** `tests/backend/auth/`
- **ทำอย่างไร:** test duplicate/case email, phone rules, student code, session fixation, CSRF, remember expiry/revoke, reset token replay, MFA
- **ถือว่าเสร็จเมื่อ:** ทุกกรณีผ่านและผล test ถูกบันทึก
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 6. Phase 4 — Reports, Search & Member Screens
## 5. Phase 3 — Authentication & Account
### [ ] P03-01 — Register API
- **ทำอะไร:** Register API
- **ทำที่ไหน:** `backend/routes/`, AuthController/AuthService, `users`
- **ทำอย่างไร:** POST `/auth/register`; normalize email; validate phone 10 digits and student_code rules; hash password; backend sets MEMBER/PENDING; transaction; never store confirmation
- **ถือว่าเสร็จเมื่อ:** สมัครถูกต้องสร้าง PENDING; duplicate email/student code and invalid fields rejected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-02 — Register UI integration
- **ทำอะไร:** Register UI integration
- **ทำที่ไหน:** `frontend/register.html`
- **ทำอย่างไร:** Connect 4-step form; conditional student_code; field errors; prevent double submit; success to pending page
- **ถือว่าเสร็จเมื่อ:** ข้อมูลบันทึกจริงและ confirmation ไม่ถูกเก็บ
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-03 — Login API
- **ทำอะไร:** Login API
- **ทำที่ไหน:** `POST /auth/login`, AuthService
- **ทำอย่างไร:** Email+password only; generic error; password_verify; rate limit; account status check; regenerate session ID; update last_login
- **ถือว่าเสร็จเมื่อ:** Email login works; phone login unsupported; status enforced
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-04 — Login UI integration
- **ทำอะไร:** Login UI integration
- **ทำที่ไหน:** `frontend/login.html`
- **ทำอย่างไร:** Connect email/password/remember_me; loading/error; route pending/rejected/suspended/member/admin appropriately
- **ถือว่าเสร็จเมื่อ:** Login UI ใช้งานกับ API จริง
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-05 — Logout and current-user APIs
- **ทำอะไร:** Logout and current-user APIs
- **ทำที่ไหน:** `POST /auth/logout`, `GET /auth/me`
- **ทำอย่างไร:** Invalidate server session; clear cookie; return safe current-user fields only; CSRF on state changes
- **ถือว่าเสร็จเมื่อ:** Logout invalidates session; no hash/token returned
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-06 — Remember Me
- **ทำอะไร:** Remember Me
- **ทำที่ไหน:** `remember_tokens`, remember endpoints
- **ทำอย่างไร:** Generate selector+random token; cookie secure flags; store token hash only; 30-day default; rotate on use; revoke on password change
- **ถือว่าเสร็จเมื่อ:** Expiry, rotation and revoke tested; no plaintext token
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-07 — Session inventory
- **ทำอะไร:** Session inventory
- **ทำที่ไหน:** `user_sessions`, `/auth/sessions`, `/auth/logout-all`
- **ทำอย่างไร:** Store hashed session reference/device metadata; owner-only list/revoke; logout all invalidates all active sessions
- **ถือว่าเสร็จเมื่อ:** Users can revoke own sessions but cannot inspect others
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-08 — Forgot password
- **ทำอะไร:** Forgot password
- **ทำที่ไหน:** `password_reset_tokens`, `/auth/forgot-password`
- **ทำอย่างไร:** Generic response; random one-time token; store hash; expiry/rate limit; mail adapter; no token in production UI
- **ถือว่าเสร็จเมื่อ:** Does not reveal email existence; token is one-time
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-09 — Reset password
- **ทำอะไร:** Reset password
- **ทำที่ไหน:** `/auth/reset-password`, Reset UI
- **ทำอย่างไร:** Validate hash/expiry/used_at; password_hash; mark token used; revoke remember tokens and relevant sessions
- **ถือว่าเสร็จเมื่อ:** Expired/reused token rejected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-10 — Pending and account status pages
- **ทำอะไร:** Pending and account status pages
- **ทำที่ไหน:** `frontend/account/pending.html`, `status.html`
- **ทำอย่างไร:** Show PENDING/REJECTED/SUSPENDED, safe reason, updated time, contact/help and logout; backend blocks core actions
- **ถือว่าเสร็จเมื่อ:** Account state is clear and enforced server-side
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-11 — Admin MFA
- **ทำอะไร:** Admin MFA
- **ทำที่ไหน:** `admin_mfa`, Admin login middleware, MFA endpoints
- **ทำอย่างไร:** Select TOTP or approved method; encrypt MFA secret; hash recovery codes; require verification before Admin access; re-auth sensitive actions
- **ถือว่าเสร็จเมื่อ:** Admin routes blocked until MFA step passes
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-12 — Admin bootstrap
- **ทำอะไร:** Admin bootstrap
- **ทำที่ไหน:** Backend CLI/Installer and README
- **ทำอย่างไร:** Create first Admin securely; hash password; no weak seed credential; require MFA; protect last Admin
- **ถือว่าเสร็จเมื่อ:** First Admin can be created without hardcoded credentials
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P03-13 — Authentication tests
- **ทำอะไร:** Authentication tests
- **ทำที่ไหน:** `tests/backend/auth/`
- **ทำอย่างไร:** Test email case uniqueness, phone rules, student code, password mismatch, session fixation, CSRF, remember expiry/revoke, reset replay and MFA
- **ถือว่าเสร็จเมื่อ:** All auth happy/failure/security tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 6. Phase 4 — Reports, Search & Member Screens
### [ ] P04-01 — Public report listing API
- **ทำอะไร:** Public report listing API
- **ทำที่ไหน:** `GET /api/v1/reports`, ReportsController/Repository
- **ทำอย่างไร:** Implement type/q/category/color/brand/location/date/status/sort/page/per_page; clamp limits; return public fields only
- **ถือว่าเสร็จเมื่อ:** Search/filter works and response has no private fields
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-02 — Report detail API
- **ทำอะไร:** Report detail API
- **ทำที่ไหน:** `GET /api/v1/reports/{id}`
- **ทำอย่างไร:** Return public report, category, authorized images and safe match preview; enforce institution scope; do not load private relations into serializer
- **ถือว่าเสร็จเมื่อ:** Detail endpoint exposes public data only
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-03 — Create Lost Report API
- **ทำอะไร:** Create Lost Report API
- **ทำที่ไหน:** `POST /api/v1/reports/lost`
- **ทำอย่างไร:** Require VERIFIED member; validate title/category/location/date; create ACTIVE LOST; save private ownership facts encrypted separately
- **ถือว่าเสร็จเมื่อ:** Lost report created with private data separated
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-04 — Create Found Report API
- **ทำอะไร:** Create Found Report API
- **ทำที่ไหน:** `POST /api/v1/reports/found`
- **ทำอย่างไร:** Require VERIFIED member; validate public item fields and found location/time; store finder-only observations encrypted
- **ถือว่าเสร็จเมื่อ:** Found report created without secret leakage
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-05 — Private image storage and image endpoints
- **ทำอะไร:** Private image storage and image endpoints
- **ทำที่ไหน:** `backend/storage/private/`, `report_images`, upload/delete routes
- **ทำอย่างไร:** Validate real MIME/content/size; random storage key; store outside web root; owner/Admin authorization; controlled file delivery
- **ถือว่าเสร็จเมื่อ:** Invalid uploads blocked and private files not public
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-06 — Edit and close report
- **ทำอะไร:** Edit and close report
- **ทำที่ไหน:** `PATCH /reports/{id}`, `POST /reports/{id}/close`
- **ทำอย่างไร:** Check owner/Admin, allowlisted fields, current status and legal transition; ignore client-supplied user/status
- **ถือว่าเสร็จเมื่อ:** Unauthorized edits and invalid transitions rejected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-07 — Landing and Member Dashboard
- **ทำอะไร:** Landing and Member Dashboard
- **ทำที่ไหน:** `frontend/index.html`, `frontend/dashboard.html`
- **ทำอย่างไร:** Connect recent public reports, greeting, quick actions, own counts, matches, notifications; empty/loading/error states
- **ถือว่าเสร็จเมื่อ:** Dashboard data belongs to current account
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-08 — Lost Items screen
- **ทำอะไร:** Lost Items screen
- **ทำที่ไหน:** `frontend/lost-items.html`
- **ทำอย่างไร:** Search, filters, sort, cards, pagination, clear filters, empty/loading/error; connect reports API
- **ถือว่าเสร็จเมื่อ:** Lost search/filter works on mobile and desktop
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-09 — Found Items screen
- **ทำอะไร:** Found Items screen
- **ทำที่ไหน:** `frontend/found-items.html`
- **ทำอย่างไร:** Same search/filter patterns; show public fields only; hide cash amount and secret details
- **ถือว่าเสร็จเมื่อ:** Found listing cannot reveal private data
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-10 — Item Detail screen
- **ทำอะไร:** Item Detail screen
- **ทำที่ไหน:** `frontend/item-detail.html`
- **ทำอย่างไร:** Image gallery, item fields, location/time/status, allowed poster info, similar matches, claim CTA by type/status
- **ถือว่าเสร็จเมื่อ:** CTA and visible fields follow permissions/status
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-11 — Report Lost multi-step screen
- **ทำอะไร:** Report Lost multi-step screen
- **ทำที่ไหน:** `frontend/report-lost.html`
- **ทำอย่างไร:** Step item data; location/time; private facts; public preview; progress/back; client validation; submit API
- **ถือว่าเสร็จเมื่อ:** Private step never appears in public preview
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-12 — Report Found multi-step screen
- **ทำอะไร:** Report Found multi-step screen
- **ทำที่ไหน:** `frontend/report-found.html`
- **ทำอย่างไร:** Step item data; found location/time; private finder observations; public preview; submit API
- **ถือว่าเสร็จเมื่อ:** Private details stored separately and encrypted
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-13 — My Reports API and screen
- **ทำอะไร:** My Reports API and screen
- **ทำที่ไหน:** `GET /my/reports`, `frontend/my-reports.html`
- **ทำอย่างไร:** Current-user reports only; tabs all/lost/found; status filter; detail/edit/close by permission; allowed match count
- **ถือว่าเสร็จเมื่อ:** User cannot query another user's reports
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-14 — Category API and category controls
- **ทำอะไร:** Category API and category controls
- **ทำที่ไหน:** `GET /categories`, Admin category routes
- **ทำอย่างไร:** Return active institution categories; Admin create/update/deactivate; validate slug uniqueness and references
- **ถือว่าเสร็จเมื่อ:** Forms and filters use DB categories
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P04-15 — Report workflow tests
- **ทำอะไร:** Report workflow tests
- **ทำที่ไหน:** `tests/backend/reports/`, integration tests
- **ทำอย่างไร:** Test create/edit/close, Pending denial, ownership, file validation, search/filter, cross-institution access and private-field leakage
- **ถือว่าเสร็จเมื่อ:** All report tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 7. Phase 5 — Rule-based Matching
### [ ] P05-01 — Matching weights and scoring contract
- **ทำอะไร:** Matching weights and scoring contract
- **ทำที่ไหน:** Matching config / `system_settings`
- **ทำอย่างไร:** Define category/color/brand/location/date-time/description weights; normalize feature scores; handle missing fields; clamp final score 0–100
- **ถือว่าเสร็จเมื่อ:** Scoring is explainable and deterministic
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P05-02 — Matching service
- **ทำอะไร:** Matching service
- **ทำที่ไหน:** `backend/services/MatchingService.php` or equivalent
- **ทำอย่างไร:** Compare only LOST with FOUND within same institution; filter eligible statuses; produce per-feature breakdown and rule score
- **ถือว่าเสร็จเมื่อ:** Invalid pairs rejected and score breakdown returned
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P05-03 — Candidate retrieval
- **ทำอะไร:** Candidate retrieval
- **ทำที่ไหน:** Report repository / matching query
- **ทำอย่างไร:** Query candidate reports by institution, status, category/date/location as suitable; pagination and indexes; avoid N+1
- **ถือว่าเสร็จเมื่อ:** Candidate query is bounded and tenant-safe
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P05-04 — Persist and trigger matches
- **ทำอะไร:** Persist and trigger matches
- **ทำที่ไหน:** `matches`, report creation/update hooks, `/matching/run`
- **ทำอย่างไร:** Unique lost/found pair; save score, feature JSON without secrets, algorithm version; make trigger idempotent
- **ถือว่าเสร็จเมื่อ:** No duplicate pair and version can be audited
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P05-05 — Member match presentation
- **ทำอะไร:** Member match presentation
- **ทำที่ไหน:** Dashboard, Item Detail, My Reports
- **ทำอย่างไร:** Show potential matches only to authorized parties; explain score is similarity, not proof
- **ถือว่าเสร็จเมื่อ:** No misleading ownership confirmation
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P05-06 — Admin Matching screen
- **ทำอะไร:** Admin Matching screen
- **ทำที่ไหน:** `frontend/admin/matching.html`, Admin APIs
- **ทำอย่างไร:** Queue, candidate pairs, scores, feature breakdown, status; Confirm/Dismiss with audit
- **ถือว่าเสร็จเมื่อ:** Admin review works and is auditable
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P05-07 — Matching tests
- **ทำอะไร:** Matching tests
- **ทำที่ไหน:** `tests/backend/matching/`
- **ทำอย่างไร:** Test feature weights, missing values, wrong report type, institution isolation, duplicates and score boundaries
- **ถือว่าเสร็จเมื่อ:** Matching test suite passes
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 8. Phase 6 — AI Image Matching
### [ ] P06-01 — FastAPI service foundation
- **ทำอะไร:** FastAPI service foundation
- **ทำที่ไหน:** `ai-service/app/main.py`, `requirements.txt`, tests
- **ทำอย่างไร:** Create FastAPI app, config, health route, route/service modules and tests; environment-based configuration
- **ถือว่าเสร็จเมื่อ:** AI service starts and health check passes
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-02 — Internal service authentication
- **ทำอะไร:** Internal service authentication
- **ทำที่ไหน:** AI middleware and PHP AI client
- **ทำอย่างไร:** Authenticate PHP-to-AI requests using internal service credential; keep service private; reject unauthenticated calls
- **ถือว่าเสร็จเมื่อ:** Unauthenticated requests return 401/403
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-03 — Secure image handoff
- **ทำอะไร:** Secure image handoff
- **ทำที่ไหน:** PHP Matching Service ↔ AI Service
- **ทำอย่างไร:** Pass private storage reference or short-lived signed access; validate image; never expose public image storage
- **ถือว่าเสร็จเมื่อ:** AI can access only authorized image
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-04 — Image embedding generation
- **ทำอะไร:** Image embedding generation
- **ทำที่ไหน:** `ai-service/app/image_matching/`
- **ทำอย่างไร:** Select model through adapter; preprocess; generate embedding; record model/version; handle unsupported/corrupt images
- **ถือว่าเสร็จเมื่อ:** Supported image creates embedding with version
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-05 — Similarity search
- **ทำอะไร:** Similarity search
- **ทำที่ไหน:** AI matching/vector storage
- **ทำอย่างไร:** Choose vector store based on expected volume; scope candidate search by institution; return similarity score
- **ถือว่าเสร็จเมื่อ:** Candidate similarity works without cross-school leakage
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-06 — Hybrid score integration
- **ทำอะไร:** Hybrid score integration
- **ทำที่ไหน:** PHP MatchingService
- **ทำอย่างไร:** Combine rule_score and image_score using configured weights; handle missing image score; clamp to 0–100
- **ถือว่าเสร็จเมื่อ:** Hybrid score is reproducible and rule-only fallback works
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-07 — AI outage fallback
- **ทำอะไร:** AI outage fallback
- **ทำที่ไหน:** Backend matching workflow
- **ทำอย่างไร:** Set timeout/retry policy; AI unavailable must not break report creation; save rule-only or partial result
- **ถือว่าเสร็จเมื่อ:** Core app remains usable during AI outage
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-08 — Admin AI result display
- **ทำอะไร:** Admin AI result display
- **ทำที่ไหน:** Admin Matching UI
- **ทำอย่างไร:** Show image score, model/version and score breakdown; label as similarity only
- **ถือว่าเสร็จเมื่อ:** Admin cannot interpret score as proof
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P06-09 — AI integration tests
- **ทำอะไร:** AI integration tests
- **ทำที่ไหน:** `ai-service/tests/`, backend integration
- **ทำอย่างไร:** Test invalid image, timeout, missing image, auth failure, versioning, score range and tenant isolation
- **ถือว่าเสร็จเมื่อ:** AI tests and fallback tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 9. Phase 7 — Claim System
### [ ] P07-01 — Claim submission API
- **ทำอะไร:** Claim submission API
- **ทำที่ไหน:** `POST /reports/{id}/claims`, ClaimService
- **ทำอย่างไร:** Require VERIFIED member; target eligible FOUND report; enforce attempt/rate limits; create PENDING and attempt number in transaction
- **ถือว่าเสร็จเมื่อ:** Claim created only for eligible report
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-02 — Question delivery
- **ทำอะไร:** Question delivery
- **ทำที่ไหน:** Ownership question service and Claim API
- **ทำอย่างไร:** Return prompt and opaque question_key only; never return expected answer or full secret payload
- **ถือว่าเสร็จเมื่อ:** Client can answer without seeing secret
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-03 — Claim answer API
- **ทำอะไร:** Claim answer API
- **ทำที่ไหน:** `POST /claims/{id}/answers`, `claim_answers`
- **ทำอย่างไร:** Claim owner only; validate question keys; encrypt answers; do not log answer text; record event
- **ถือว่าเสร็จเมื่อ:** Answers encrypted and owner-scoped
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-04 — Evidence upload API
- **ทำอะไร:** Evidence upload API
- **ทำที่ไหน:** `POST /claims/{id}/evidence`, private storage
- **ทำอย่างไร:** Owner-only; MIME/content/size validation; random key; metadata in DB; access logging
- **ถือว่าเสร็จเมื่อ:** Evidence is private and validated
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-05 — Claim detail and My Claims APIs
- **ทำอะไร:** Claim detail and My Claims APIs
- **ทำที่ไหน:** `GET /claims/{id}`, `GET /my/claims`
- **ทำอย่างไร:** Claimant/Admin access only; current user derived server-side; redact Finder secrets; paginate
- **ถือว่าเสร็จเมื่อ:** Users see only their own claims
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-06 — Cancel and More Info APIs
- **ทำอะไร:** Cancel and More Info APIs
- **ทำที่ไหน:** `POST /claims/{id}/cancel`, `/more-info`
- **ทำอย่างไร:** Allow only legal states; append Claim Event; require MORE_INFO_REQUIRED for additional response; reject arbitrary status updates
- **ถือว่าเสร็จเมื่อ:** Invalid state changes are blocked
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-07 — My Claims screen
- **ทำอะไร:** My Claims screen
- **ทำที่ไหน:** `frontend/my-claims.html`
- **ทำอย่างไร:** List status/date/report, filter, timeline, detail link, cancel/respond controls by state
- **ถือว่าเสร็จเมื่อ:** Member can track own claims
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-08 — Claim Submission screen
- **ทำอะไร:** Claim Submission screen
- **ทำที่ไหน:** Claim route/page in `frontend/`
- **ทำอย่างไร:** Public report summary, secret questions, answer inputs, evidence upload, truth confirmation, attempts left if allowed
- **ถือว่าเสร็จเมื่อ:** Claim form submits without revealing answer
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-09 — Claim Detail screen
- **ทำอะไร:** Claim Detail screen
- **ทำที่ไหน:** Claim detail page in `frontend/`
- **ทำอย่างไร:** Status, report, own answers/evidence, allowed AI summary, timeline, More Info and Cancel controls
- **ถือว่าเสร็จเมื่อ:** Details are permission-scoped
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-10 — Claim notifications
- **ทำอะไร:** Claim notifications
- **ทำที่ไหน:** Notification service
- **ทำอย่างไร:** Notify claimant/Admin on submit, status change, request info and decision; message excludes secret content
- **ถือว่าเสร็จเมื่อ:** Notifications delivered without private data
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P07-11 — Claim tests
- **ทำอะไร:** Claim tests
- **ทำที่ไหน:** `tests/backend/claims/`
- **ทำอย่างไร:** Test attempt limit, ownership, answer encryption, evidence access, rate limit, state transitions and AI outage
- **ถือว่าเสร็จเมื่อ:** Claim happy/failure/security tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 10. Phase 8 — Ownership Verification
### [ ] P08-01 — Private ownership data capture
- **ทำอะไร:** Private ownership data capture
- **ทำที่ไหน:** Lost/Found private form steps, `ownership_secrets`
- **ทำอย่างไร:** Capture distinguishing traits/marks; validate; encrypt application payload; key outside DB; never store in public_description
- **ถือว่าเสร็จเมื่อ:** No private facts in public report columns
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-02 — Secret question generation
- **ทำอะไร:** Secret question generation
- **ทำที่ไหน:** Backend ownership service
- **ทำอย่างไร:** Generate safe non-leading questions; expose prompts and question keys only; avoid revealing expected answer
- **ถือว่าเสร็จเมื่อ:** Question API contains no secret answer
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-03 — Answer consistency evaluation
- **ทำอะไร:** Answer consistency evaluation
- **ทำที่ไหน:** Ownership Review service
- **ทำอย่างไร:** Compare submitted answers with protected reference data; output signals; avoid answer logging
- **ถือว่าเสร็จเมื่อ:** Evaluation does not disclose secret
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-04 — Evidence review pipeline
- **ทำอะไร:** Evidence review pipeline
- **ทำที่ไหน:** Private evidence storage and protected viewer
- **ทำอย่างไร:** Authorize claimant/Admin; stream through access-controlled route; audit access; sanitize names
- **ถือว่าเสร็จเมื่อ:** Evidence is inaccessible to public/other members
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-05 — AI ownership review adapter
- **ทำอะไร:** AI ownership review adapter
- **ทำที่ไหน:** `ai-service/app/ownership_review/`
- **ทำอย่างไร:** Send minimum necessary context securely; return four labels and summary; record model/version; fallback if unavailable
- **ถือว่าเสร็จเมื่อ:** AI remains advisory and failure does not block Admin review
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-06 — Admin Ownership Verification UI
- **ทำอะไร:** Admin Ownership Verification UI
- **ทำที่ไหน:** `frontend/admin/ownership-verification.html`
- **ทำอย่างไร:** Show relevant reference data minimally, claimant answers, evidence, AI labels and decision panel; audit sensitive access
- **ถือว่าเสร็จเมื่อ:** Only Admin sees necessary private information
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-07 — Admin decision workflow
- **ทำอะไร:** Admin decision workflow
- **ทำที่ไหน:** Admin Claim APIs and services
- **ทำอย่างไร:** Approve/Reject/Request More Info; validate state; require reasons when specified; transaction; Claim Event/Admin Review/Audit
- **ถือว่าเสร็จเมื่อ:** Admin is final decision maker
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-08 — Attempt limit and escalation
- **ทำอะไร:** Attempt limit and escalation
- **ทำที่ไหน:** ClaimService and System Settings
- **ทำอย่างไร:** Default example 3 attempts, configurable; block further automated attempts and route to Admin Review
- **ถือว่าเสร็จเมื่อ:** Attempt limit cannot be bypassed
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P08-09 — Ownership privacy tests
- **ทำอะไร:** Ownership privacy tests
- **ทำที่ไหน:** Security/integration tests
- **ทำอย่างไร:** Test public/member APIs, logs, errors, AI payload and evidence URLs for secret leakage
- **ถือว่าเสร็จเมื่อ:** No private ownership leakage
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 11. Phase 9 — Cash Recovery
### [ ] P09-01 — Cash found report form
- **ทำอะไร:** Cash found report form
- **ทำที่ไหน:** Found report UI and cash form logic
- **ทำอย่างไร:** Capture public description plus private amount/place/date/time; preview must hide exact amount
- **ถือว่าเสร็จเมื่อ:** Cash post public preview does not show amount
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-02 — Cash details persistence
- **ทำอะไร:** Cash details persistence
- **ทำที่ไหน:** `found_cash_details` and encryption service
- **ทำอย่างไร:** Encrypt amount/location/time; store currency and custody status; restrict decrypt permission
- **ถือว่าเสร็จเมื่อ:** Private cash fields encrypted
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-03 — Cash claim API
- **ทำอะไร:** Cash claim API
- **ทำที่ไหน:** `POST /reports/{id}/cash-claim`
- **ทำอย่างไร:** Collect claimant amount, likely location, time window and incident description; encrypt sensitive answers; rate limit
- **ถือว่าเสร็จเมื่อ:** Cash claimant details protected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-04 — Cash matching
- **ทำอะไร:** Cash matching
- **ทำที่ไหน:** Cash matching service
- **ทำอย่างไร:** Compare amount/place/time and return preliminary consistency only; never auto-approve exact match
- **ถือว่าเสร็จเมื่อ:** Exact match remains pending human review
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-05 — Admin Cash Recovery screen
- **ทำอะไร:** Admin Cash Recovery screen
- **ทำที่ไหน:** `frontend/admin/cash-recovery.html`
- **ทำอย่างไร:** Show private amount/location/time, claimants, match summary, custody status, custodian and timestamps
- **ถือว่าเสร็จเมื่อ:** Admin-only view protected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-06 — Custody API and UI
- **ทำอะไร:** Custody API and UI
- **ทำที่ไหน:** `POST /admin/cash-cases/{id}/custody`
- **ทำอย่างไร:** Record staff/custodian/received_at; update WITH_STAFF in transaction; audit
- **ถือว่าเสร็จเมื่อ:** Custody history recorded
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-07 — Cash return API and UI
- **ทำอะไร:** Cash return API and UI
- **ทำที่ไหน:** `POST /admin/cash-cases/{id}/return`
- **ทำอย่างไร:** Verify approved claimant and custody; record return/time; update status; audit
- **ถือว่าเสร็จเมื่อ:** Return is traceable
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-08 — Multiple claimant review
- **ทำอะไร:** Multiple claimant review
- **ทำที่ไหน:** Admin cash case workflow
- **ทำอย่างไร:** Show all claimants and evidence; require Admin decision; no first-come-first-served
- **ถือว่าเสร็จเมื่อ:** Multiple claimants handled fairly
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P09-09 — Cash privacy tests
- **ทำอะไร:** Cash privacy tests
- **ทำที่ไหน:** API/security tests
- **ทำอย่างไร:** Assert public API omits amount/private place/time; test encryption and role restrictions
- **ถือว่าเสร็จเมื่อ:** No cash data leakage
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 12. Phase 10 — Admin Control Center
### [ ] P10-01 — Admin route guard and shell
- **ทำอะไร:** Admin route guard and shell
- **ทำที่ไหน:** `frontend/admin/`, backend middleware
- **ทำอย่างไร:** Require authenticated ADMIN and MFA; backend enforces every route; shared Admin navigation
- **ถือว่าเสร็จเมื่อ:** MEMBER cannot access Admin APIs
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-02 — Admin Dashboard
- **ทำอะไร:** Admin Dashboard
- **ทำที่ไหน:** `frontend/admin/dashboard.html`, aggregation APIs
- **ทำอย่างไร:** Cards for users/reports/claims/returns/cash/security; charts; pending queue; recent activity; quick actions
- **ถือว่าเสร็จเมื่อ:** Dashboard metrics match DB
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-03 — User Management
- **ทำอะไร:** User Management
- **ทำที่ไหน:** `/admin/users`, `frontend/admin/users.html`
- **ทำอย่างไร:** Search name/email/student code; filters; detail; approve/reject/suspend/unsuspend; role change; last-admin protection; audit
- **ถือว่าเสร็จเมื่อ:** All account actions permissioned and audited
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-04 — Report Management
- **ทำอะไร:** Report Management
- **ทำที่ไหน:** `/admin/reports`, `frontend/admin/reports.html`
- **ทำอย่างไร:** Lost/Found/All tabs; search/filter; review detail; status updates; controlled private detail access; audit
- **ถือว่าเสร็จเมื่อ:** Admin report workflow follows state rules
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-05 — Claim Management
- **ทำอะไร:** Claim Management
- **ทำที่ไหน:** `/admin/claims`, `frontend/admin/claims.html`
- **ทำอย่างไร:** Review queue, answers/evidence, AI result, approve/reject/request info; require reason; event and audit
- **ถือว่าเสร็จเมื่อ:** Every decision recorded
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-06 — Ownership Verification
- **ทำอะไร:** Ownership Verification
- **ทำที่ไหน:** `/admin/ownership-verification`
- **ทำอย่างไร:** Questions, answers, minimal private reference, evidence viewer, AI summary, decision panel
- **ถือว่าเสร็จเมื่อ:** Private data visible only to authorized Admin
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-07 — Cash Recovery
- **ทำอะไร:** Cash Recovery
- **ทำที่ไหน:** `/admin/cash-recovery`
- **ทำอย่างไร:** Private amount/place/time, claimant list, match summary, custody and return actions
- **ถือว่าเสร็จเมื่อ:** Cash workflow protected and audited
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-08 — Return Management
- **ทำอะไร:** Return Management
- **ทำที่ไหน:** `/admin/returns`, `returns` APIs
- **ทำอย่างไร:** Schedule, update, list, detail, handover parties, complete; atomic Claim COMPLETED + Report RETURNED
- **ถือว่าเสร็จเมื่อ:** Handover transaction consistent
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-09 — AI Matching
- **ทำอะไร:** AI Matching
- **ทำที่ไหน:** `/admin/matching`
- **ทำอย่างไร:** Candidate pairs, rule/image/hybrid score, feature breakdown, model version, confirm/dismiss
- **ถือว่าเสร็จเมื่อ:** No private secret in match view
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-10 — Security Center
- **ทำอะไร:** Security Center
- **ทำที่ไหน:** `/admin/security`
- **ทำอย่างไร:** Overview, high risk alerts, login failures, suspicious claims, unauthorized API, device signals, review outcomes
- **ถือว่าเสร็จเมื่อ:** Risk is shown as signal, not proof
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-11 — Activity Logs
- **ทำอะไร:** Activity Logs
- **ทำที่ไหน:** `/admin/activity-logs`
- **ทำอย่างไร:** Filter actor/action/category/date/result/risk; redact metadata; append-only; export by policy
- **ถือว่าเสร็จเมื่อ:** Logs cannot be edited/deleted through app
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-12 — Admin Notifications
- **ทำอะไร:** Admin Notifications
- **ทำที่ไหน:** `/admin/notifications`
- **ทำอย่างไร:** Compose, choose recipients, preview, send, delivery/read summary, sender/time audit
- **ถือว่าเสร็จเมื่อ:** Admin can send notices safely
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-13 — System Settings
- **ทำอะไร:** System Settings
- **ทำที่ไหน:** `/admin/settings`
- **ทำอย่างไร:** Edit weights, attempt limit, remember lifetime, thresholds, categories, retention, AI config; validate and audit; no plaintext secrets
- **ถือว่าเสร็จเมื่อ:** Settings changes take effect and are audited
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-14 — Admin Profile
- **ทำอะไร:** Admin Profile
- **ทำที่ไหน:** `/admin/profile`
- **ทำอย่างไร:** Profile, password, MFA, sessions, logout all, own activity history
- **ถือว่าเสร็จเมื่อ:** Admin can manage own account
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-15 — Data & Maintenance (Optional)
- **ทำอะไร:** Data & Maintenance (Optional)
- **ทำที่ไหน:** `/admin/maintenance`
- **ทำอย่างไร:** DB health, storage, backup status, maintenance mode; restrict backup downloads; restore requires confirmation/audit
- **ถือว่าเสร็จเมื่อ:** Maintenance data protected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-16 — Last Admin protection
- **ทำอะไร:** Last Admin protection
- **ทำที่ไหน:** Role/suspend/delete service and DB transaction
- **ทำอย่างไร:** Lock/count active Admin records; reject change removing last Admin; record denied attempt
- **ถือว่าเสร็จเมื่อ:** System always retains at least one Admin
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P10-17 — Admin tests
- **ทำอะไร:** Admin tests
- **ทำที่ไหน:** `tests/backend/admin/`, UI integration
- **ทำอย่างไร:** Test role/MFA guard, last-admin protection, private data access, decision reasons, audit append-only
- **ถือว่าเสร็จเมื่อ:** Admin tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 13. Phase 11 — Security, Privacy, Quality & Testing
### [ ] P11-01 — Password security
- **ทำอะไร:** Password security
- **ทำที่ไหน:** Auth service
- **ทำอย่างไร:** Use password_hash/password_verify; never log passwords; apply documented password policy
- **ถือว่าเสร็จเมื่อ:** No plaintext password; tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-02 — SQL injection prevention
- **ทำอะไร:** SQL injection prevention
- **ทำที่ไหน:** All repositories and queries
- **ทำอย่างไร:** Use PDO prepared statements; allowlist sort/column names; never concatenate untrusted SQL fragments
- **ถือว่าเสร็จเมื่อ:** SQLi tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-03 — XSS prevention
- **ทำอะไร:** XSS prevention
- **ทำที่ไหน:** All frontend/API content
- **ทำอย่างไร:** Escape output; avoid unsafe innerHTML; sanitize any rich text; apply CSP where appropriate
- **ถือว่าเสร็จเมื่อ:** Stored/reflected XSS tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-04 — CSRF protection
- **ทำอะไร:** CSRF protection
- **ทำที่ไหน:** Cookie-authenticated state-changing endpoints
- **ทำอย่างไร:** Issue/validate CSRF tokens; SameSite as defense-in-depth; reject missing/invalid token
- **ถือว่าเสร็จเมื่อ:** CSRF tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-05 — IDOR and authorization audit
- **ทำอะไร:** IDOR and authorization audit
- **ทำที่ไหน:** Every API/resource/file endpoint
- **ทำอย่างไร:** Derive current user server-side; verify ownership, institution, role and status for every object
- **ถือว่าเสร็จเมื่อ:** Cannot access another user's data
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-06 — Rate limiting
- **ทำอะไร:** Rate limiting
- **ทำที่ไหน:** Login/Register/Claim/Reset/Upload
- **ทำอย่างไร:** Apply throttles using safe signals; avoid unfairly blocking shared school IPs; return 429
- **ถือว่าเสร็จเมื่อ:** Abuse tests trigger safe throttling
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-07 — File upload security
- **ทำอะไร:** File upload security
- **ทำที่ไหน:** Report images and Claim evidence
- **ทำอย่างไร:** Validate actual MIME/content/size; random storage names; private storage; optional malware scanning
- **ถือว่าเสร็จเมื่อ:** Malicious/oversized uploads blocked
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-08 — Session and Remember hardening
- **ทำอะไร:** Session and Remember hardening
- **ทำที่ไหน:** Auth/session services
- **ทำอย่างไร:** HttpOnly/Secure/SameSite, rotation, expiry, revocation, token hashing; test fixation
- **ถือว่าเสร็จเมื่อ:** Session lifecycle secure
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-09 — Private data encryption
- **ทำอะไร:** Private data encryption
- **ทำที่ไหน:** Ownership/Cash/Claim answer services
- **ทำอย่างไร:** Authenticated encryption, key version, external key management, rotation plan, no plaintext logs
- **ถือว่าเสร็จเมื่อ:** Database dump does not expose private payload
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-10 — Activity/Audit integrity
- **ทำอะไร:** Activity/Audit integrity
- **ทำที่ไหน:** Logging service and DB permissions
- **ทำอย่างไร:** Append-only app behavior; redact sensitive fields; restrict access; UTC timestamps; correction by new event
- **ถือว่าเสร็จเมื่อ:** Log integrity and leakage tests pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-11 — Admin MFA and re-authentication
- **ทำอะไร:** Admin MFA and re-authentication
- **ทำที่ไหน:** Admin middleware and sensitive actions
- **ทำอย่างไร:** Require MFA; re-auth high-risk changes; secure recovery; audit
- **ถือว่าเสร็จเมื่อ:** Sensitive actions require fresh verification
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-12 — Suspicious behavior detection
- **ทำอะไร:** Suspicious behavior detection
- **ทำที่ไหน:** Security detection service
- **ทำอย่างไร:** Configurable signals/thresholds; shared IP is weak signal; create alert for Admin; no automatic ban/reject
- **ถือว่าเสร็จเมื่อ:** Risk score only creates review signal
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-13 — Error handling and monitoring
- **ทำอะไร:** Error handling and monitoring
- **ทำที่ไหน:** Backend/frontend operations
- **ทำอย่างไร:** Generic public errors; safe internal structured logs; health checks and correlation IDs
- **ถือว่าเสร็จเมื่อ:** No stack trace/SQL/secret in public response
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-14 — Backup and restore security
- **ทำอะไร:** Backup and restore security
- **ทำที่ไหน:** Operations scripts
- **ทำอย่างไร:** Encrypted backup; restricted access; retention; restore drill and audit
- **ถือว่าเสร็จเมื่อ:** Restore drill documented and successful
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-15 — Privacy and consent review
- **ทำอะไร:** Privacy and consent review
- **ทำที่ไหน:** `docs/security.md`, privacy/policy screens
- **ทำอย่างไร:** Document data minimization, retention, consent and handling aligned with school policy and applicable law
- **ถือว่าเสร็จเมื่อ:** Privacy approach reviewed before production
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-16 — Accessibility and responsive regression
- **ทำอะไร:** Accessibility and responsive regression
- **ทำที่ไหน:** All screens
- **ทำอย่างไร:** Keyboard navigation, contrast, focus, reduced motion, mobile layouts, dark theme, screen-reader labels
- **ถือว่าเสร็จเมื่อ:** Critical accessibility defects resolved
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P11-17 — End-to-end and regression tests
- **ทำอะไร:** End-to-end and regression tests
- **ทำที่ไหน:** `tests/integration/`, full test suite
- **ทำอย่างไร:** Test register→verify→login→report→match→claim→admin decision→handover plus negative access paths; rerun after changes
- **ถือว่าเสร็จเมื่อ:** Core journey and regressions pass
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 14. Phase 12 — Deployment & Operations
### [ ] P12-01 — Production configuration
- **ทำอะไร:** Production configuration
- **ทำที่ไหน:** Deployment config and environment
- **ทำอย่างไร:** APP_DEBUG=false; HTTPS; secure cookies; CORS allowlist; safe error logging
- **ถือว่าเสร็จเมื่อ:** Production config reviewed
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-02 — Secret provisioning
- **ทำอะไร:** Secret provisioning
- **ทำที่ไหน:** Secret manager/environment
- **ทำอย่างไร:** Set DB credentials, encryption key and AI service token outside Git; restrict access and rotation
- **ถือว่าเสร็จเมื่อ:** No secret in repo/container/log
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-03 — Database deployment
- **ทำอะไร:** Database deployment
- **ทำที่ไหน:** Migration scripts and production DB
- **ทำอย่างไร:** Take backup; apply migrations; verify constraints/indexes; seed only approved data
- **ถือว่าเสร็จเมื่อ:** Schema deployed and health checked
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-04 — Private storage deployment
- **ทำอะไร:** Private storage deployment
- **ทำที่ไหน:** Storage configuration
- **ทำอย่างไร:** Private filesystem/object storage, permissions, backup and retention; no public bucket
- **ถือว่าเสร็จเมื่อ:** Private files accessible only through authorized routes
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-05 — Web server and routing
- **ทำอะไร:** Web server and routing
- **ทำที่ไหน:** Web server config
- **ทำอย่างไร:** Document root exposes only intended frontend/public entry; backend config/storage inaccessible; HTTPS
- **ถือว่าเสร็จเมื่อ:** Private source/config cannot be downloaded
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-06 — AI Service deployment
- **ทำอะไร:** AI Service deployment
- **ทำที่ไหน:** AI runtime/network
- **ทำอย่างไร:** Internal-only service, authentication, health check, timeouts, resource limits and model versioning
- **ถือว่าเสร็จเมื่อ:** Only backend can call AI service
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-07 — Backup schedule and restore drill
- **ทำอะไร:** Backup schedule and restore drill
- **ทำที่ไหน:** Operations scripts/docs
- **ทำอย่างไร:** Automated encrypted backups, retention, restore to test environment, record outcome
- **ถือว่าเสร็จเมื่อ:** Restore tested and documented
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-08 — Monitoring and alerting
- **ทำอะไร:** Monitoring and alerting
- **ทำที่ไหน:** Operations configuration
- **ทำอย่างไร:** Monitor app/DB/storage/AI health, errors, security alerts and capacity
- **ถือว่าเสร็จเมื่อ:** Outages can be detected
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-09 — Deployment README
- **ทำอะไร:** Deployment README
- **ทำที่ไหน:** `README.md`, `docs/`
- **ทำอย่างไร:** Document prerequisites, env, migrations, seeds, run commands, tests, deployment and rollback
- **ถือว่าเสร็จเมื่อ:** New developer can set up from clean clone
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____

### [ ] P12-10 — Production acceptance
- **ทำอะไร:** Production acceptance
- **ทำที่ไหน:** Release checklist
- **ทำอย่างไร:** Smoke test auth, reports, claims, cash privacy, Admin, backup, HTTPS and responsive layouts
- **ถือว่าเสร็จเมื่อ:** Release accepted with evidence
- **บันทึกผลการทำงาน:** วันที่: ____ | ผู้ทำ/Agent: ____ | Commit/PR: ____
- **ไฟล์ที่สร้าง/แก้:** ____
- **ผลทดสอบ/หลักฐาน:** ____
- **ปัญหา/สิ่งที่ต้องตัดสินใจ:** ____


## 15. Screen Inventory — ตรวจความครบถ้วนทุกหน้าจอ
| กลุ่ม | หน้าจอ | Route | Task ที่เกี่ยวข้อง | ตรวจแล้ว |
|---|---|---|---|---|
| Public | Landing Page | `/` | P01-15 | [ ] |
| Auth | Login | `/login` | P01-16, P03 | [ ] |
| Auth | Register | `/register` | P01-17, P03 | [ ] |
| Auth | Pending Verification | `/account/pending` | P03 | [ ] |
| Auth | Account Status | `/account/status` | P03 | [ ] |
| Auth | Forgot Password | `/forgot-password` | P03 | [ ] |
| Auth | Reset Password | `/reset-password` | P03 | [ ] |
| Member | Dashboard | `/dashboard` | P04 | [ ] |
| Member | Lost Items | `/lost-items` | P04 | [ ] |
| Member | Found Items | `/found-items` | P04 | [ ] |
| Member | Item Detail | `/reports/{reportId}` | P04 | [ ] |
| Member | Report Lost | `/reports/lost/new` | P04 | [ ] |
| Member | Report Found | `/reports/found/new` | P04 | [ ] |
| Member | My Reports | `/my-reports` | P04 | [ ] |
| Member | My Claims | `/my-claims` | P07 | [ ] |
| Member | Claim Submission | `/reports/{reportId}/claim` | P07 | [ ] |
| Member | Claim Detail | `/claims/{claimId}` | P07 | [ ] |
| Member | Notifications | `/notifications` | P10 | [ ] |
| Member | Profile | `/profile` | P03 | [ ] |
| Admin | Admin Dashboard | `/admin` | P10 | [ ] |
| Admin | User Management | `/admin/users` | P10 | [ ] |
| Admin | Report Management | `/admin/reports` | P10 | [ ] |
| Admin | Claim Management | `/admin/claims` | P10 | [ ] |
| Admin | Ownership Verification | `/admin/ownership-verification` | P08/P10 | [ ] |
| Admin | Cash Recovery | `/admin/cash-recovery` | P09/P10 | [ ] |
| Admin | Return Management | `/admin/returns` | P10 | [ ] |
| Admin | AI Matching | `/admin/matching` | P05/P06/P10 | [ ] |
| Admin | Security Center | `/admin/security` | P10/P11 | [ ] |
| Admin | Activity Logs | `/admin/activity-logs` | P10/P11 | [ ] |
| Admin | Notifications Admin | `/admin/notifications` | P10 | [ ] |
| Admin | System Settings | `/admin/settings` | P10 | [ ] |
| Admin | Admin Profile | `/admin/profile` | P10 | [ ] |
| Admin Optional | Data & Maintenance | `/admin/maintenance` | P10/P12 | [ ] |

## 16. Database Inventory — ตรวจทุกตารางจาก spec.md
| ตาราง | Task | สร้างแล้ว | Migration ผ่าน | FK/Index ตรวจแล้ว | Security ตรวจแล้ว |
|---|---|---|---|---|---|
| `institutions` | P02-03 | [ ] | [ ] | [ ] | [ ] |
| `users` | P02-04 | [ ] | [ ] | [ ] | [ ] |
| `categories` | P02-05 | [ ] | [ ] | [ ] | [ ] |
| `reports` | P02-06 | [ ] | [ ] | [ ] | [ ] |
| `report_images` | P02-07 | [ ] | [ ] | [ ] | [ ] |
| `matches` | P02-08 | [ ] | [ ] | [ ] | [ ] |
| `claims` | P02-09 | [ ] | [ ] | [ ] | [ ] |
| `ownership_secrets` | P02-10 | [ ] | [ ] | [ ] | [ ] |
| `claim_answers` | P02-11 | [ ] | [ ] | [ ] | [ ] |
| `claim_evidence` | P02-12 | [ ] | [ ] | [ ] | [ ] |
| `ai_reviews` | P02-13 | [ ] | [ ] | [ ] | [ ] |
| `claim_events` | P02-14 | [ ] | [ ] | [ ] | [ ] |
| `found_cash_details` | P02-15 | [ ] | [ ] | [ ] | [ ] |
| `notifications` | P02-16 | [ ] | [ ] | [ ] | [ ] |
| `user_sessions` | P02-17 | [ ] | [ ] | [ ] | [ ] |
| `remember_tokens` | P02-17 | [ ] | [ ] | [ ] | [ ] |
| `activity_logs` | P02-18 | [ ] | [ ] | [ ] | [ ] |
| `security_alerts` | P02-18 | [ ] | [ ] | [ ] | [ ] |
| `risk_scores` | P02-18 | [ ] | [ ] | [ ] | [ ] |
| `admin_reviews` | P02-19 | [ ] | [ ] | [ ] | [ ] |
| `admin_audit_logs` | P02-19 | [ ] | [ ] | [ ] | [ ] |
| `system_settings` | P02-20 | [ ] | [ ] | [ ] | [ ] |
| `system_backups (Optional)` | P02-20 | [ ] | [ ] | [ ] | [ ] |
| `password_reset_tokens` | P02-21 | [ ] | [ ] | [ ] | [ ] |
| `admin_mfa` | P02-21 | [ ] | [ ] | [ ] | [ ] |
| `returns` | P02-21 | [ ] | [ ] | [ ] | [ ] |

## 17. API Inventory — ตรวจ Endpoint ครบตาม spec.md
### Authentication
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `POST /auth/register` | [ ] | [ ] | [ ] |
| `POST /auth/login` | [ ] | [ ] | [ ] |
| `POST /auth/logout` | [ ] | [ ] | [ ] |
| `GET /auth/me` | [ ] | [ ] | [ ] |
| `POST /auth/remember/revoke` | [ ] | [ ] | [ ] |
| `POST /auth/logout-all` | [ ] | [ ] | [ ] |
| `GET /auth/sessions` | [ ] | [ ] | [ ] |
| `DELETE /auth/sessions/{sessionId}` | [ ] | [ ] | [ ] |
| `POST /auth/forgot-password` | [ ] | [ ] | [ ] |
| `POST /auth/reset-password` | [ ] | [ ] | [ ] |
| `POST /auth/admin/mfa/verify` | [ ] | [ ] | [ ] |
| `POST /auth/admin/mfa/enable` | [ ] | [ ] | [ ] |
| `POST /auth/admin/mfa/disable` | [ ] | [ ] | [ ] |

### Profile
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /profile` | [ ] | [ ] | [ ] |
| `PATCH /profile` | [ ] | [ ] | [ ] |
| `POST /profile/change-password` | [ ] | [ ] | [ ] |
| `GET /profile/preferences` | [ ] | [ ] | [ ] |
| `PATCH /profile/preferences` | [ ] | [ ] | [ ] |

### Categories
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /categories` | [ ] | [ ] | [ ] |
| `POST /admin/categories` | [ ] | [ ] | [ ] |
| `PATCH /admin/categories/{id}` | [ ] | [ ] | [ ] |
| `DELETE /admin/categories/{id}` | [ ] | [ ] | [ ] |

### Reports
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /reports` | [ ] | [ ] | [ ] |
| `GET /reports/{id}` | [ ] | [ ] | [ ] |
| `POST /reports/lost` | [ ] | [ ] | [ ] |
| `POST /reports/found` | [ ] | [ ] | [ ] |
| `PATCH /reports/{id}` | [ ] | [ ] | [ ] |
| `POST /reports/{id}/close` | [ ] | [ ] | [ ] |
| `GET /my/reports` | [ ] | [ ] | [ ] |
| `POST /reports/{id}/images` | [ ] | [ ] | [ ] |
| `DELETE /reports/{id}/images/{imageId}` | [ ] | [ ] | [ ] |

### Matching
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /reports/{id}/matches` | [ ] | [ ] | [ ] |
| `POST /matching/run` | [ ] | [ ] | [ ] |
| `GET /admin/matches` | [ ] | [ ] | [ ] |
| `PATCH /admin/matches/{id}` | [ ] | [ ] | [ ] |

### Claims
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `POST /reports/{id}/claims` | [ ] | [ ] | [ ] |
| `GET /my/claims` | [ ] | [ ] | [ ] |
| `GET /claims/{id}` | [ ] | [ ] | [ ] |
| `POST /claims/{id}/answers` | [ ] | [ ] | [ ] |
| `POST /claims/{id}/evidence` | [ ] | [ ] | [ ] |
| `POST /claims/{id}/cancel` | [ ] | [ ] | [ ] |
| `POST /claims/{id}/more-info` | [ ] | [ ] | [ ] |

### Admin Claims
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /admin/claims` | [ ] | [ ] | [ ] |
| `GET /admin/claims/{id}` | [ ] | [ ] | [ ] |
| `POST /admin/claims/{id}/approve` | [ ] | [ ] | [ ] |
| `POST /admin/claims/{id}/reject` | [ ] | [ ] | [ ] |
| `POST /admin/claims/{id}/request-info` | [ ] | [ ] | [ ] |
| `POST /admin/claims/{id}/review-ai` | [ ] | [ ] | [ ] |

### Cash
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `POST /reports/found-cash` | [ ] | [ ] | [ ] |
| `POST /reports/{id}/cash-claim` | [ ] | [ ] | [ ] |
| `GET /admin/cash-cases` | [ ] | [ ] | [ ] |
| `GET /admin/cash-cases/{id}` | [ ] | [ ] | [ ] |
| `POST /admin/cash-cases/{id}/custody` | [ ] | [ ] | [ ] |
| `POST /admin/cash-cases/{id}/return` | [ ] | [ ] | [ ] |

### Returns
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `POST /admin/returns` | [ ] | [ ] | [ ] |
| `GET /admin/returns` | [ ] | [ ] | [ ] |
| `GET /admin/returns/{id}` | [ ] | [ ] | [ ] |
| `PATCH /admin/returns/{id}` | [ ] | [ ] | [ ] |
| `POST /admin/returns/{id}/complete` | [ ] | [ ] | [ ] |

### Notifications
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /notifications` | [ ] | [ ] | [ ] |
| `PATCH /notifications/{id}/read` | [ ] | [ ] | [ ] |
| `POST /notifications/read-all` | [ ] | [ ] | [ ] |
| `POST /admin/notifications` | [ ] | [ ] | [ ] |
| `GET /admin/notifications` | [ ] | [ ] | [ ] |

### Admin Users
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /admin/users` | [ ] | [ ] | [ ] |
| `GET /admin/users/{id}` | [ ] | [ ] | [ ] |
| `POST /admin/users/{id}/approve` | [ ] | [ ] | [ ] |
| `POST /admin/users/{id}/reject` | [ ] | [ ] | [ ] |
| `POST /admin/users/{id}/suspend` | [ ] | [ ] | [ ] |
| `POST /admin/users/{id}/unsuspend` | [ ] | [ ] | [ ] |
| `PATCH /admin/users/{id}/role` | [ ] | [ ] | [ ] |

### Security & Logs
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /admin/security/overview` | [ ] | [ ] | [ ] |
| `GET /admin/security/alerts` | [ ] | [ ] | [ ] |
| `GET /admin/security/alerts/{id}` | [ ] | [ ] | [ ] |
| `POST /admin/security/alerts/{id}/review` | [ ] | [ ] | [ ] |
| `GET /admin/security/risk-scores` | [ ] | [ ] | [ ] |
| `GET /admin/activity-logs` | [ ] | [ ] | [ ] |
| `GET /admin/audit-logs` | [ ] | [ ] | [ ] |

### Settings & Maintenance
| Endpoint | Permission | Validation | Test |
|---|---|---|---|
| `GET /admin/settings` | [ ] | [ ] | [ ] |
| `PATCH /admin/settings` | [ ] | [ ] | [ ] |
| `GET /admin/maintenance/health` | [ ] | [ ] | [ ] |
| `GET /admin/maintenance/backups` | [ ] | [ ] | [ ] |
| `POST /admin/maintenance/backups` | [ ] | [ ] | [ ] |

## 18. Workflow Acceptance Checklist
### [ ] WF-01 — Registration → Pending → Admin Verify → Verified
- **ตรวจรับ:** PENDING cannot use core features; Admin decision is audited
- **หลักฐานทดสอบ:** ____

### [ ] WF-02 — Login → Remember Me → Restore → Revoke
- **ตรวจรับ:** Email-only login; token hash; expiry, rotation and revoke work
- **หลักฐานทดสอบ:** ____

### [ ] WF-03 — Create Lost/Found → Public Preview → Search
- **ตรวจรับ:** Public fields only; private fields encrypted and hidden
- **หลักฐานทดสอบ:** ____

### [ ] WF-04 — Lost/Found → Rule Match → AI Image Match → Candidate
- **ตรวจรับ:** scores versioned; candidate is not proof; AI outage fallback works
- **หลักฐานทดสอบ:** ____

### [ ] WF-05 — Submit Claim → Questions → Evidence → AI Review → Admin Decision
- **ตรวจรับ:** attempt limit enforced; answers/evidence private; Admin final decision
- **หลักฐานทดสอบ:** ____

### [ ] WF-06 — Approved Claim → Schedule Return → Handover → Complete
- **ตรวจรับ:** Claim COMPLETED + Report RETURNED atomically; events/logs/audit recorded
- **หลักฐานทดสอบ:** ____

### [ ] WF-07 — Found Cash → Cash Claim → Match → Staff Custody → Return
- **ตรวจรับ:** public amount hidden; multiple claimants reviewed by Admin; custody history recorded
- **หลักฐานทดสอบ:** ____

### [ ] WF-08 — Suspicious Event → Risk Signal → Alert → Admin Review
- **ตรวจรับ:** no auto-ban/rejection from score alone
- **หลักฐานทดสอบ:** ____

### [ ] WF-09 — Admin Role Change / Suspend / MFA
- **ตรวจรับ:** last Admin protected; sensitive action re-authenticated; audit recorded
- **หลักฐานทดสอบ:** ____

## 19. Definition of Done — ใช้ตรวจทุก Task
- [ ] UI ทำงานจริง ไม่ใช่ Static Mockup
- [ ] Responsive: Mobile / Tablet / Desktop
- [ ] มี Loading / Empty / Error / Success / Disabled states ตามความเหมาะสม
- [ ] เชื่อม Backend API จริง
- [ ] Backend Validation ทำงาน
- [ ] Server-side Authorization ทำงาน
- [ ] Database Constraints/Transactions ถูกต้อง
- [ ] Error Handling ไม่เปิดเผยข้อมูลภายใน
- [ ] มี Happy Path และ Failure Path Tests
- [ ] ไม่มี Private Data/Secret รั่ว
- [ ] Activity/Audit Log ถูกบันทึกเมื่อจำเป็น
- [ ] Documentation และ README อัปเดต
- [ ] วิธี Run/Test ระบุครบ

## 20. Session Work Log — บันทึกการทำงานรายครั้ง
เพิ่มบรรทัดใหม่ทุก Session ห้ามเขียนทับประวัติเก่า
| # | วันที่ | Agent/ผู้ทำ | Task ID | ทำอะไร | ทำที่ไหน (Path/API/Table) | ทำอย่างไร | ผลทดสอบ/หลักฐาน | สถานะ |
|---:|---|---|---|---|---|---|---|---|
| 1 | ____ | ____ | ____ | ____ | ____ | ____ | ____ | ____ |
| 2 | ____ | ____ | ____ | ____ | ____ | ____ | ____ | ____ |
| 3 | ____ | ____ | ____ | ____ | ____ | ____ | ____ | ____ |
| 4 | 2026-11-01 | GitHub Copilot | P00-01 | อ่านข้อกำหนดครบและสรุปขอบเขต/กฎล็อก/Open Decisions/ข้อขัดแย้ง | `docs/requirements-understanding.md`, `task.md`; อ่าน `spec.md` และ starter เดิม | เริ่ม [/] ก่อนบันทึก; ตรวจ repository แบบ read-only; แยก policy conflicts จาก business rules; ไม่แก้ source/Spec/.env; ตรวจรับแล้วเป็น [x] | HEAD d90963a เริ่ม clean; Spec blob ตรง HEAD e8374dd4910479f3d7e2bb3879575e5de512336a; npm.cmd run check ผ่าน; .env ignored/untracked; checklist 185 occurrences | เสร็จเฉพาะ P00-01; ไม่เริ่ม P00-02 |

| 5 | 2026-11-01 | GitHub Copilot | P02-03/04/05/24/25/26 partial | Router/JSON/DB pool; three schema tables | server.js, package.json, Database portal revision 1, db_std04_p01 | Explicit owner SQL after identity check; no automatic migrations; managed env preserved | 21 HTTP cases, wrong-DB 503, DB constraints/rollback, syntax, audit passed; docs/phase-2-backend-foundation.md | Foundation verified; full task/product acceptance and deploy pending |

## 21. Current Session Handoff
### Latest handoff 2026-11-01 - foundation integration
- Confirmed p01 / Pxnzz/FoundIt main. User authorized commit/push/deploy. Code/schema foundation is tested; broader Phase 2 tasks remain [/] until their full acceptance criteria are checked.
- Changed server.js, package.json, .gitignore, README.md, task.md; added docs/phase-2-backend-foundation.md. Locked spec.md and frontend are unchanged.
- Migration revision 1 is stored via portal; institutions/users/categories created by explicit owner SQL on db_std04_p01. Portal Apply disabled, applied-history not updated. Never rerun CREATE blindly; inspect existing schema first. Append future SQL to accepted migration and upload separately, never Git.
- HTTP 21 scenarios, isolated wrong-DB case, DB constraints/transaction rollback, syntax and npm audit passed. See evidence document for boundaries; no auth/product E2E claim.
- Local env and managed env verified without exposing credentials; preserve runtime-specific managed DB user. No env save needed.
- Next: explicit staging/commit/push, portal Git Deploy, scans/job/logs/private URL checks, then record actual result. MCP tools unavailable; authenticated portal available.

### Historical handoff (preserved)
- **วันที่อัปเดตล่าสุด:** 2026-11-01
- **Phase ปัจจุบัน:** P00 — Repository Audit & Planning
- **Task กำลังทำ:** ไม่มี; จบรอบที่ P00-01 ตามคำสั่งทำทีละ Task
- **Task เสร็จและตรวจรับแล้ว:** P00-01 — อ่านข้อกำหนดทั้งหมด; หลักฐานใน `docs/requirements-understanding.md`
- **Task ติดปัญหา:** ยังไม่มี Task ที่เริ่มแล้วเป็น [!]; พบ conflict บล็อก implementation PHP/PDO/MySQL/FastAPI/โครงสร้าง source/migration/private storage ต้องยืนยันก่อนลงมือส่วนที่เกี่ยวข้อง
- **ไฟล์ที่เปลี่ยนล่าสุด:** สร้าง `docs/requirements-understanding.md`, แก้ `task.md`; ไม่มี commit ใหม่; ไม่แตะ `.env`, application และ `spec.md`
- **คำสั่งทดสอบล่าสุดและผล:** `npm.cmd run check` ผ่าน syntax; `git check-ignore .env` ผ่าน; `git ls-files` ไม่มี .env; `git hash-object spec.md` ตรง `git rev-parse HEAD:spec.md`; ไม่ได้รัน DB/UI/E2E/scanners และยังไม่ Deploy
- **สิ่งที่ต้องทำต่อ:** อ่าน spec.md/task.md ครบและตรวจ Git ใหม่ แล้วเริ่ม P00-02 โดยเปลี่ยน [ ] เป็น [/]; รายงานสำรวจละเอียดก่อน P00-03/P00-04/P00-05; ห้ามถือว่าการสำรวจเบื้องต้นรอบนี้ทำ Task เหล่านั้นเสร็จแล้ว
- **คำถามที่ต้องถามผู้ใช้:** จะใช้แนวทางใดแก้ข้อขัดแย้ง Locked Spec กับ policy ห้อง โดยห้ามฝ่าฝืน policy และห้ามแก้ Spec เอง? การปรับ Spec/Stack ต้องมีคำสั่งชัดเจน; canonical P03 IDs ต้องรออนุมัติก่อนรวม/เปลี่ยน
- **บริบทสำหรับ Session ถัดไป:** โปรเจกต์ p01 ยืนยันแล้ว พอร์ต 31041, DB db_std04_p01/user std04; ห้ามใช้ legacy หรือเดาค่าลับ; .env ถูกผู้ใช้แก้ก่อน Session นี้ ไม่อ่านหรือเปลี่ยนในงานเอกสาร; rg ไม่มีในเครื่อง ใช้ PowerShell/ค้นหาไฟล์แทน; npm.cmd หลีกเลี่ยงปัญหา execution policy
- **ประวัติ Handoff ก่อนหน้า (เก็บไว้):** วันที่ยังไม่มี; Phase ยังไม่เริ่ม; Task ทำ/เสร็จ/ติดปัญหาไม่มี; ไฟล์/ผลทดสอบยังไม่มี; Next เดิม P00-01 อ่าน spec.md และตรวจ Repository; ถามเฉพาะ Open Points ที่จำเป็น

## 22. คำสั่งเริ่มงานสำหรับ AI Agent
```text
อ่าน spec.md และ task.md ให้ครบก่อนเริ่มงาน ทั้งสองไฟล์เป็นข้อกำหนดหลักของ FoundIt
เริ่ม P00-01 ตรวจ Repository ปัจจุบันก่อน ห้ามเขียนทับไฟล์เดิมโดยไม่ตรวจ
ทำตาม Task ID ทีละส่วน และอธิบายทุกงานว่า ทำอะไร ทำที่ไหน ทำอย่างไร และทดสอบอย่างไร
ก่อนเริ่มให้เปลี่ยน [ ] เป็น [/]; เมื่อผ่านเกณฑ์ตรวจรับและมีหลักฐานแล้วจึงเปลี่ยนเป็น [x]
หลังทำงานทุกครั้งให้อัปเดต Checklist, Session Work Log และ Current Session Handoff ใน task.md
ห้ามติ๊กเสร็จจากการคาดเดา ห้ามลบประวัติ และห้ามเปลี่ยนกฎที่ล็อกไว้ใน spec.md
ถ้าข้อกำหนดไม่ชัดหรือขัดแย้ง ให้หยุดเฉพาะส่วนนั้นและถามผู้ใช้ก่อนตัดสินใจ
```

---
`spec.md` ระบุว่า FoundIt ต้องเป็นอะไร ส่วน `task.md` ระบุว่าต้องทำอะไร ทำที่ไหน ทำอย่างไร ตรวจรับอย่างไร และทำไปถึงไหนแล้ว ให้เก็บทั้งสองไฟล์ไว้ที่ Root Directory ของ Repository
