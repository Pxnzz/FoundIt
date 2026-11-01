# FoundIt — Product & Technical Specification

> เอกสารข้อกำหนดหลักสำหรับ AI Agent / Developer  
> Version: 1.0 | Status: Locked Baseline  
> Product: **FoundIt**  
> Tagline: **Every lost item deserves to find its owner.**  
> UI Language: ภาษาไทยเป็นหลัก

---

## 0. คำสั่งสำหรับ AI Agent (อ่านก่อนเริ่มงาน)

เอกสารนี้เป็น Source of Truth ของโปรเจกต์ FoundIt ให้ตรวจอ่านทั้งหมดก่อนแก้ไขหรือสร้างโค้ด

### 0.1 ข้อกำหนดที่ห้ามเปลี่ยนเอง

1. ห้ามเปลี่ยนชื่อ เป้าหมาย ฟีเจอร์หลัก หรือ Business Rules ที่ระบุไว้
2. ห้ามเพิ่ม `SUPER_ADMIN`; มี Permission Role เพียง `MEMBER` และ `ADMIN`
3. `member_type` และ `permission_role` เป็นคนละแนวคิด ห้ามรวมกัน
4. เบอร์โทรศัพท์เป็นข้อมูลติดต่อเท่านั้น ไม่ใช่ User ID และไม่ใช้ Login
5. Login ด้วย Email + Password เท่านั้น ไม่ใช้ Phone Login และไม่ต้องมี OTP ทางโทรศัพท์
6. UI ใช้ภาษาไทยเป็นหลักทุกหน้า ปุ่ม เมนู ฟอร์ม สถานะ และข้อความแจ้งเตือน ชื่อ FoundIt ใช้ภาษาอังกฤษได้
7. ต้อง Mobile-first Responsive รองรับมือถือ แท็บเล็ต Desktop และมี Light/Dark Mode
8. AI เป็นผู้ช่วยวิเคราะห์เท่านั้น Admin เป็นผู้ตัดสินสุดท้ายในการอนุมัติการรับคืน
9. ห้ามเปิดเผย Private Ownership Details, จำนวนเงินจริง, คำตอบลับ หรือ Evidence ให้ Public/ผู้ไม่มีสิทธิ์
10. ห้ามเก็บ Password, Remember Token, Secret Answer หรือ Encryption Key แบบ Plaintext
11. ห้าม Auto-ban หรือ Auto-reject จาก AI Score/Risk Score เพียงอย่างเดียว
12. ห้ามเปลี่ยน Stack หลักหรือยุบ/ตัดฟีเจอร์โดยไม่ได้รับอนุญาต
13. ห้ามแก้ส่วนที่ผู้ใช้ล็อกไว้ เว้นแต่ผู้ใช้สั่งแก้ชัดเจน
14. รายละเอียดที่ยังไม่กำหนดให้เลือกแนวทางปลอดภัยและเรียบง่าย พร้อมระบุเป็น Implementation Decision ห้ามตีความว่าได้รับอนุญาตให้เปลี่ยน Business Rules

### 0.2 วิธีทำงาน

- ตรวจ Repository ปัจจุบันก่อน ห้ามเขียนทับไฟล์โดยไม่ตรวจสอบ
- ก่อนลงมือ ให้รายงานโครงสร้างปัจจุบัน สิ่งที่มี/ขาด และแผนงานเป็น Phase
- ทำทีละ Phase ทดสอบก่อนเดินหน้าต่อ ไม่สร้างทุกระบบพร้อมกัน
- ใช้ชื่อไฟล์ ตาราง ฟิลด์ และ API ให้สอดคล้องกัน
- Validate ทั้ง Frontend และ Backend โดย Backend เป็นผู้ตัดสิน
- ใช้ PDO Prepared Statements, Authorization Middleware และ Server-side State Validation
- ทุกหน้าต้องมี Loading, Empty, Error, Success และ Disabled states ตามความเหมาะสม
- ห้ามใส่ Secret/API Key/Password ลง Git
- หลังแต่ละ Phase ให้สรุปไฟล์ที่สร้าง/แก้ วิธีรัน และผลทดสอบ

---

# 1. Product Overview

## 1.1 แนวคิดและเป้าหมาย

FoundIt คือแพลตฟอร์มแจ้งของหายและแจ้งพบสิ่งของภายในโรงเรียน รวมประกาศไว้ในระบบเดียว ช่วยค้นหา จับคู่ ตรวจสอบเจ้าของ และจัดการส่งคืนสิ่งของ

เป้าหมาย:
- ลดประกาศของหายที่กระจัดกระจายในแชท/โซเชียล
- ให้ผู้ทำของหายค้นหาด้วยชื่อ หมวดหมู่ สี ยี่ห้อ สถานที่ และวันที่
- ให้ผู้พบของแจ้งรายการและระบุข้อมูลลับสำหรับยืนยันเจ้าของ
- ใช้ Smart Matching ช่วยหารายการที่อาจตรงกัน
- ป้องกันการแอบอ้างด้วย Claim และ Ownership Verification
- ช่วยเจ้าหน้าที่จัดการของพบ การรับฝากเงินสด และการส่งคืน
- มี Admin Control Center, Activity Logs และ Security Monitoring

## 1.2 ขอบเขต

- MVP เริ่มจากโรงเรียนเดียว แต่เตรียมโครงสร้างรองรับหลายโรงเรียนผ่าน `institutions`
- เป็นระบบใช้งานจริง ไม่ใช่ Static Mockup
- ฟีเจอร์หลักประกอบด้วย Account, Reports, Search, Matching, Claims, Ownership Verification, Cash Recovery, Notifications, Dashboard, Admin และ Security

## 1.3 ประเภทสมาชิกและสิทธิ์

`member_type`:
- `STUDENT` = นักเรียน
- `TEACHER` = ครู
- `STAFF` = บุคลากรอื่น

`permission_role`:
- `MEMBER` = สมาชิกทั่วไป
- `ADMIN` = ผู้ดูแลระบบ มีสิทธิ์จัดการระบบ

มี Permission Role แค่สองค่า ไม่มี Super Admin. Admin ต้องมี MFA และ Re-authentication สำหรับการกระทำเสี่ยงสูงตามความเหมาะสม ห้าม Admin คนสุดท้ายลดสิทธิ์/ระงับ/ลบตัวเองจนไม่มี Admin เหลือ

---

# 2. Account, Registration & Authentication

## 2.1 สมัครสมาชิก

ฟิลด์สมัคร:
1. ชื่อจริง (`first_name`)
2. นามสกุล (`last_name`)
3. ชื่อเล่น (`nickname`)
4. อีเมล (`email`)
5. รหัสนักเรียน 5 หลัก เฉพาะ STUDENT (`student_code`)
6. เบอร์โทรศัพท์ 10 หลัก (`phone`)
7. รหัสผ่าน (`password` รับเข้า API แล้ว Hash)
8. ยืนยันรหัสผ่าน (`password_confirmation` ตรวจสอบเท่านั้น ไม่เก็บ DB)
9. ประเภทสมาชิก (`member_type`)

กฎ:
- Phone ต้องกรอกทุกบัญชี เป็นตัวเลข 10 หลัก เก็บ `VARCHAR(10)` ใช้ติดต่อเท่านั้น ไม่ใช่ User ID และไม่ใช้ Login
- ไม่ต้องมี OTP โทรศัพท์
- Email Normalize เป็น lowercase และ Unique แบบไม่สนตัวพิมพ์เล็ก/ใหญ่
- `student_code` เป็น `VARCHAR(5)` เพื่อรักษาเลข 0 นำหน้า
- STUDENT ต้องมีรหัสนักเรียน 5 หลัก; TEACHER/STAFF ต้องเป็น NULL
- Password Confirmation เป็น validation เท่านั้น
- ใช้ PHP `password_hash()` / `password_verify()`
- มีปุ่มแสดง/ซ่อนรหัสผ่านทั้งสองช่อง
- ห้ามเพิ่มวันเกิด ระดับชั้น ห้องเรียนในแบบฟอร์มสมัครเอง
- บัญชีใหม่เริ่ม `PENDING` ต้องให้ Admin ตรวจสอบก่อนใช้ฟีเจอร์หลัก

Verification status:
- `PENDING`: รอตรวจสอบ ใช้ได้เฉพาะส่วนบัญชี/สถานะ
- `VERIFIED`: ใช้ฟีเจอร์สมาชิกได้
- `REJECTED`: ไม่ผ่านการตรวจสอบ
- `SUSPENDED`: ถูกระงับ

## 2.2 Login / Remember Me

