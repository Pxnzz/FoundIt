'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
const themeButton = $('.theme-toggle');
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
let savedTheme = null;
try {
  const stored = localStorage.getItem('foundit-theme');
  if (stored === 'light' || stored === 'dark') savedTheme = stored;
} catch { /* Theme still works when browser storage is unavailable. */ }

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', dark ? 'เปลี่ยนเป็นโหมดสว่าง' : 'เปลี่ยนเป็นโหมดมืด');
  $('meta[name="theme-color"]').content = dark ? '#14131D' : '#F7F7FB';
}
applyTheme(savedTheme || (systemTheme.matches ? 'dark' : 'light'));
themeButton.addEventListener('click', () => {
  savedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(savedTheme);
  try { localStorage.setItem('foundit-theme', savedTheme); } catch { /* No persistence required. */ }
});
systemTheme.addEventListener('change', (event) => {
  if (!savedTheme) applyTheme(event.matches ? 'dark' : 'light');
});

const loginForm = $('#login-form');
const registerForm = $('#register-form');
const fieldsets = $$('[data-step]', registerForm);
const progressSteps = $$('.form-progress li');
const memberLabels = { STUDENT: 'นักเรียน', TEACHER: 'ครู', STAFF: 'บุคลากรอื่น' };
let step = 1;
let currentView = null;

function clearMessage(id) {
  const message = $(id);
  message.hidden = true;
  message.textContent = '';
}
function showMessage(id, text) {
  const message = $(id);
  message.textContent = text;
  message.hidden = false;
  message.focus();
}
function setError(input, text) {
  if (!input.closest('.field')) return;
  let error = document.getElementById(`${input.id}-error`);
  if (!error) {
    error = document.createElement('small');
    error.id = `${input.id}-error`;
    error.className = 'field-error';
    input.closest('.field').append(error);
    const describedBy = input.getAttribute('aria-describedby');
    input.setAttribute('aria-describedby', [describedBy, error.id].filter(Boolean).join(' '));
  }
  if (error) error.textContent = text;
  if (text) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}
function resetForm(form) {
  form.reset();
  $$('input, select', form).forEach((input) => setError(input, ''));
  $$('.password-wrap button[data-password]', form).forEach((button) => {
    document.getElementById(button.dataset.password).type = 'password';
    button.textContent = 'แสดง';
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-label', button.dataset.password === 'password-confirmation' ? 'แสดงรหัสผ่านยืนยัน' : 'แสดงรหัสผ่าน');
  });
  $$('.form-message', form).forEach((message) => { message.hidden = true; message.textContent = ''; });
}
function syncStudentField() {
  const student = $('#member-type').value === 'STUDENT';
  const input = $('#student-code');
  $('#student-field').hidden = !student;
  input.disabled = !student;
  input.required = student;
  if (!student) { input.value = ''; setError(input, ''); }
}
function buildReview() {
  const value = (name) => registerForm.elements.namedItem(name).value.trim();
  const rows = [
    ['ชื่อจริง', value('first_name')], ['นามสกุล', value('last_name')],
    ['ชื่อเล่น', value('nickname')], ['ประเภทสมาชิก', memberLabels[value('member_type')]],
    ['อีเมล', value('email')], ['เบอร์โทรศัพท์', value('phone')]
  ];
  if (value('member_type') === 'STUDENT') rows.push(['รหัสนักเรียน', value('student_code')]);
  rows.push(['รหัสผ่าน', 'ตั้งค่าแล้วในแบบฟอร์มนี้ · ไม่แสดงรหัสผ่าน']);
  const review = $('#register-summary');
  review.replaceChildren();
  rows.forEach(([label, content]) => {
    const row = document.createElement('div');
    row.className = 'review-row';
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = content;
    row.append(term, description);
    review.append(row);
  });
}
function showStep(next, focus = true) {
  step = next;
  clearMessage('#register-message');
  fieldsets.forEach((fieldset, index) => {
    fieldset.hidden = index + 1 !== step;
    fieldset.disabled = index + 1 !== step;
  });
  progressSteps.forEach((item, index) => {
    item.classList.toggle('complete', index + 1 < step);
    if (index + 1 === step) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
    $('span', item).textContent = index + 1 < step ? '✓' : String(index + 1);
  });
  syncStudentField();
  $('#previous-step').hidden = step === 1;
  const nextButton = $('#next-step');
  nextButton.textContent = step === 4 ? 'สมัครสมาชิก (ยังไม่เปิดใช้งาน)' : 'ถัดไป →';
  if (step === 4) buildReview();
  if (focus) $('legend', fieldsets[step - 1]).focus();
}