- Login ด้วย Email + Password เท่านั้น
- Checkbox “จดจำการเข้าสู่ระบบ”
- Session Cookie สำหรับ Session ปัจจุบัน
- Remember Me Token อายุเริ่มต้น 30 วัน
- เก็บเฉพาะ Hash ของ Token ใน DB; Cookie มี Token แบบสุ่มที่ปลอดภัย
- Cookie: `HttpOnly`, `Secure` บน HTTPS, `SameSite` เหมาะสม
- Rotate Session ID หลัง Login
- CSRF protection สำหรับ State-changing Requests เมื่อใช้ Cookie Session
- Logout ล้าง Session/Cookie และ Revoke ตามนโยบาย
- เปลี่ยนรหัสผ่าน/สงสัยบัญชีถูกยึด ให้ Revoke Remember Tokens ทั้งหมด
- แนะนำหน้า Active Sessions และ Logout all devices
- Admin ต้องผ่าน MFA

---

# 3. UX/UI Design System

## 3.1 Visual Direction

Modern Youthful, Professional but Friendly, Gen Z / Gen Alpha, Modern & Playful, Clean & Minimal, Bento Layout และ Friendly Illustrations. ไม่ดูเป็นเว็บราชการหรือเว็บโรงเรียนยุคเก่า

## 3.2 Palette

| Token | Value | ใช้กับ |
|---|---|---|
| Primary | `#7457FF` | ปุ่มหลัก, Active Nav, Link |
| Secondary | `#35C9E8` | Highlight รอง |
| Lime Accent | `#C7F36B` | เน้นจุดเล็ก ๆ / Success Accent |
| Pink Accent | `#FF8299` | จุดเน้น/สถานะที่เหมาะสม |
| Light Background | `#F7F7FB` | พื้นหลัง Light Mode |
| Text | น้ำเงินดำ/เทาเข้ม | ตัวอักษร |
| Surface | ขาว | Card/Form |

ใช้ม่วงเป็นสีหลัก ไม่ใช้ทุกสีพร้อมกัน Dark Mode ต้องมี Contrast อ่านง่าย

## 3.3 Typography & Layout

- ฟอนต์หลัก Anuphan; ทางเลือก LINE Seed Sans TH หรือ IBM Plex Sans Thai
- Mobile-first Responsive สำหรับมือถือ/แท็บเล็ต/Desktop
- Desktop ใช้ Sidebar หรือ Top Navigation ตามบริบท; Mobile ใช้ Bottom Navigation/Drawer
- มี Light/Dark Mode และจำค่าความชอบผู้ใช้
- Micro-interactions, animation แบบพอดี, hover/focus/pressed/disabled states
- ฟอร์มยาวแบ่ง Step พร้อม Progress Indicator
- รองรับ Keyboard Navigation, Focus Indicator และ `prefers-reduced-motion`
- ทุก Action มี Feedback; รูปภาพมี Placeholder/Loading/Error

## 3.4 Shared Components

`AppHeader`, `AppSidebar`, `MobileBottomNav`, `PageContainer`, `Button`, `IconButton`, `Input`, `Select`, `Textarea`, `FormField`, `PasswordInput`, `SearchBar`, `FilterPanel`, `FilterChip`, `ItemCard`, `StatusBadge`, `Avatar`, `Modal`, `Drawer`, `Tabs`, `Pagination`, `EmptyState`, `LoadingSkeleton`, `Toast`, `ConfirmDialog`, `ImageUploader`, `DateTimePicker`, `ThemeToggle`, `NotificationBell`.

---

# 4. Screen-by-Screen Specification

ทุกหน้าต้องใช้ภาษาไทยเป็นหลัก แสดงเฉพาะข้อมูลที่ผู้ใช้มีสิทธิ์เห็น และรองรับ Responsive + Light/Dark Mode

## 4.1 Public & Authentication

### 4.1.1 Landing Page — `/`

- Header: Logo FoundIt, เข้าสู่ระบบ, สมัครสมาชิก
- Hero: Headline อธิบายการตามหาของ, Tagline, CTA “แจ้งของหาย” / “แจ้งพบสิ่งของ”
- Search Preview
- How It Works: แจ้งรายการ → จับคู่ → ตรวจสอบ → ส่งคืน
- Feature Highlights: Smart Matching, Ownership Verification, ติดตามสถานะ
- Recent Public Reports (Public Fields เท่านั้น)
- Footer: เกี่ยวกับ, วิธีใช้, Privacy Policy, ติดต่อผู้ดูแล
- Guest กดฟีเจอร์ที่ต้อง Login ให้ Redirect ไป Login

### 4.1.2 Login — `/login`

- Email, Password + Show/Hide, Remember Me, ปุ่มเข้าสู่ระบบ
- Link สมัครสมาชิก และลืมรหัสผ่าน
- Loading/Error Feedback
- Error ต้องไม่เปิดเผยว่า Email มีอยู่หรือไม่
- Rate Limit Login; ตรวจ Verification Status หลัง Login
- Rotate Session ID; Remember Token ต้อง Hash ใน DB; Admin ไป MFA

### 4.1.3 Register — `/register`

Step 1 ข้อมูลส่วนตัว: ชื่อจริง, นามสกุล, ชื่อเล่น, ประเภทสมาชิก
Step 2 ติดต่อ/ยืนยัน: Email, Phone 10 หลัก, Student Code 5 หลัก (แสดงเฉพาะ STUDENT)
Step 3 รหัสผ่าน: Password, Confirm Password, Show/Hide ทั้งคู่
Step 4 ตรวจสอบ: Summary, ย้อนกลับ, สมัครสมาชิก

- แสดง Progress Indicator
- Validate ทุก Step และ Backend ซ้ำ
- Backend กำหนด `permission_role=MEMBER`, `verification_status=PENDING`
- สมัครสำเร็จไป Pending Verification

### 4.1.4 Pending Verification — `/account/pending`

แสดงสถานะรอตรวจสอบ คำอธิบาย ชื่อผู้ใช้ ปุ่มตรวจสอบสถานะอีกครั้ง และออกจากระบบ ไม่แสดงฟีเจอร์หลักที่ยังใช้ไม่ได้

### 4.1.5 Account Status — `/account/status`

รองรับ REJECTED/SUSPENDED: สถานะ เหตุผลที่เปิดเผยได้ วันเวลาอัปเดต ช่องทางติดต่อผู้ดูแล และ Logout

### 4.1.6 Forgot/Reset Password — `/forgot-password`, `/reset-password`

- Forgot: กรอก Email และแสดงข้อความกลาง ๆ ไม่เปิดเผยว่าบัญชีมีอยู่หรือไม่
- Reset Token สุ่ม ใช้ครั้งเดียว มีวันหมดอายุ เก็บ Hash
- Reset: Password ใหม่ + Confirm Password
- สำเร็จแล้ว Revoke Remember Tokens ทั้งหมด
- หากยังไม่มี Email Delivery ให้ทำ Adapter/Development Mail Log; ห้ามแสดง Token ใน Production UI

## 4.2 Member Application

### 4.2.1 Member Dashboard — `/dashboard`

- Greeting ด้วยชื่อเล่น
- Quick Actions: แจ้งของหาย / แจ้งพบสิ่งของ
- Summary Cards: รายการของฉัน, Claims ที่กำลังดำเนินการ, Matches
- Recent Matches ที่อาจตรงกับของผู้ใช้
- Recent Public Reports
- Notification Preview และ Tips
- ข้อมูลต้องอิงบัญชีที่ Login; ไม่แสดง Private Details

### 4.2.2 Lost Items — `/lost-items`

- Search Bar
- Filter: หมวดหมู่, สี, ยี่ห้อ, สถานที่, วันที่
- Sort: ล่าสุด, เก่าที่สุด, ความเกี่ยวข้อง
- Item Cards: รูป, ชื่อ, หมวดหมู่, สี/ยี่ห้อที่เปิดเผย, สถานที่, วันที่, Status
- Pagination/Infinite Scroll, Empty State, Clear Filters

### 4.2.3 Found Items — `/found-items`

- Search และ Filter เหมือน Lost Items
- แสดง Public Fields เท่านั้น
- ห้ามแสดงยอดเงินสดหรือ Secret Details
- Card มี CTA ดูรายละเอียด

### 4.2.4 Item Detail — `/reports/{reportId}`

- Image Gallery, ชื่อ, ประเภท LOST/FOUND, หมวดหมู่, สี/ยี่ห้อ/รายละเอียดสาธารณะ
- สถานที่และวันที่โดยประมาณ, Status
- ข้อมูลผู้ประกาศเฉพาะส่วนที่อนุญาต เช่น ชื่อเล่น หรือ Contact ผ่านระบบ
- Similar/Matching Items
- CTA “ฉันคิดว่านี่คือของของฉัน” ตามประเภทและสถานะ
- ห้ามส่ง Private Ownership Details ไป Client; ไม่เปิดเบอร์โทรตรงเป็นค่าเริ่มต้น
- ตรวจสิทธิ์ก่อนแก้ไข/ปิดรายการ

### 4.2.5 Report Lost — `/reports/lost/new`

Step 1 สิ่งของ: ชื่อ (Required), หมวดหมู่ (Required), สี, ยี่ห้อ, Public Description, รูปภาพ
Step 2 สถานที่/เวลา: สถานที่คาดว่าหาย, วันที่, เวลา/ช่วงเวลาโดยประมาณ
Step 3 Private Details: ลักษณะเฉพาะ, ตำหนิ/รอย, ข้อมูลใช้สร้างคำถามยืนยันเจ้าของ (เข้ารหัส)
Step 4 Preview: แสดง Public Preview, เตือนว่า Private Details ไม่ปรากฏในประกาศ, Submit

### 4.2.6 Report Found — `/reports/found/new`

Step 1 สิ่งของ: ชื่อ, หมวดหมู่, สี, ยี่ห้อ, Public Description, รูปภาพ
Step 2 สถานที่/เวลา: สถานที่พบ, วันที่, เวลา/ช่วงเวลา
Step 3 Private Details: ลักษณะเฉพาะที่ผู้พบสังเกตได้แต่ไม่เปิดเผย, ตำหนิ/รายละเอียดช่วยแยกเจ้าของจริง (เข้ารหัส)
Step 4 Public Preview และ Submit

### 4.2.7 My Reports — `/my-reports`

Tabs ทั้งหมด/ของหาย/ของที่พบ, Filter Status, Report Cards, วันที่, สถานะ, ดูรายละเอียด, แก้ไข/ปิดเมื่อมีสิทธิ์, Match Count ที่เปิดเผยได้

### 4.2.8 My Claims — `/my-claims`

รายการ Claims ของผู้ใช้, Status, วันที่ยื่น, รายการที่เกี่ยวข้อง, ดูรายละเอียด/ตอบเพิ่ม/ยกเลิกตามสถานะ, Timeline. ไม่เปิดเผย Private Data ของ Finder

### 4.2.9 Claim Submission — `/reports/{reportId}/claim`

- สรุป Public Report
- คำถามยืนยันที่สร้างจาก Private Details โดยไม่เปิดเผยคำตอบ
- ช่องคำตอบ, Evidence Upload (ภาพเก่า/ใบเสร็จ/หลักฐาน), ยืนยันความถูกต้อง
- แสดงจำนวนครั้งที่เหลือได้ตาม Policy
- Limit ตัวอย่าง 3 Attempts ปรับได้โดย Admin; Rate Limit; คำตอบ/Evidence เป็นข้อมูลส่วนตัว

### 4.2.10 Claim Detail — `/claims/{claimId}`

Status, Report ที่เกี่ยวข้อง, คำตอบ/Evidence เฉพาะผู้ยื่นและ Admin, AI Summary ตามสิทธิ์, Timeline, ตอบกลับเมื่อ MORE_INFO_REQUIRED, Cancel เมื่อสถานะอนุญาต

### 4.2.11 Notifications — `/notifications`

รายการแจ้งเตือน, Filter ทั้งหมด/ยังไม่อ่าน, Mark Read, Mark All Read, Link ไป Report/Claim, Pagination. ห้ามใส่ Secret ในข้อความแจ้งเตือน

### 4.2.12 Profile — `/profile`

ชื่อจริง/นามสกุล/ชื่อเล่น, Email, Phone, Member Type, Student Code เฉพาะ STUDENT (Mask ตามเหมาะสม), วันสมัคร, Edit, Change Password, Theme Preference, Active Sessions/Logout All Devices หากเปิดใช้. ห้ามแก้ Role เอง

## 4.3 Admin Application

Admin ต้อง Login และผ่าน MFA ก่อนเข้าหน้า Admin

### 4.3.1 Admin Dashboard — `/admin`

Overview Cards: Total Users, Pending Users, Active Lost, Active Found, Pending Claims, Returned Items, Cash Cases Under Review, Security Alerts. Charts: Reports ตามเวลา, Claim Status, Return Rate. Pending Work Queue, Recent Admin Activity, Quick Actions

### 4.3.2 User Management — `/admin/users`

Search ชื่อ/Email/Student Code; Filter Member Type/Role/Verification Status; Table ชื่อ, Email, ประเภท, Role, Status, วันที่สมัคร; User Detail; Approve/Reject/Suspend/Unsuspend; Account History; เปลี่ยน MEMBER/ADMIN ตามสิทธิ์. ทุกการเปลี่ยน Role ต้อง Audit และป้องกัน Admin คนสุดท้าย

### 4.3.3 Report Management — `/admin/reports`

Tabs Lost/Found/All; Search/Filter; Table ชื่อ, ผู้ประกาศ, วันที่, สถานที่, Status; Detail; ตรวจรูป/เนื้อหา; Edit Status/Close/Reopen ตาม Business Rules; ดู Matches. Private Details เข้าถึงได้เฉพาะ Admin ที่ได้รับอนุญาตและต้อง Audit

### 4.3.4 Claim Management — `/admin/claims`

Filter Status, Review Queue, Claim Detail, คำตอบและหลักฐาน, AI Result, Report Context, Approve/Reject/Request More Info. ต้องระบุเหตุผลเมื่อ Reject/Request More Info; ทุก Decision สร้าง Claim Event และ Admin Audit Log

### 4.3.5 Ownership Verification — `/admin/ownership-verification`

คำถาม, คำตอบ Claimant, Reference Secret เท่าที่จำเป็น, Evidence Viewer จำกัดสิทธิ์, AI Summary, Labels `CONSISTENT`/`PARTIAL`/`CONFLICTING`/`INSUFFICIENT`, Admin Decision Panel และเหตุผล

### 4.3.6 Cash Recovery — `/admin/cash-recovery`

รายการเงินสด, Public Summary, Private Amount/Place/Date/Time, Claimants, Match Summary, Custody Status, ผู้รับฝาก, เวลารับฝาก/คืน, บันทึก Custody/Return. หลาย Claimants ต้อง Admin Review ไม่ใช้ First-come-first-served; Public ห้ามเห็นยอดเงินจริง

### 4.3.7 Return Management — `/admin/returns`

รายการ Approved ที่รอส่งคืน, นัดวันเวลา/สถานที่, ผู้ส่งมอบ/ผู้รับ, Checklist, Timestamp, Mark Completed, หลักฐานการส่งมอบตามเหมาะสม

### 4.3.8 AI Matching — `/admin/matching`

Matching Queue, Candidate Pairs, Rule/Image/Hybrid Scores, Feature Breakdown, Status, Review/Confirm/Dismiss. บันทึกประวัติ; ไม่แสดง Secret ใน Matching ทั่วไป

### 4.3.9 Security Center — `/admin/security`

Security Overview, High Risk Alerts, Login Failure Trends, Suspicious Claims, Unauthorized API Attempts, New Device Signals, Risk Score, Alert Detail, Admin Review. Risk Score เป็น Signal ไม่ใช่ข้อพิสูจน์

### 4.3.10 Activity Logs — `/admin/activity-logs`

Filter ผู้ใช้/Action/Category/Date/Result/Risk, Search, Log Table, Metadata ที่ไม่ลับ, Export ตาม Policy. Append-only ห้ามแก้/ลบ Log เดิม; แก้ความเข้าใจผิดด้วย Audit Entry ใหม่

### 4.3.11 Notifications Admin — `/admin/notifications`

สร้างประกาศ/Notification, เลือกผู้รับ/กลุ่ม, Preview, Send, Delivery/Read Summary หากรองรับ, บันทึกผู้ส่งและเวลา

### 4.3.12 System Settings — `/admin/settings`

จัดการ Matching Weights, Claim Attempt Limit, Remember Me Lifetime, Security Thresholds, Categories, Log Retention, AI Settings, Feature Toggles ที่ไม่เปลี่ยน Business Rules. Validate ทุกค่าและ Audit. Secret/API Key เก็บใน Environment/Secret Store ไม่เก็บ Plaintext ใน DB

### 4.3.13 Admin Profile — `/admin/profile`

ข้อมูล Admin, Change Password, MFA Settings, Active Sessions, Logout All Devices, ประวัติการกระทำของตนเอง

### 4.3.14 Data & Maintenance — `/admin/maintenance` (Optional)

Database Health, Storage Usage, Backup Status, Maintenance Mode, Last Backup. จำกัดการดาวน์โหลด Backup; Restore ต้องยืนยันและ Audit

---

# 5. Business Workflows & State Rules

## 5.1 Report Status