function renderRoute() {
  if (location.hash === '#main') { $('#main').focus(); return; }
  const route = location.hash || '#/';
  const known = ['#/', '#/explore', '#/how', '#/login', '#/register'];
  const active = known.includes(route) ? route.slice(2) || 'home' : 'home';
  if (!known.includes(route)) history.replaceState(null, '', '#/');
  const view = active === 'login' || active === 'register' ? active : 'home';
  if (currentView && currentView !== view) {
    // Keep personal data only in the current form, never in storage or another view.
    if (currentView === 'login') resetForm(loginForm);
    if (currentView === 'register') {
      resetForm(registerForm);
      $('#register-summary').replaceChildren();
      showStep(1, false);
    }
  }
  ['home', 'login', 'register'].forEach((name) => { $(`#${name}-view`).hidden = name !== view; });
  $$('nav a').forEach((link) => {
    if (link.getAttribute('href') === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const titles = { home: 'ของหาย มีทางกลับมา', login: 'เข้าสู่ระบบ', register: 'สมัครสมาชิก', explore: 'ค้นหาสิ่งของ', how: 'วิธีใช้งาน' };
  document.title = `FoundIt — ${titles[active]}`;
  currentView = view;
  const target = active === 'explore' ? $('#search-title') : active === 'how' ? $('#how-title') : $(`#${view}-title`);
  target.focus({ preventScroll: true });
  if (active === 'explore' || active === 'how') target.scrollIntoView({ block: 'start' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('hashchange', renderRoute);
showStep(1, false);
renderRoute();

$$('.password-wrap button[data-password]').forEach((button) => {
  button.addEventListener('click', () => {
    const input = document.getElementById(button.dataset.password);
    const visible = input.type === 'password';
    input.type = visible ? 'text' : 'password';
    button.textContent = visible ? 'ซ่อน' : 'แสดง';
    button.setAttribute('aria-pressed', String(visible));
    const suffix = input.id === 'password-confirmation' ? 'รหัสผ่านยืนยัน' : 'รหัสผ่าน';
    button.setAttribute('aria-label', `${visible ? 'ซ่อน' : 'แสดง'}${suffix}`);
  });
});
$('#member-type').addEventListener('change', syncStudentField);

function validateInput(input) {
  if (input.disabled || !input.required) return '';
  const password = input.type === 'password' || input.name === 'password' || input.name === 'password_confirmation';
  const value = password ? input.value : input.value.trim();
  if (!value) return 'กรุณากรอกข้อมูลช่องนี้';
  if (input.type === 'email' && (!input.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) return 'กรุณากรอกอีเมลให้ถูกต้อง เช่น name@example.com';
  if (input.name === 'phone' && !/^[0-9]{10}$/.test(value)) return 'กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 10 หลัก';
  if (input.name === 'student_code' && !/^[0-9]{5}$/.test(value)) return 'กรุณากรอกรหัสนักเรียนเป็นตัวเลข 5 หลัก';
  if (input.name === 'member_type' && !Object.hasOwn(memberLabels, value)) return 'กรุณาเลือกประเภทสมาชิก';
  if (input.form === registerForm && input.name === 'password' && Array.from(value).length < 12) return 'กรุณาใช้รหัสผ่านอย่างน้อย 12 ตัวอักษร (เกณฑ์ชั่วคราวของ UI)';
  if (input.name === 'password_confirmation' && input.value !== $('#register-password').value) return 'รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง';
  if (input.maxLength > 0 && value.length > input.maxLength) return `กรุณากรอกไม่เกิน ${input.maxLength} ตัวอักษร`;
  return '';
}
function validateGroup(root) {
  let firstInvalid = null;
  $$('input, select', root).forEach((input) => {
    if (!input.disabled && input.type !== 'checkbox') {
      if (input.type === 'email') input.value = input.value.trim().toLowerCase();
      else if (['first_name', 'last_name', 'nickname'].includes(input.name)) input.value = input.value.trim();
      const error = validateInput(input);
      setError(input, error);
      if (error && !firstInvalid) firstInvalid = input;
    }
  });
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}
[loginForm, registerForm].forEach((form) => {
  form.addEventListener('input', (event) => {
    const input = event.target;
    if (input.matches('input, select') && input.hasAttribute('aria-invalid')) setError(input, validateInput(input));
    clearMessage(form === loginForm ? '#login-message' : '#register-message');
  });
});
loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearMessage('#login-message');
  if (!validateGroup(loginForm)) return;
  showMessage('#login-message', 'ยังเข้าสู่ระบบไม่ได้: ระบบยืนยันตัวตนยังไม่เชื่อมต่อใน Phase 1 ไม่มีการส่งอีเมลหรือรหัสผ่าน และไม่มีการสร้างเซสชัน');
});
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (step < 4) {
    if (validateGroup(fieldsets[step - 1])) showStep(step + 1);
    return;
  }
  showMessage('#register-message', 'ยังสมัครสมาชิกไม่ได้: ระบบบัญชียังไม่เชื่อมต่อใน Phase 1 ไม่มีการส่งข้อมูลหรือสร้างบัญชี ข้อมูลที่ตรวจสอบอยู่ในหน้านี้เท่านั้น');
});
$('#previous-step').addEventListener('click', () => { if (step > 1) showStep(step - 1); });

const searchForm = $('#search-form');
const searchHeading = $('#search-result strong');
const searchCopy = $('#search-result p');
let category = 'ทั้งหมด';
function updateSearch() {
  const query = $('#search-input').value.trim();
  searchHeading.textContent = 'ยังค้นหาประกาศจริงไม่ได้';
  searchCopy.textContent = `${query ? `คำค้น “${query}” · ` : ''}หมวดหมู่: ${category} — ยังไม่เชื่อมต่อระบบประกาศ จึงไม่สามารถสรุปได้ว่าพบหรือไม่พบสิ่งของ`;
}
searchForm.addEventListener('submit', (event) => {
  event.preventDefault();
  updateSearch();
});
$$('[data-category]').forEach((button) => {
  button.addEventListener('click', () => {
    category = button.dataset.category;
    $$('[data-category]').forEach((chip) => chip.setAttribute('aria-pressed', String(chip === button)));
    updateSearch();
  });
});

const info = {
  about: ['รู้จัก FoundIt', 'พื้นที่สำหรับแจ้งของหายและของที่พบภายในโรงเรียน เพื่อช่วยให้สิ่งของกลับไปหาเจ้าของอย่างปลอดภัย\n\nขณะนี้อยู่ใน Phase 1: หน้าแนะนำและแบบฟอร์ม UI เท่านั้น ระบบบัญชี ประกาศ การจับคู่ และการรับคืนยังไม่เปิดให้บริการ'],
  privacy: ['ความเป็นส่วนตัว เริ่มจากความใส่ใจ', 'อย่าใส่คำตอบลับ ลักษณะเฉพาะที่ใช้ยืนยันเจ้าของ จำนวนเงินจริง หรือหลักฐานส่วนตัวในรายละเอียดสาธารณะ\n\nPhase 1 ไม่ส่งแบบฟอร์มบัญชีไปเซิร์ฟเวอร์และไม่บันทึกข้อมูลบัญชีลง localStorage มีเพียงการตั้งค่าธีมที่จำไว้ในอุปกรณ์ ข้อมูลในแบบฟอร์มจะถูกล้างเมื่อออกจากหน้านั้น ทั้งนี้เบราว์เซอร์อาจเสนอการเติมข้อมูลอัตโนมัติตามการตั้งค่าของคุณ\n\nข้อความนี้เป็นแนวทางของ UI ยังไม่ใช่นโยบายความเป็นส่วนตัวฉบับใช้งานจริง ซึ่งต้องจัดทำก่อนเปิดบริการ'],
  contact: ['ติดต่อผู้ดูแล', 'ยังไม่ได้กำหนดช่องทางติดต่อผ่านระบบใน Phase 1 หากต้องการความช่วยเหลือเรื่องของหายหรือการส่งคืน กรุณาติดต่อเจ้าหน้าที่โรงเรียนโดยตรง อย่าส่งข้อมูลลับหรือหลักฐานส่วนตัวผ่านช่องทางสาธารณะ'],
  forgot: ['ยังไม่เชื่อมต่อการกู้รหัสผ่าน', 'ระบบกู้รหัสผ่านและการส่งอีเมลยังไม่เปิดใช้งานใน Phase 1 จึงยังขอลิงก์ตั้งรหัสผ่านใหม่ไม่ได้ ไม่มีการส่งอีเมล ตรวจสอบบัญชี หรือสร้างโทเคนจากหน้านี้']
};
const dialog = $('#info-dialog');
let dialogTrigger = null;
$('#privacy-button').dataset.info = 'privacy';
$('#forgot-button').dataset.info = 'forgot';
$$('[data-info]').forEach((button) => {
  button.addEventListener('click', () => {
    const [title, copy] = info[button.dataset.info];
    $('#dialog-title').textContent = title;
    $('#dialog-text').textContent = copy;
    dialogTrigger = button;
    dialog.showModal();
  });
});
$('#close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { if (dialogTrigger && !dialogTrigger.closest('[hidden]')) dialogTrigger.focus(); });
window.addEventListener('hashchange', () => { if (dialog.open) dialog.close(); });

const statusElement = $('#server-status');
const healthRetry = $('#retry-health');
async function checkHealth() {
  healthRetry.hidden = false;
  healthRetry.disabled = true;
  statusElement.textContent = 'กำลังตรวจสอบเซิร์ฟเวอร์…';
  statusElement.dataset.state = 'loading';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch('/api/health', { signal: controller.signal, cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error('Health check failed');
    const result = await response.json();
    if (result.status !== 'ok') throw new Error('Unexpected response');
    statusElement.textContent = 'เซิร์ฟเวอร์ตอบสนอง · ระบบบัญชียังไม่เชื่อมต่อ';
    statusElement.dataset.state = 'ok';
  } catch {
    statusElement.textContent = 'ติดต่อเซิร์ฟเวอร์ไม่ได้ · ลองตรวจอีกครั้ง';
    statusElement.dataset.state = 'error';
  } finally {
    clearTimeout(timeout);
    healthRetry.disabled = false;
  }
}
healthRetry.addEventListener('click', checkHealth);
// Clear transient credentials on page departure, including back-forward cache restores.
window.addEventListener('pagehide', () => {
  resetForm(loginForm);
  resetForm(registerForm);
  $('#register-summary').replaceChildren();
  showStep(1, false);
});
checkHealth();