- `ACTIVE`: ประกาศเปิดอยู่
- `MATCHED`: พบ Candidate ที่อาจตรงกัน
- `CLAIM_PENDING`: มี Claim อยู่ระหว่างดำเนินการ
- `RETURNED`: ส่งคืนแล้ว
- `CLOSED`: ปิดประกาศ

Transition ตัวอย่างที่อนุญาต:
- Create → ACTIVE
- ACTIVE → MATCHED
- ACTIVE/MATCHED → CLAIM_PENDING เมื่อมี Claim ที่ต้องตรวจ
- CLAIM_PENDING → MATCHED หรือ ACTIVE เมื่อ Claim ถูกปฏิเสธ/ยกเลิกและยังเปิดรายการ
- MATCHED/CLAIM_PENDING → RETURNED เมื่อส่งคืนสำเร็จ
- ACTIVE/MATCHED → CLOSED ตามเงื่อนไข
- RETURNED เป็นสถานะจบ; ย้อนกลับได้เฉพาะ Admin Override ที่ Audit

Backend ต้อง validate transition ห้ามเชื่อ Status จาก Client

## 5.2 Claim Status

`PENDING`, `AI_REVIEWING`, `ADMIN_REVIEW`, `MORE_INFO_REQUIRED`, `APPROVED`, `REJECTED`, `COMPLETED`.

AI Review และ Admin Review ต้องไม่ข้ามการตัดสินใจของ Admin. การเปลี่ยนสถานะต้องบันทึก Event และตรวจสิทธิ์/สถานะเดิม

## 5.3 Smart Matching

Rule Features: Category, Color, Brand, Location, Date/Time, Description.

Image Matching:
- ใช้ Image Embeddings + Similarity Search ไม่เรียก Chat AI ทุกคู่
- PHP Backend เรียก Python/FastAPI เมื่อจำเป็น
- Hybrid Score รวม Rule Score และ Image Similarity ตาม Weights ที่ Admin ตั้งได้
- บันทึก Algorithm/Model Version และ Feature Breakdown ที่ไม่ใช่ Secret
- Similarity Score ไม่ใช่การยืนยันว่าเป็นสิ่งของชิ้นเดียวกัน

## 5.4 Ownership Verification Workflow

1. Finder สร้าง Found Report พร้อม Public Fields และ Private Ownership Details
2. ระบบหา Lost Candidates
3. Owner ส่ง Claim
4. ระบบสร้างคำถามจาก Private Details โดยไม่เปิดเผยคำตอบ
5. Claimant ตอบและแนบหลักฐาน (ภาพเก่า/ใบเสร็จ/ตำหนิ)
6. AI วิเคราะห์ความสอดคล้อง
7. Admin ตรวจคำตอบ Evidence, AI Summary และ History
8. Admin Approve / Reject / Request More Information
9. นัดหมายส่งมอบ
10. บันทึก Return และปิดงาน

AI Labels: `CONSISTENT`, `PARTIAL`, `CONFLICTING`, `INSUFFICIENT`. AI Advisory only; Admin Final Decision. Attempt Limit เริ่มต้นตัวอย่าง 3 ครั้งและปรับได้ เมื่อเกิน Limit ส่ง Admin Review. Secret ต้องเข้ารหัส Key อยู่นอก DB; ห้าม Secret ใน Logs/Public API

## 5.5 Cash Recovery

- Finder บันทึกยอดเงินจริง สถานที่ วันที่/เวลาใน Private Data
- Public Post แสดงเพียงข้อความทั่วไป เช่น “พบเงินสดบริเวณโรงอาหาร” ห้ามเปิดเผยจำนวนเงิน
- Claimant ระบุจำนวนเงิน สถานที่ ช่วงเวลา และรายละเอียดเหตุการณ์
- Matching เทียบจำนวนเงิน+สถานที่+เวลา; Exact Match เป็น Preliminary Screening ไม่ใช่ Proof
- หลาย Claimants ให้ Admin ตรวจ ไม่ใช้ First-come-first-served
- ผู้พบส่งเงินให้เจ้าหน้าที่เก็บรักษา; Admin บันทึก Custody และ Return
- หลักฐานไม่พอให้คง Under Review

## 5.6 Handover

Claim ต้อง APPROVED ก่อนนัดส่งคืน. บันทึกวันเวลา/สถานที่/ผู้ส่งมอบ/ผู้รับ/เวลา. เมื่อเสร็จ Claim → COMPLETED และ Report → RETURNED ใน Transaction พร้อม Claim Event, Activity Log และ Admin Audit Log

---

# 6. Database Specification

## 6.1 Conventions

- MySQL 8.x, InnoDB, `utf8mb4`
- ใช้ UTC ใน DB และแสดงเวลา `Asia/Bangkok`
- ใช้ Foreign Keys, Unique Constraints, Indexes และ Transactions
- ใช้ `BIGINT UNSIGNED` สำหรับ PK ตารางหลัก (หรือใช้ INT ได้เฉพาะเมื่อมีเหตุผลและคงความสอดคล้อง)
- Email Normalize เป็น lowercase ก่อนบันทึก
- Student Code/Phone เป็น VARCHAR เพื่อรักษารูปแบบและเลขศูนย์นำหน้า
- เงินใช้ DECIMAL ไม่ใช้ FLOAT
- Private Data เข้ารหัสระดับ Application; Key แยกจาก DB
- Upload อยู่ Private Storage นอก Web Root

## 6.2 Tables

ตารางหลัก: `institutions`, `users`, `categories`, `reports`, `report_images`, `matches`, `claims`, `notifications`, `ownership_secrets`, `claim_answers`, `claim_evidence`, `ai_reviews`, `claim_events`, `found_cash_details`, `user_sessions`, `remember_tokens`, `activity_logs`, `security_alerts`, `risk_scores`, `admin_reviews`, `admin_audit_logs`, `system_settings`; Optional `system_backups`. ตารางสนับสนุนความสามารถ: `password_reset_tokens`, `admin_mfa`, `returns`.

### 6.2.1 `institutions`

- `institution_id BIGINT UNSIGNED PK AI`
- `name VARCHAR(255) NOT NULL`
- `code VARCHAR(50) UNIQUE`
- `address TEXT NULL`
- `is_active BOOLEAN DEFAULT TRUE`
- `created_at DATETIME`, `updated_at DATETIME`

### 6.2.2 `users`

- `user_id BIGINT UNSIGNED PK AI`
- `institution_id BIGINT UNSIGNED FK`
- `first_name VARCHAR(100) NOT NULL`
- `last_name VARCHAR(100) NOT NULL`
- `nickname VARCHAR(50) NOT NULL`
- `email VARCHAR(255) NOT NULL UNIQUE` (normalize lowercase)
- `student_code VARCHAR(5) NULL UNIQUE`
- `phone VARCHAR(10) NOT NULL`
- `member_type ENUM('STUDENT','TEACHER','STAFF') NOT NULL`
- `permission_role ENUM('MEMBER','ADMIN') NOT NULL DEFAULT 'MEMBER'`
- `password_hash VARCHAR(255) NOT NULL`
- `verification_status ENUM('PENDING','VERIFIED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING'`
- `rejection_reason TEXT NULL` (restricted)
- `email_verified_at DATETIME NULL`, `last_login_at DATETIME NULL`
- `created_at DATETIME`, `updated_at DATETIME`

Constraints: Backend validate phone `^[0-9]{10}$`; STUDENT ต้อง Student Code 5 digits; TEACHER/STAFF ต้อง NULL; Unique Email และ Student Code (NULL ได้หลายแถวตาม MySQL); Protect last Admin ด้วย Transaction + Server-side Rule

### 6.2.3 `categories`

- `category_id BIGINT UNSIGNED PK AI`
- `institution_id BIGINT UNSIGNED FK`
- `name VARCHAR(100) NOT NULL`
- `slug VARCHAR(120) NOT NULL`
- `description VARCHAR(255) NULL`
- `is_active BOOLEAN DEFAULT TRUE`
- `sort_order INT DEFAULT 0`
- `created_at DATETIME`, `updated_at DATETIME`
- Unique (`institution_id`, `slug`)

### 6.2.4 `reports`

- `report_id BIGINT UNSIGNED PK AI`
- `institution_id BIGINT UNSIGNED FK`
- `user_id BIGINT UNSIGNED FK` (creator)
- `report_type ENUM('LOST','FOUND') NOT NULL`
- `title VARCHAR(180) NOT NULL`
- `category_id BIGINT UNSIGNED FK NOT NULL`
- `color VARCHAR(80) NULL`, `brand VARCHAR(120) NULL`
- `public_description TEXT NULL`
- `location_text VARCHAR(255) NOT NULL`
- `occurred_at DATETIME NULL` (UTC)
- `time_precision ENUM('EXACT','APPROXIMATE','RANGE','UNKNOWN') DEFAULT 'APPROXIMATE'`
- `status ENUM('ACTIVE','MATCHED','CLAIM_PENDING','RETURNED','CLOSED') DEFAULT 'ACTIVE'`
- `is_cash BOOLEAN DEFAULT FALSE`
- `created_at DATETIME`, `updated_at DATETIME`, `closed_at DATETIME NULL`, `returned_at DATETIME NULL`
- Indexes (`institution_id`,`report_type`,`status`,`created_at`), (`category_id`,`status`), (`user_id`,`created_at`)
- ห้ามเก็บ Secret ใน `public_description`

### 6.2.5 `report_images`

- `image_id BIGINT UNSIGNED PK AI`
- `report_id BIGINT UNSIGNED FK`
- `storage_key VARCHAR(500) NOT NULL` (private path/key)
- `mime_type VARCHAR(100) NOT NULL`
- `file_size BIGINT UNSIGNED NOT NULL`
- `width INT NULL`, `height INT NULL`
- `sort_order INT DEFAULT 0`
- `created_at DATETIME`
- ตรวจ MIME จากไฟล์จริง จำกัดขนาดและเก็บนอก Public Web Root

### 6.2.6 `matches`

- `match_id BIGINT UNSIGNED PK AI`
- `lost_report_id BIGINT UNSIGNED FK` (must be LOST)
- `found_report_id BIGINT UNSIGNED FK` (must be FOUND)
- `rule_score DECIMAL(6,2)` 0–100
- `image_score DECIMAL(6,2) NULL` 0–100
- `hybrid_score DECIMAL(6,2)` 0–100
- `feature_breakdown JSON` (no secrets)
- `algorithm_version VARCHAR(50)`
- `status ENUM('SUGGESTED','CONFIRMED','DISMISSED') DEFAULT 'SUGGESTED'`
- `reviewed_by BIGINT UNSIGNED FK users NULL`, `reviewed_at DATETIME NULL`, `created_at DATETIME`
- Unique (`lost_report_id`,`found_report_id`)

### 6.2.7 `claims`

- `claim_id BIGINT UNSIGNED PK AI`
- `report_id BIGINT UNSIGNED FK` (Found Report)
- `claimant_user_id BIGINT UNSIGNED FK users`
- `status ENUM('PENDING','AI_REVIEWING','ADMIN_REVIEW','MORE_INFO_REQUIRED','APPROVED','REJECTED','COMPLETED') DEFAULT 'PENDING'`
- `attempt_number INT UNSIGNED`
- `claimant_description TEXT NULL`
- `admin_decision_reason TEXT NULL` (restricted)
- `reviewed_by BIGINT UNSIGNED FK users NULL`, `reviewed_at DATETIME NULL`
- `created_at DATETIME`, `updated_at DATETIME`
- Indexes (`claimant_user_id`,`status`), (`report_id`,`status`)

### 6.2.8 `ownership_secrets`

- `secret_id BIGINT UNSIGNED PK AI`
- `report_id BIGINT UNSIGNED FK UNIQUE`
- `secret_payload_encrypted LONGBLOB NOT NULL`
- `encryption_key_version VARCHAR(50)`
- `created_at DATETIME`, `updated_at DATETIME`
- Payload encrypted at application layer; never returned to public/member APIs or logs

### 6.2.9 `claim_answers`

- `answer_id BIGINT UNSIGNED PK AI`
- `claim_id BIGINT UNSIGNED FK`
- `question_key VARCHAR(100)`
- `answer_encrypted LONGBLOB NOT NULL`
- `created_at DATETIME`

### 6.2.10 `claim_evidence`

- `evidence_id BIGINT UNSIGNED PK AI`
- `claim_id BIGINT UNSIGNED FK`
- `storage_key VARCHAR(500) NOT NULL` (private storage)
- `original_filename VARCHAR(255)` (sanitize)
- `mime_type VARCHAR(100)`, `file_size BIGINT UNSIGNED`
- `uploaded_by BIGINT UNSIGNED FK users`
- `created_at DATETIME`

### 6.2.11 `ai_reviews`

- `ai_review_id BIGINT UNSIGNED PK AI`
- `claim_id BIGINT UNSIGNED FK`
- `review_type ENUM('OWNERSHIP','IMAGE_MATCH','OTHER')`
- `result_label ENUM('CONSISTENT','PARTIAL','CONFLICTING','INSUFFICIENT') NULL`
- `score DECIMAL(6,2) NULL`
- `summary TEXT NULL`, `details JSON NULL`
- `model_name VARCHAR(120)`, `model_version VARCHAR(80)`
- `created_at DATETIME`

### 6.2.12 `claim_events`

- `event_id BIGINT UNSIGNED PK AI`
- `claim_id BIGINT UNSIGNED FK`
- `actor_user_id BIGINT UNSIGNED FK users NULL` (NULL for system)
- `event_type VARCHAR(80)`
- `from_status VARCHAR(40) NULL`, `to_status VARCHAR(40) NULL`
- `note TEXT NULL` (no secrets)
- `created_at DATETIME`

### 6.2.13 `found_cash_details`

- `cash_detail_id BIGINT UNSIGNED PK AI`
- `report_id BIGINT UNSIGNED FK UNIQUE`
- `amount_encrypted BLOB NOT NULL`
- `currency CHAR(3) DEFAULT 'THB'`
- `private_location_encrypted BLOB NULL`
- `private_time_encrypted BLOB NULL`
- `custody_status ENUM('WITH_FINDER','WITH_STAFF','RETURNED','UNDER_REVIEW')`
- `custodian_user_id BIGINT UNSIGNED FK users NULL`
- `received_by_staff_id BIGINT UNSIGNED FK users NULL`
- `received_at DATETIME NULL`, `returned_at DATETIME NULL`, `created_at DATETIME`
- Amount/location/time never appear in Public API

### 6.2.14 `notifications`

- `notification_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK`
- `type VARCHAR(80)`, `title VARCHAR(180)`, `message VARCHAR(500)` (no secrets)
- `target_type VARCHAR(50) NULL`, `target_id BIGINT UNSIGNED NULL`
- `is_read BOOLEAN DEFAULT FALSE`, `read_at DATETIME NULL`, `created_at DATETIME`

### 6.2.15 `user_sessions`

- `session_record_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK`
- `session_hash CHAR(64)` (never raw session ID)
- `ip_address VARCHAR(45)`, `user_agent VARCHAR(500)`, `device_label VARCHAR(150) NULL`
- `last_seen_at DATETIME`, `expires_at DATETIME`, `revoked_at DATETIME NULL`, `created_at DATETIME`

### 6.2.16 `remember_tokens`

- `remember_token_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK`
- `selector VARCHAR(32) UNIQUE`
- `token_hash CHAR(64)` (hash only)
- `device_label VARCHAR(150) NULL`
- `expires_at DATETIME`, `last_used_at DATETIME NULL`, `revoked_at DATETIME NULL`, `created_at DATETIME`

### 6.2.17 `activity_logs`

- `log_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK NULL`
- `action VARCHAR(100)`, `category VARCHAR(80)`, `timestamp DATETIME`
- `ip_address VARCHAR(45)`, `user_agent VARCHAR(500)`, `session_ref VARCHAR(100)` (hashed/reference)
- `result VARCHAR(40)`, `metadata JSON NULL`, `risk_level ENUM('LOW','MEDIUM','HIGH','CRITICAL') NULL`
- Append-only; no password/token/secret/evidence contents/PII excess

### 6.2.18 `security_alerts`

- `alert_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK NULL`
- `alert_type VARCHAR(100)`, `severity ENUM('LOW','MEDIUM','HIGH','CRITICAL')`
- `description TEXT`, `related_log_ids JSON NULL`
- `status ENUM('OPEN','UNDER_REVIEW','RESOLVED','DISMISSED') DEFAULT 'OPEN'`
- `assigned_admin_id BIGINT UNSIGNED FK users NULL`
- `created_at DATETIME`, `resolved_at DATETIME NULL`

### 6.2.19 `risk_scores`

- `risk_score_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK`
- `score INT`, `signals JSON`, `calculated_at DATETIME`, `window_start DATETIME`, `window_end DATETIME`
- Example signals: Claim frequency +20, multiple claims +15, rejected claims +20, wrong answers +15, login failures +20, unauthorized API +30
- Threshold example: 0–19 Normal, 20–39 Monitor, 40–59 Review, 60+ High Risk
- Risk score is a signal only; never auto-ban/reject

### 6.2.20 `admin_reviews`

- `admin_review_id BIGINT UNSIGNED PK AI`
- `admin_user_id BIGINT UNSIGNED FK users`
- `target_type VARCHAR(60)`, `target_id BIGINT UNSIGNED`
- `decision VARCHAR(60)`, `reason TEXT`, `created_at DATETIME`

### 6.2.21 `admin_audit_logs`

- `audit_id BIGINT UNSIGNED PK AI`
- `admin_user_id BIGINT UNSIGNED FK users`
- `action VARCHAR(100)`, `target_type VARCHAR(60)`, `target_id BIGINT UNSIGNED NULL`
- `before_data JSON NULL`, `after_data JSON NULL` (redact secrets/PII)
- `ip_address VARCHAR(45)`, `user_agent VARCHAR(500)`, `created_at DATETIME`
- Append-only; restrict access; correction creates a new entry

### 6.2.22 `system_settings`

- `setting_id BIGINT UNSIGNED PK AI`
- `setting_key VARCHAR(120) UNIQUE`
- `setting_value JSON`
- `description VARCHAR(255)`, `updated_by BIGINT UNSIGNED FK users`, `updated_at DATETIME`
- Never store API secrets/private keys as plaintext here

### 6.2.23 `system_backups` (Optional)

- `backup_id BIGINT UNSIGNED PK AI`
- `storage_key VARCHAR(500)`, `backup_type VARCHAR(50)`, `status VARCHAR(40)`
- `file_size BIGINT UNSIGNED`, `created_by BIGINT UNSIGNED FK users`
- `created_at DATETIME`, `completed_at DATETIME NULL`

### 6.2.24 `password_reset_tokens`

- `reset_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK`
- `token_hash CHAR(64)`, `expires_at DATETIME`, `used_at DATETIME NULL`, `created_at DATETIME`

### 6.2.25 `admin_mfa`

- `admin_mfa_id BIGINT UNSIGNED PK AI`
- `user_id BIGINT UNSIGNED FK UNIQUE` (Admin only)
- `secret_encrypted BLOB`
- `enabled_at DATETIME NULL`
- `recovery_codes_hash JSON` (hashes only)
- `created_at DATETIME`

### 6.2.26 `returns`

- `return_id BIGINT UNSIGNED PK AI`
- `claim_id BIGINT UNSIGNED FK UNIQUE`
- `scheduled_at DATETIME NULL`, `location VARCHAR(255) NULL`
- `handed_over_by BIGINT UNSIGNED FK users NULL`
- `received_by BIGINT UNSIGNED FK users NULL`
- `completed_at DATETIME NULL`, `handover_note TEXT NULL`
- `created_by BIGINT UNSIGNED FK users`, `created_at DATETIME`, `updated_at DATETIME`

## 6.3 Relationships

- Institution 1:N Users, Categories, Reports
- User 1:N Reports, Claims (claimant), Notifications, Sessions, Remember Tokens, Activity Logs, Security Alerts, Risk Scores
- Category 1:N Reports
- Report 1:N Report Images; Report 1:0..1 Ownership Secret; Report 1:N Claims
- Lost Report ↔ Found Report ผ่าน Matches
- Claim 1:N Claim Answers, Claim Evidence, AI Reviews, Claim Events; Claim 1:0..1 Return
- Report 1:0..1 Found Cash Details
- Admin User 1:N Admin Reviews และ Admin Audit Logs

## 6.4 DB Delivery

- `database/schema.sql`, `database/seed.sql`, migrations และ `docs/erd.md` หรือ `docs/erd.mmd`
- Seed categories และข้อมูลทดสอบเท่านั้น
- ห้าม Seed Admin ด้วยรหัสผ่านง่ายใน Production; สร้าง Admin คนแรกผ่าน CLI/Installer ที่ Hash Password และบังคับ MFA
- ใช้ Transaction สำหรับ Claim Approval, Role Change, Handover, Cash Custody
- Index ตาม Query จริงและใช้ Migration สำหรับ Schema Changes

---

# 7. API Specification

## 7.1 Conventions

Base URL Path: `/api/v1`. JSON request/response ยกเว้น Upload ใช้ `multipart/form-data`. Timestamp เป็น ISO 8601 UTC. Validate ทุก Input. Cookie Session ที่เปลี่ยนข้อมูลต้องมี CSRF. ทุก Endpoint ตรวจ Authorization ฝั่ง Server. ห้ามเชื่อ `user_id`, `permission_role`, `status`, `institution_id` จาก Client โดยไม่ตรวจ. Pagination มี Limit สูงสุด. ห้ามส่ง Stack Trace/SQL/Secret ใน Error

Success:
```json
{
  "success": true,
  "message": "ดำเนินการสำเร็จ",
  "data": {},
  "meta": {}
}
```

Error:
```json
{
  "success": false,
  "message": "ไม่สามารถดำเนินการได้",
  "errors": {"field": ["รายละเอียดข้อผิดพลาด"]},
  "code": "VALIDATION_ERROR"
}
```

HTTP: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthenticated, 403 Forbidden, 404 Not Found, 409 Conflict, 422 Validation Error, 429 Rate Limited, 500 Internal Error, 503 Dependency Unavailable

## 7.2 Authentication APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | สมัครสมาชิก |
| POST | `/auth/login` | Public | Login |
| POST | `/auth/logout` | Authenticated | Logout |
| GET | `/auth/me` | Authenticated | Current User |
| POST | `/auth/remember/revoke` | Authenticated | Revoke Remember Tokens |
| POST | `/auth/logout-all` | Authenticated | Logout ทุกอุปกรณ์ |
| GET | `/auth/sessions` | Authenticated | ดู Sessions |
| DELETE | `/auth/sessions/{sessionId}` | Owner/Admin | Revoke Session |
| POST | `/auth/forgot-password` | Public | ขอ Reset |
| POST | `/auth/reset-password` | Valid Reset Token | ตั้งรหัสใหม่ |
| POST | `/auth/admin/mfa/verify` | Admin pending MFA | Verify MFA |
| POST | `/auth/admin/mfa/enable` | Admin | Enable MFA |
| POST | `/auth/admin/mfa/disable` | Admin + Re-auth | Disable MFA ตาม Policy |

Register body:
```json
{
  "first_name": "สมชาย",
  "last_name": "ใจดี",
  "nickname": "ชาย",
  "email": "user@example.com",
  "student_code": "01234",
  "phone": "0812345678",
  "member_type": "STUDENT",
  "password": "example-password",
  "password_confirmation": "example-password"
}
```
Backend sets `permission_role=MEMBER` and `verification_status=PENDING`. STUDENT requires 5-digit student_code; TEACHER/STAFF must omit/null it.

Login body:
```json
{"email":"user@example.com","password":"example-password","remember_me":true}
```
Phone Login is not supported.

## 7.3 Profile APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/profile` | Authenticated | ดู Profile |
| PATCH | `/profile` | Verified Member/Admin | แก้ข้อมูลที่อนุญาต |
| POST | `/profile/change-password` | Authenticated | เปลี่ยนรหัสผ่าน |
| GET | `/profile/preferences` | Authenticated | อ่าน Preferences |
| PATCH | `/profile/preferences` | Authenticated | Theme/Preferences |

ห้ามแก้ Role หรือ Verification Status ผ่าน Profile API

## 7.4 Category APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/categories` | Public/Authenticated | หมวดหมู่ Active |
| POST | `/admin/categories` | Admin | สร้าง |
| PATCH | `/admin/categories/{id}` | Admin | แก้ |
| DELETE | `/admin/categories/{id}` | Admin | ปิดใช้งาน/ลบตาม FK |

## 7.5 Report APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/reports` | Public/Authenticated | Search Public Reports |
| GET | `/reports/{id}` | Public/Authenticated | Public Detail |
| POST | `/reports/lost` | Verified Member | Create Lost |
| POST | `/reports/found` | Verified Member | Create Found |
| PATCH | `/reports/{id}` | Owner/Admin | Edit ตามสถานะ |
| POST | `/reports/{id}/close` | Owner/Admin | Close |
| GET | `/my/reports` | Authenticated | My Reports |
| POST | `/reports/{id}/images` | Owner/Admin | Upload Image |
| DELETE | `/reports/{id}/images/{imageId}` | Owner/Admin | Remove Image |

`GET /reports` query: `type=LOST|FOUND`, `q`, `category_id`, `color`, `brand`, `location`, `date_from`, `date_to`, `status` (allowed public statuses), `sort=latest|oldest|relevance`, `page`, `per_page`.

Public response fields only: report_id, report_type, title, category, allowed color/brand, public_description, location_text, occurred_at, public images, status. Never return ownership secrets, cash amount, encrypted payload, private location/time, claim answers, evidence storage path.

## 7.6 Matching APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/reports/{id}/matches` | Owner/Admin by policy | Match Candidates |
| POST | `/matching/run` | System/Admin | Trigger Matching |
| GET | `/admin/matches` | Admin | Matching Queue |
| PATCH | `/admin/matches/{id}` | Admin | Confirm/Dismiss |

Check LOST/FOUND pairing and same institution; calculate Rule Score; optionally call Image Matching; calculate Hybrid Score; save Algorithm Version. Never expose secrets.

## 7.7 Claim APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| POST | `/reports/{id}/claims` | Verified Member | Submit Claim |
| GET | `/my/claims` | Authenticated | My Claims |
| GET | `/claims/{id}` | Claim Owner/Admin | Claim Detail |
| POST | `/claims/{id}/answers` | Claim Owner | Submit Answers |
| POST | `/claims/{id}/evidence` | Claim Owner | Upload Evidence |
| POST | `/claims/{id}/cancel` | Claim Owner, allowed state | Cancel |
| POST | `/claims/{id}/more-info` | Claim Owner, requested state | Additional Info |

Claim body example:
```json
{
  "claimant_description": "ฉันคิดว่าเป็นของฉัน เพราะ...",
  "answers": [
    {"question_key":"q1","answer":"รายละเอียดคำตอบ"}
  ]
}
```

Questions must not reveal correct answers. Encrypt answers, enforce attempt limit and rate limit. User sees only own Claim; Admin access is audited.

## 7.8 Admin Claim Review APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/claims` | Admin | Claim Queue |
| GET | `/admin/claims/{id}` | Admin | Detail |
| POST | `/admin/claims/{id}/approve` | Admin | Approve |
| POST | `/admin/claims/{id}/reject` | Admin | Reject |
| POST | `/admin/claims/{id}/request-info` | Admin | Request More Info |
| POST | `/admin/claims/{id}/review-ai` | Admin/System | AI Review |

Every decision validates current state and authorization, writes Claim Event, Admin Review and Audit Log, and uses a transaction. AI score must never auto-approve/reject.

## 7.9 Cash Recovery APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| POST | `/reports/found-cash` | Verified Member | Create Cash Found Report |
| POST | `/reports/{id}/cash-claim` | Verified Member | Claim Cash |
| GET | `/admin/cash-cases` | Admin | Cash Queue |
| GET | `/admin/cash-cases/{id}` | Admin | Private Cash Detail |
| POST | `/admin/cash-cases/{id}/custody` | Admin | Record Custody |
| POST | `/admin/cash-cases/{id}/return` | Admin | Record Return |

Public API never returns amount/private data. Multiple claimants require Admin review.

## 7.10 Return APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| POST | `/admin/returns` | Admin | Schedule Handover |
| GET | `/admin/returns` | Admin | List |
| GET | `/admin/returns/{id}` | Admin | Detail |
| PATCH | `/admin/returns/{id}` | Admin | Update Schedule |
| POST | `/admin/returns/{id}/complete` | Admin | Complete Handover |

Complete atomically updates Claim to COMPLETED and Report to RETURNED, records events/logs/audit.

## 7.11 Notification APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/notifications` | Authenticated | Own Notifications |
| PATCH | `/notifications/{id}/read` | Owner | Mark Read |
| POST | `/notifications/read-all` | Authenticated | Mark All Read |
| POST | `/admin/notifications` | Admin | Send Notification |
| GET | `/admin/notifications` | Admin | Delivery History |

## 7.12 Admin User APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/users` | Admin | Search Users |
| GET | `/admin/users/{id}` | Admin | User Detail |
| POST | `/admin/users/{id}/approve` | Admin | Verify |
| POST | `/admin/users/{id}/reject` | Admin | Reject |
| POST | `/admin/users/{id}/suspend` | Admin | Suspend |
| POST | `/admin/users/{id}/unsuspend` | Admin | Unsuspend |
| PATCH | `/admin/users/{id}/role` | Admin | MEMBER/ADMIN Role Change |

Role Change requires last-admin protection, re-auth for sensitive action and Audit. Never accept Role from ordinary profile endpoint.

## 7.13 Security & Activity APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/security/overview` | Admin | Overview |
| GET | `/admin/security/alerts` | Admin | Alerts |
| GET | `/admin/security/alerts/{id}` | Admin | Alert Detail |
| POST | `/admin/security/alerts/{id}/review` | Admin | Record Review |
| GET | `/admin/security/risk-scores` | Admin | Risk Scores |
| GET | `/admin/activity-logs` | Admin | Activity Logs |
| GET | `/admin/audit-logs` | Admin | Admin Audit Logs |

Member cannot access internal logs.

## 7.14 System Settings APIs

| Method | Endpoint | Permission | Purpose |
|---|---|---|---|
| GET | `/admin/settings` | Admin | Read Settings |
| PATCH | `/admin/settings` | Admin | Update Settings |
| GET | `/admin/maintenance/health` | Admin | Health |
| GET | `/admin/maintenance/backups` | Admin | Backup Status |
| POST | `/admin/maintenance/backups` | Admin | Create Backup |

Validate each setting by schema and create Audit Log. Never store plaintext API secrets.

---

# 8. AI Service Specification

## 8.1 Architecture

PHP Backend เป็น Modular Monolith. AI Service เป็น Python + FastAPI แยกเมื่อจำเป็น ติดต่อผ่าน Internal API ที่มี Service Authentication. ไม่เริ่ม Microservices หลายตัวโดยไม่จำเป็น

## 8.2 Image Matching Flow

1. Backend validate image and store in private storage
2. Backend sends image/reference securely to AI Service
3. AI Service creates Image Embedding
4. Similarity search finds candidates
5. Return similarity score
6. Backend combines Rule Score + Image Score
7. Save Match and Model/Algorithm Version

AI Service must not expose private images publicly.

## 8.3 Ownership Review

Input: minimum authorized Claim data, private reference data decrypted securely by Backend, claimant answers, authorized evidence metadata/content.
Output: label `CONSISTENT` / `PARTIAL` / `CONFLICTING` / `INSUFFICIENT`, summary, optional confidence and non-secret signals.

AI is advisory only. Admin decides. No secrets in logs. Save model version. If AI service is unavailable, Claim remains available for Admin Review.

---

# 9. Activity Logs & Suspicious Behavior

## 9.1 Events to Log

- Authentication: login/logout, failed login, password reset, MFA events
- Account: register, profile update, verification status change
- Report: create/update/close lost/found, image upload/delete
- Claim: submit/cancel, answer questions, evidence upload, Admin decisions
- Admin: approve/reject user, suspend/unsuspend, role changes, settings, cash custody/return, status changes
- Security: suspicious access, unauthorized API access, repeated failures, new device signals

## 9.2 Never Log

Password, Cookie/Remember Token plaintext, secret answers, private ownership payload, evidence contents, API Keys, Encryption Keys, unnecessary PII.

## 9.3 Suspicious Signals

Examples: 3 claims/10 minutes, 5 claims/hour, many claims, repeated rejected claims, wrong ownership answers, repeated login failures, many new devices in short time, unauthorized API access, unusual Admin actions. Shared school IP/device is only a signal because many users may share network; never assume same person.

Example risk weights: claim frequency +20, multiple claims +15, rejected claims +20, wrong answers +15, login failures +20, unauthorized API +30. Threshold: 0–19 Normal, 20–39 Monitor, 40–59 Review, 60+ High Risk. These are examples/configurable signals, not proof of abuse.

Workflow: `Log Event → Detection Rules → Security Alert → Admin Notification → Admin Review → Record Outcome`.

---

# 10. Security Requirements

1. `password_hash()` / `password_verify()`
2. PDO Prepared Statements
3. CSRF Protection
4. Output escaping / XSS prevention
5. Server-side validation
6. Authorization checks on every API and resource (prevent IDOR)
7. Rate limiting for Login, Register, Claims, Reset, Upload
8. File MIME/content/size validation; random storage names
9. Private file storage outside public web root
10. Encrypt Ownership Secrets, Claim Answers and Cash Details at application layer
11. Encryption Key stored outside DB
12. Secure Cookie flags and Session ID rotation
13. Remember Token hash, rotation and revocation
14. Admin MFA and re-authentication for sensitive actions
15. Append-only Activity/Audit Logs
16. Last Admin protection
17. Transactions for multi-step workflows
18. Safe error responses without SQL/stack trace/secrets
19. HTTPS in Production
20. Environment variables/secret manager
21. Encrypted backups with restricted access
22. Risk/AI score cannot be sole basis for automatic ban/rejection

---

# 11. Recommended Project Structure

```text
FoundIt/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── account/
│   │   ├── pending.html
│   │   └── status.html
│   ├── dashboard.html
│   ├── lost-items.html
│   ├── found-items.html
│   ├── item-detail.html
│   ├── report-lost.html
│   ├── report-found.html
│   ├── my-reports.html
│   ├── my-claims.html
│   ├── claim-detail.html
│   ├── notifications.html
│   ├── profile.html
│   ├── admin/
│   │   ├── dashboard.html
│   │   ├── users.html
│   │   ├── reports.html
│   │   ├── claims.html
│   │   ├── ownership-verification.html
│   │   ├── cash-recovery.html
│   │   ├── returns.html
│   │   ├── matching.html
│   │   ├── security.html
│   │   ├── activity-logs.html
│   │   ├── notifications.html
│   │   ├── settings.html
│   │   ├── profile.html
│   │   └── maintenance.html
│   └── assets/{css,js,images,icons,fonts}/
├── backend/
│   ├── public/index.php
│   ├── config/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── models/
│   ├── repositories/
│   ├── middleware/
│   ├── validators/
│   ├── policies/
│   ├── utils/
│   └── storage/{private,temporary}/
├── ai-service/
│   ├── app/{main.py,routes/,services/,image_matching/,ownership_review/}
│   ├── tests/
│   └── requirements.txt
├── database/{migrations/,schema.sql,seed.sql}
├── docs/{erd.md,api.md,security.md,workflows.md}
├── tests/{backend/,integration/}
├── .env.example
├── .gitignore
└── README.md
```

This is a recommended starting structure. Agent may add subfolders with reason, but must keep private storage outside public web root. Frontend HTML/CSS/JS, Backend PHP REST API, Database MySQL, AI Python/FastAPI when useful.

---

# 12. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | PHP REST API |
| Database | MySQL 8.x |
| DB Access | PDO |
| AI Service | Python + FastAPI |
| Image Matching | Image Embeddings + Similarity Search |
| Authentication | PHP Session + Remember Token |
| UI Font | Anuphan |
| Development | VS Code + AI Agent |
| Architecture | Modular Monolith + Optional AI Service |

Do not change the primary stack without user approval.

---

# 13. Development Roadmap

## Phase 1 — Foundation & Design System

- Inspect repository; set project structure
- Design tokens, typography, shared components
- Responsive shell, Light/Dark Mode
- Landing/Login/Register UI
- Acceptance: responsive all sizes, Thai UI, working theme toggle, reusable components and UI states

## Phase 2 — Database & Backend Foundation

- MySQL schema/migrations/seeds
- PDO connection, router, response format, error handling
- Validation and Authorization middleware
- Acceptance: schema imports, constraints/indexes work, consistent API errors, no secrets in repo

## Phase 3 — Authentication & Account

- Register/Login/Logout, Pending Verification, Admin Approval
- Remember Me, Sessions, Password Reset, Admin MFA
- Acceptance: Email-only login, phone never login, password hash only, session rotation, token hash, Pending cannot use core features

## Phase 4 — Reports

- Lost/Found, private image upload, My Reports, Detail, Search/Filter, status rules
- Acceptance: permission checks, no private data leakage, upload validation, search works

## Phase 5 — Rule-based Matching

- Matching service, feature weights, candidate ranking, Admin review
- Acceptance: explainable score, not presented as proof, algorithm version saved

## Phase 6 — AI Image Matching

- FastAPI, embeddings, similarity search, hybrid score, failure handling
- Acceptance: core app still works if AI unavailable, no Chat AI call per pair, model version stored, private images protected

## Phase 7 — Claim System

- Submit Claim, attempt limit, answers, evidence, events, notifications
- Acceptance: users see only own claims, answers protected, rate limit works

## Phase 8 — Ownership Verification

- Secret question generation, answer evaluation, evidence review, AI advisory, Admin decision
- Acceptance: AI never final decision, Admin has adequate review information, audit trail exists

## Phase 9 — Cash Recovery

- Private cash data, cash claim, matching, custody and return
- Acceptance: public never sees amount, multiple claimants reviewed by Admin, custody history recorded

## Phase 10 — Admin Control Center

- Overview, Users, Reports, Claims, Returns, Matching, Security, Logs, Settings
- Acceptance: every Admin action audited, last Admin protected, permissions enforced

## Phase 11 — Security & Quality

- CSRF/XSS/SQLi, IDOR, rate limit, upload, session/token, authorization, backup/restore, responsive/accessibility tests

## Phase 12 — Deployment

- Production config, HTTPS, secrets, migrations, private storage, backups, monitoring, deployment README

---

# 14. Testing Requirements

## Authentication

- Valid registration
- Duplicate Email (including case differences)
- Student Code not 5 digits/duplicate
- Teacher/Staff with Student Code
- Phone not 10 digits or containing letters
- Password confirmation mismatch
- Email Login success; Phone Login unsupported
- Remember token expiry/revocation
- Logout all devices
- Session fixation and CSRF tests

## Authorization

- Member accessing Admin API → 403
- Pending user creating report → 403
- User editing another user's report → 403
- User viewing another user's claim → 403
- User reading ownership secret → 403
- Member reading internal logs → 403
- Last Admin role removal/suspension blocked

## Reports & Matching

- Create Lost/Found
- Invalid/oversized upload
- Search/filter
- Match candidate creation
- No cross-institution matching
- Score not represented as proof

## Claims

- Submit, attempt limit, answers, evidence, more-info, approve/reject
- Invalid State Transition blocked
- AI unavailable fallback to Admin Review
- Admin decision audit

## Cash

- Public API omits amount
- Secret amount encrypted
- Multiple claimants reviewed
- Custody/return recorded
- Exact match never auto-approves

## Security

- SQL Injection, XSS, CSRF, IDOR, brute force
- Session hijacking mitigations
- File upload attack
- Sensitive data leakage
- Secret in logs
- Admin privilege escalation

---

# 15. Definition of Done

A feature is complete only when:
1. UI works, not just mockup
2. Responsive
3. Has appropriate Loading/Empty/Error/Success states
4. Connected to real Backend API
5. Backend validation implemented
6. Server-side authorization implemented
7. DB constraints/transactions appropriate
8. Error handling implemented
9. Happy-path and failure-path tests pass
10. No private data leakage
11. Required Activity/Audit Logs recorded
12. Documentation updated
13. README explains run/test steps

---

# 16. Environment Configuration

Create `.env.example` with placeholders only:

```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=foundit
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

SESSION_SECURE_COOKIE=false
REMEMBER_TOKEN_DAYS=30

APP_ENCRYPTION_KEY=replace_with_secure_random_key
AI_SERVICE_URL=http://127.0.0.1:8001
AI_SERVICE_TOKEN=replace_with_internal_service_token
```

`.env` must be in `.gitignore`. Production: `APP_DEBUG=false`, HTTPS and Secure Cookies. Generate Encryption Key cryptographically; never use placeholders in Production.

---

# 17. Seed Data

Allowed: common categories such as อุปกรณ์การเรียน, อุปกรณ์อิเล็กทรอนิกส์, กระเป๋า, เสื้อผ้า, เครื่องประดับ, เอกสาร, เงินสด, อื่น ๆ; development institution; synthetic test data.

Forbidden: weak default Admin password in Production, real student/teacher data without permission, real secrets/tokens in seed.

---

# 18. Implementation Decisions / Open Points

These details are not fully locked. Agent must keep them separate from locked business rules and request approval before any decision changes user-visible policy:

1. Email Verification: phone OTP is explicitly not required. Email verification flow was not fully specified; propose before enabling.
2. Password Policy: choose sensible minimum length/strength and communicate it in UI.
3. Image Storage: choose Local Private Storage for MVP or private Object Storage.
4. Embedding Store: select a suitable vector store/database after estimating data volume; avoid unnecessary infrastructure initially.
5. AI Provider: not locked; use Adapter so provider can change.
6. Email Delivery: choose SMTP/provider for password reset and email notifications.
7. Admin MFA: choose TOTP or standard method and recovery process.
8. Institution Assignment: MVP is one school; define secure account-to-school assignment.
9. Report Retention: define retention with school policy and privacy requirements.
10. Privacy/Consent: prepare privacy notice and consent before Production.
11. Admin Bootstrap: define secure CLI/Installer for first Admin.
12. Exact Locations: text locations for MVP; map/coordinates require approval as a separate feature.

Do not treat these open points as permission to change locked Business Rules.

---

# 19. First Task for AI Agent

When this repository and spec are provided:

1. Read this entire `spec.md`.
2. Inspect the current repository and existing files before changing anything.
3. Report current structure, existing features, missing features, and conflicts with this spec.
4. Propose a phased implementation plan with testable tasks.
5. Start with **Phase 1: Foundation & Design System** after presenting the plan.
6. Do not attempt to build all features in one pass.
7. Do not modify the locked spec without explicit user instruction.
8. At the end of each phase, report changed files, run instructions, and test results.

**Final Goal:** Build FoundIt as a real, secure school Lost & Found platform with modern youthful UX, AI-assisted matching, ownership verification, cash recovery, Admin Control Center, security monitoring, and a complete return workflow.
