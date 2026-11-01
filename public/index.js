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
let session = null;
let sessionRequest = null;
let routeVersion = 0;
let listVersion = 0;
let selectedUserId = null;
let setupReady = false;
let logoutBusy = false;
let loginNotice = '';
const busyForms = new Set();
const accountForms = ['profile-form', 'password-form', 'mfa-confirm-form', 'mfa-verify-form', 'admin-review-form'].map((id) => document.getElementById(id));
const allForms = [loginForm, registerForm, ...accountForms];
const statusLabels = { PENDING: 'รอตรวจสอบ', VERIFIED: 'ยืนยันแล้ว', REJECTED: 'ถูกปฏิเสธ', SUSPENDED: 'ถูกระงับ' };

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
  $$('input, select, textarea', form).forEach((input) => setError(input, ''));
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
  nextButton.textContent = step === 4 ? 'ส่งสมัครสมาชิก →' : 'ถัดไป →';
  if (step === 4) buildReview();
  if (focus) $('legend', fieldsets[step - 1]).focus();
}

async function renderRoute() {
  if (location.hash === '#main') { $('#main').focus(); return; }
  const version = ++routeVersion;
  const known = ['#/', '#/explore', '#/how', '#/login', '#/register', '#/account', '#/admin'];
  const route = known.includes(location.hash) ? location.hash : '#/';
  if (location.hash !== route) history.replaceState(null, '', route);
  const active = route.slice(2) || 'home';
  const view = ['login', 'register', 'account', 'admin'].includes(active) ? active : 'home';
  if (currentView !== view) {
    clearPrivateViews();
    resetForm(loginForm);
    resetForm(registerForm);
    $('#register-summary').replaceChildren();
    showStep(1, false);
  }
  currentView = view;
  ['home', 'login', 'register', 'account', 'admin'].forEach((name) => { $(`#${name}-view`).hidden = name !== view; });
  $$('nav a').forEach((link) => {
    if (link.getAttribute('href') === route) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  const titles = { home: 'ของหาย มีทางกลับมา', login: 'เข้าสู่ระบบ', register: 'สมัครสมาชิก', explore: 'ค้นหาสิ่งของ', how: 'วิธีใช้งาน', account: 'บัญชีของฉัน', admin: 'ตรวจสอบสมาชิก' };
  document.title = `FoundIt — ${titles[active]}`;
  const target = active === 'explore' ? $('#search-title') : active === 'how' ? $('#how-title') : $(`#${view}-title`);
  target.focus({ preventScroll: true });
  if (active === 'explore' || active === 'how') target.scrollIntoView({ block: 'start' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
  if (view === 'account' || view === 'admin') {
    $('#account-content').hidden = true;
    $('#admin-content').hidden = true;
  }
  try {
    await refreshSession();
    if (version !== routeVersion) return;
    if (view === 'account') await loadAccount(version);
    if (view === 'admin') await loadAdminUsers();
    if (view === 'login' && loginNotice) {
      showMessage('#login-message', loginNotice);
      loginNotice = '';
    }
  } catch { /* Session banner supplies the retry and fail-closed explanation. */ }
}
window.addEventListener('hashchange', renderRoute);

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
  if (password && ['password', 'password_confirmation', 'current_password'].includes(input.name)) {
    const length = Array.from(value).length;
    if (length > 128) return 'รหัสผ่านต้องไม่เกิน 128 อักขระ Unicode';
    if (input.name !== 'current_password' && input.form !== loginForm && length < 12) return 'รหัสผ่านต้องมีอย่างน้อย 12 อักขระ Unicode';
  }
  if (input.name === 'password_confirmation' && input.value !== input.form.elements.namedItem('password').value) return 'รหัสผ่านยืนยันไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง';
  if (input.id === 'mfa-confirm-code' && !/^[0-9]{6}$/.test(value)) return 'กรุณากรอกรหัส TOTP 6 หลัก';
  if (!password && input.maxLength > 0 && value.length > input.maxLength) return `กรุณากรอกไม่เกิน ${input.maxLength} ตัวอักษร`;
  return '';
}
function validateGroup(root) {
  let firstInvalid = null;
  $$('input, select, textarea', root).forEach((input) => {
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
  runForm(loginForm, '#login-message', async (version) => {
    await mutate('/auth/login', values(loginForm, ['email', 'password', 'remember_me']), 'POST', () => !signedIn());
    resetForm(loginForm);
    await refreshSession();
    if (version === routeVersion) location.hash = '#/account';
  });
});
registerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (step < 4) {
    if (validateGroup(fieldsets[step - 1])) showStep(step + 1);
    return;
  }
  runForm(registerForm, '#register-message', async (version) => {
    const payload = values(registerForm, ['first_name', 'last_name', 'nickname', 'email', 'phone', 'student_code', 'member_type', 'password', 'password_confirmation']);
    if (payload.member_type !== 'STUDENT') payload.student_code = null;
    await mutate('/auth/register', payload, 'POST', () => !signedIn());
    resetForm(registerForm);
    $('#register-summary').replaceChildren();
    showStep(1, false);
    await refreshSession();
    if (version === routeVersion) location.hash = '#/account';
  });
});
$('#previous-step').addEventListener('click', () => { if (step > 1) showStep(step - 1); });

function values(form, names) {
  // Disabled registration fieldsets are intentionally read by name, not FormData.
  return Object.fromEntries(names.map((name) => {
    const input = form.elements.namedItem(name);
    return [name, input.type === 'checkbox' ? input.checked : input.type === 'password' || ['password', 'password_confirmation', 'current_password'].includes(name) ? input.value : input.value.trim()];
  }));
}
function signedIn() {
  // A password-verified admin may still be unauthenticated while awaiting MFA.
  return !!session?.user && (session.authenticated === true || (session.mfa_required === true && session.user.permission_role === 'ADMIN'));
}
function isAdmin() { return signedIn() && session.user.permission_role === 'ADMIN'; }
function mfaPending() { return isAdmin() && (session.authenticated !== true || session.mfa_required === true || session.mfa_enrolled !== true); }
function adminReady() { return isAdmin() && !mfaPending(); }
function available() { return !!session && !sessionRequest && session.auth_available !== false && typeof session.csrf_token === 'string' && !!session.csrf_token; }
function formAllowed(form) {
  if (!available()) return false;
  if (form === loginForm || form === registerForm) return !signedIn();
  if (form.id === 'admin-review-form') return currentView === 'admin' && adminReady() && selectedUserId !== null;
  if (currentView !== 'account' || !signedIn()) return false;
  if (form.id === 'mfa-confirm-form') return mfaPending() && session.mfa_enrolled !== true && setupReady;
  if (form.id === 'mfa-verify-form') return mfaPending() && session.mfa_enrolled === true;
  return !mfaPending();
}
function clearPasswordCode() {
  const input = $('#password-code');
  input.value = '';
  setError(input, '');
}
function syncPasswordCode() {
  const admin = isAdmin();
  const input = $('#password-code');
  $('#password-code-field').hidden = !admin;
  input.required = admin;
  input.disabled = !admin || !formAllowed($('#password-form')) || busyForms.has($('#password-form'));
  if (!admin || currentView !== 'account') clearPasswordCode();
}
function updateControls() {
  syncPasswordCode();
  allForms.forEach((form) => {
    const disabled = !formAllowed(form) || busyForms.has(form);
    $$('button[type="submit"]', form).forEach((button) => { button.disabled = disabled; });
    $$('input[type="password"], input[name="current_password"], input[name="password"], input[name="password_confirmation"]', form).forEach((input) => { input.disabled = disabled; });
    form.setAttribute('aria-busy', String(busyForms.has(form)));
  });
  $('#mfa-setup').disabled = !available() || !mfaPending() || session?.mfa_enrolled === true || busyForms.has($('#mfa-confirm-form'));
  $('#logout-button').disabled = logoutBusy || !available() || !signedIn() || busyForms.size > 0;
  $('#previous-step').disabled = busyForms.has(registerForm);
  $('#cancel-review').disabled = busyForms.has($('#admin-review-form'));
  $('#admin-filter').disabled = busyForms.has($('#admin-review-form'));
  $('#admin-refresh').disabled = !available() || !adminReady() || busyForms.has($('#admin-review-form'));
  $$('#admin-users button').forEach((button) => { button.disabled = busyForms.has($('#admin-review-form')); });
}
function syncSessionUI() {
  $('#nav-login').hidden = signedIn();
  $('#nav-register').hidden = signedIn();
  $('#nav-account').hidden = !signedIn();
  $('#nav-admin').hidden = !adminReady();
  $('#account-guest').hidden = signedIn();
  $('#logout-button').hidden = !signedIn();
  $('#admin-gate').hidden = adminReady();
  if (!adminReady()) $('#admin-content').hidden = true;
  if (!signedIn()) $('#account-content').hidden = true;
  const text = !session ? 'ตรวจสอบเซสชันไม่ได้ จึงปิดการส่งแบบฟอร์มบัญชีไว้ กรุณาตรวจสอบอีกครั้ง' : session.auth_available === false ? `ระบบบัญชียังไม่พร้อม: ${session.setup_message || 'เซิร์ฟเวอร์ production ยังไม่ได้ตั้งค่า HTTPS'} · ปิดการส่งรหัสผ่านเพื่อความปลอดภัย` : !session.csrf_token ? 'ยังไม่ได้รับโทเคนความปลอดภัย จึงปิดการส่งแบบฟอร์มบัญชีไว้' : signedIn() ? 'เชื่อมต่อบัญชีแล้ว · ข้อมูลบัญชีไม่ถูกเก็บใน localStorage' : 'พร้อมเข้าสู่ระบบหรือสมัครสมาชิก · โรงเรียนตากพิทยาคม';
  $('#session-status').textContent = text;
  updateControls();
}
function clearMfa() {
  setupReady = false;
  $('#mfa-secret').textContent = '';
  $('#mfa-uri').textContent = '';
  $('#mfa-secret-panel').hidden = true;
  $('#recovery-codes').replaceChildren();
  $('#recovery-panel').hidden = true;
  resetForm($('#mfa-confirm-form'));
  resetForm($('#mfa-verify-form'));
}
function closeReview() {
  selectedUserId = null;
  resetForm($('#admin-review-form'));
  $('#review-user').textContent = '';
  $('#admin-review').hidden = true;
  updateControls();
}
function clearPrivateViews() {
  ++listVersion;
  clearMfa();
  closeReview();
  accountForms.forEach(resetForm);
  $('#account-summary').replaceChildren();
  $('#admin-users').replaceChildren();
  $('#admin-list-status').textContent = '';
  $('#account-content').hidden = true;
  $('#admin-content').hidden = true;
  $('#account-tools').hidden = true;
  ['#account-message', '#admin-message', '#mfa-message'].forEach(clearMessage);
}
async function api(path, { method = 'GET', body, token } = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`/api/v1${path}`, {
      method, credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
      headers: method === 'GET' ? { Accept: 'application/json' } : { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-Token': token },
      ...(method === 'GET' ? {} : { body: JSON.stringify(body) })
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('เซิร์ฟเวอร์ไม่ได้ตอบกลับเป็นข้อมูล API ที่คาดไว้ กรุณาลองใหม่ภายหลัง'); }
    if (!response.ok || result.success !== true) {
      const error = new Error(result.message || `ดำเนินการไม่สำเร็จ (HTTP ${response.status})`);
      error.status = response.status;
      error.code = result.code;
      error.fields = result.errors;
      throw error;
    }
    return result.data;
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error(method === 'GET' ? 'ติดต่อเซิร์ฟเวอร์ไม่ได้หรือหมดเวลา กรุณาตรวจสอบอีกครั้ง' : 'ยังยืนยันผลการส่งไม่ได้ กรุณาตรวจสถานะบัญชีก่อนส่งซ้ำ');
    throw error;
  } finally { clearTimeout(timeout); }
}
function refreshSession() {
  if (sessionRequest) return sessionRequest;
  sessionRequest = (async () => {
    try {
      const data = await api('/auth/session');
      if (!data || typeof data.authenticated !== 'boolean') throw new Error('รูปแบบเซสชันไม่ถูกต้อง');
      const previousId = session?.user?.user_id;
      const previousRole = session?.user?.permission_role;
      session = data;
      if (!signedIn() || (previousId !== undefined && (String(previousId) !== String(data.user?.user_id) || previousRole !== data.user?.permission_role))) clearPrivateViews();
      return data;
    } catch (error) {
      session = null;
      clearPrivateViews();
      allForms.forEach((form) => $$('input[type="password"]', form).forEach((input) => { input.value = ''; }));
      throw error;
    } finally {
      sessionRequest = null;
      $('#retry-session').disabled = false;
      syncSessionUI();
    }
  })();
  $('#retry-session').disabled = true;
  $('#session-status').textContent = 'กำลังตรวจสอบเซสชันก่อนส่งข้อมูล…';
  updateControls();
  return sessionRequest;
}
async function mutate(path, body, method = 'POST', guard = () => true) {
  const version = routeVersion;
  await refreshSession();
  if (version !== routeVersion) throw new Error('เปลี่ยนหน้าแล้ว จึงยกเลิกการส่งข้อมูล');
  if (!available()) throw new Error(session?.setup_message || 'ระบบบัญชียังไม่พร้อมส่งข้อมูลอย่างปลอดภัย');
  if (!guard()) throw new Error('สิทธิ์หรือสถานะเซสชันเปลี่ยนไป กรุณาเข้าสู่ระบบและยืนยันตัวตนอีกครั้ง');
  const data = await api(path, { method, body, token: session.csrf_token });
  if (version !== routeVersion) throw new Error('เปลี่ยนหน้าแล้ว กรุณาตรวจสถานะอีกครั้งก่อนส่งซ้ำ');
  return data;
}
function mfaLoginRequired(error) {
  return ['MFA_PASSWORD_REQUIRED', 'MFA_SETUP_REQUIRED'].includes(error.code);
}
function accountErrorMessage(error) {
  const instruction = mfaLoginRequired(error) ? ' กรุณาออกจากระบบ แล้วเข้าสู่ระบบด้วยรหัสผ่านใหม่ จากนั้นเริ่มตั้งค่าและยืนยัน TOTP ให้เสร็จภายใน 10 นาที' : '';
  return `${error.message}${instruction}${error.code ? ` (${error.code})` : ''}`;
}
function displayError(form, messageId, error) {
  if (mfaLoginRequired(error)) clearMfa();
  let first = null;
  if (error.fields && typeof error.fields === 'object') {
    Object.entries(error.fields).forEach(([name, message]) => {
      const input = form.elements.namedItem(name);
      if (!input || !input.matches?.('input, select, textarea')) return;
      if (form === registerForm && !first) {
        const fieldset = input.closest('[data-step]');
        if (fieldset) showStep(Number(fieldset.dataset.step) + 1, false);
      }
      setError(input, String(message));
      if (!first) first = input;
    });
  }
  const visibleMessage = $(messageId).parentElement.closest('[hidden]') ? currentView === 'admin' ? '#admin-message' : currentView === 'account' ? '#account-message' : messageId : messageId;
  showMessage(visibleMessage, accountErrorMessage(error));
  if (first && !first.disabled && !first.closest('[hidden]')) first.focus();
}
async function runForm(form, messageId, action) {
  if (busyForms.has(form)) return;
  clearMessage(messageId);
  if (!formAllowed(form)) { showMessage(messageId, 'ฟอร์มนี้ยังส่งไม่ได้ โปรดตรวจเซสชัน การเชื่อมต่อที่ปลอดภัย และสิทธิ์บัญชี'); return; }
  if (!validateGroup(form)) return;
  const version = routeVersion;
  busyForms.add(form);
  updateControls();
  try { await action(version); }
  catch (error) {
    if (error.status === 401 || error.status === 403) {
      try { await refreshSession(); } catch { /* Keep the original request error. */ }
      if (version === routeVersion && currentView === 'account' && signedIn()) {
        try { await loadAccount(version); } catch { /* Error remains visible below. */ }
      }
      if (version === routeVersion && currentView === 'admin' && !adminReady()) {
        closeReview();
        $('#admin-users').replaceChildren();
      }
    }
    if (version === routeVersion) displayError(form, messageId, error);
  } finally {
    busyForms.delete(form);
    updateControls();
    if (version === routeVersion) {
      const invalid = $$('[aria-invalid="true"]', form).find((input) => !input.disabled && !input.closest('[hidden]'));
      if (invalid) invalid.focus();
    }
  }
}
function appendSummary(root, rows) {
  root.replaceChildren();
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'review-row';
    const term = document.createElement('dt');
    const description = document.createElement('dd');
    term.textContent = label;
    description.textContent = value == null || value === '' ? '—' : String(value);
    row.append(term, description);
    root.append(row);
  });
}
async function loadAccount(version = routeVersion) {
  if (version !== routeVersion || currentView !== 'account' || !signedIn()) return;
  $('#account-content').hidden = false;
  $('#account-tools').hidden = true;
  const pending = mfaPending();
  $('#mfa-panel').hidden = !pending;
  $('#mfa-enroll').hidden = !pending || session.mfa_enrolled === true;
  $('#mfa-verify-form').hidden = !pending || session.mfa_enrolled !== true;
  const user = session.user;
  appendSummary($('#account-summary'), [
    ['ชื่อ', `${user.first_name || ''} ${user.last_name || ''}`], ['ชื่อเล่น', user.nickname],
    ['อีเมล', user.email], ['เบอร์โทรศัพท์', user.phone], ['ประเภท', memberLabels[user.member_type] || user.member_type],
    ['รหัสนักเรียน', user.student_code], ['สิทธิ์', user.permission_role === 'ADMIN' ? 'ผู้ดูแล' : 'สมาชิกทั่วไป'],
    ['สถานะ', statusLabels[user.verification_status] || user.verification_status], ['เหตุผลจากเจ้าหน้าที่', user.rejection_reason]
  ]);
  updateControls();
  if (pending || session.auth_available === false) return;
  try {
    const profile = await api('/profile');
    if (version !== routeVersion || currentView !== 'account' || !signedIn() || mfaPending()) return;
    if (!profile || String(profile.user_id) !== String(session.user.user_id)) throw new Error('ข้อมูลโปรไฟล์ไม่ตรงกับเซสชัน');
    ['first_name', 'last_name', 'nickname', 'phone'].forEach((name) => { $('#profile-form').elements.namedItem(name).value = profile[name] || ''; });
    $('#account-tools').hidden = false;
  } catch (error) {
    if (version === routeVersion) showMessage('#account-message', `โหลดข้อมูลส่วนตัวไม่สำเร็จ: ${error.message}`);
  }
}
accountForms.forEach((form) => form.addEventListener('input', (event) => {
  if (event.target.matches('input, select, textarea')) setError(event.target, '');
  const message = $('.form-message', form);
  if (message) { message.hidden = true; message.textContent = ''; }
}));
$('#profile-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  runForm(form, '#profile-message', async () => {
    await mutate('/profile', values(form, ['first_name', 'last_name', 'nickname', 'phone']), 'PATCH', () => signedIn() && !mfaPending());
    await refreshSession();
    await loadAccount();
    if (currentView === 'account') showMessage('#profile-message', 'บันทึกข้อมูลส่วนตัวแล้ว');
  });
});
$('#password-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const userId = session?.user?.user_id;
  const admin = isAdmin();
  runForm(form, '#password-message', async (version) => {
    const payload = values(form, ['current_password', 'password', 'password_confirmation']);
    if (admin) payload.code = form.elements.namedItem('code').value.trim();
    clearPasswordCode();
    await mutate('/auth/change-password', payload, 'POST', () => signedIn() && !mfaPending() && String(session.user.user_id) === String(userId) && isAdmin() === admin);
    resetForm(form);
    session = null;
    clearPrivateViews();
    await refreshSession();
    if (version !== routeVersion) return;
    loginNotice = 'เปลี่ยนรหัสผ่านแล้ว ทุกเซสชันถูกยกเลิก กรุณาเข้าสู่ระบบใหม่';
    location.hash = '#/login';
  });
  clearPasswordCode();
});
$('#logout-button').addEventListener('click', async () => {
  clearPasswordCode();
  if (logoutBusy || busyForms.size || !available()) return;
  logoutBusy = true;
  updateControls();
  clearMfa();
  try {
    await mutate('/auth/logout', {}, 'POST', signedIn);
    session = null;
    clearPrivateViews();
    resetForm(loginForm);
    resetForm(registerForm);
    await refreshSession();
    location.hash = '#/login';
  } catch (error) { showMessage('#account-message', `ยังยืนยันการออกจากระบบไม่ได้: ${error.message}`); }
  finally { logoutBusy = false; updateControls(); }
});
$('#mfa-setup').addEventListener('click', async () => {
  const form = $('#mfa-confirm-form');
  if (busyForms.has(form) || !available()) return;
  const version = routeVersion;
  busyForms.add(form);
  updateControls();
  clearMessage('#mfa-message');
  try {
    const data = await mutate('/auth/mfa/setup', {}, 'POST', () => mfaPending() && session.mfa_enrolled !== true);
    if (version !== routeVersion || currentView !== 'account') return;
    if (typeof data?.secret !== 'string' || typeof data.otpauth_uri !== 'string') throw new Error('ข้อมูลตั้งค่า TOTP ไม่ครบถ้วน');
    $('#mfa-secret').textContent = data.secret;
    $('#mfa-uri').textContent = data.otpauth_uri;
    setupReady = true;
    $('#mfa-secret-panel').hidden = false;
    $('#mfa-confirm-code').focus();
  } catch (error) {
    if (version === routeVersion) {
      if (mfaLoginRequired(error)) clearMfa();
      showMessage('#mfa-message', accountErrorMessage(error));
    }
  }
  finally { busyForms.delete(form); updateControls(); }
});
$('#mfa-confirm-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  runForm(form, '#mfa-confirm-message', async () => {
    const version = routeVersion;
    const data = await mutate('/auth/mfa/confirm', values(form, ['code']), 'POST', () => mfaPending() && setupReady);
    clearMfa();
    await refreshSession();
    if (version !== routeVersion) return;
    await loadAccount(version);
    if (!Array.isArray(data?.recovery_codes) || !data.recovery_codes.length) throw new Error('ตั้งค่าแล้ว แต่ไม่ได้รับรหัสกู้คืน กรุณาติดต่อเจ้าหน้าที่ผ่านช่องทางส่วนตัว');
    data.recovery_codes.forEach((code) => {
      const item = document.createElement('li');
      item.textContent = String(code);
      $('#recovery-codes').append(item);
    });
    $('#recovery-panel').hidden = false;
    $('#recovery-title').setAttribute('tabindex', '-1');
    $('#recovery-title').focus();
  });
});
$('#mfa-verify-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  runForm(form, '#mfa-verify-message', async () => {
    await mutate('/auth/mfa/verify', values(form, ['code']), 'POST', mfaPending);
    resetForm(form);
    await refreshSession();
    await loadAccount();
    if (currentView === 'account') showMessage('#account-message', 'ยืนยันตัวตนแล้ว');
  });
});
$('#dismiss-recovery').addEventListener('click', () => { clearMfa(); $('#account-title').focus(); updateControls(); });
async function loadAdminUsers() {
  const version = routeVersion;
  const request = ++listVersion;
  closeReview();
  $('#admin-users').replaceChildren();
  if (currentView !== 'admin' || !adminReady() || session?.auth_available === false) return;
  $('#admin-content').hidden = false;
  $('#admin-list-status').textContent = 'กำลังโหลดรายการสมาชิก…';
  clearMessage('#admin-message');
  $('#admin-refresh').disabled = true;
  try {
    const status = $('#admin-filter').value;
    const data = await api(`/admin/users?status=${encodeURIComponent(status)}`);
    if (version !== routeVersion || request !== listVersion || !adminReady()) return;
    if (!Array.isArray(data?.users) || typeof data.total !== 'number') throw new Error('รูปแบบรายการสมาชิกไม่ถูกต้อง');
    $('#admin-list-status').textContent = data.users.length ? `แสดง ${data.users.length} รายการ จากทั้งหมด ${data.total} รายการ` : 'ไม่มีสมาชิกในสถานะนี้';
    data.users.forEach((user) => {
      const item = document.createElement('li');
      item.className = 'admin-user';
      const details = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = `${user.first_name || ''} ${user.last_name || ''} (${user.nickname || '—'})`;
      const meta = document.createElement('p');
      meta.textContent = [user.email, memberLabels[user.member_type] || user.member_type, statusLabels[user.verification_status] || user.verification_status, user.permission_role === 'ADMIN' ? 'ผู้ดูแล' : 'สมาชิก', user.student_code].filter(Boolean).join(' · ');
      details.append(name, meta);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'button secondary small';
      button.textContent = 'พิจารณา';
      button.addEventListener('click', () => {
        if (!adminReady() || busyForms.has($('#admin-review-form'))) return;
        closeReview();
        selectedUserId = String(user.user_id);
        $('#review-user').textContent = `${name.textContent} · ${user.email || ''} · ID ${selectedUserId}`;
        $('#admin-review').hidden = false;
        $('#review-title').focus();
        updateControls();
      });
      item.append(details, button);
      $('#admin-users').append(item);
    });
  } catch (error) {
    if (version !== routeVersion || request !== listVersion) return;
    $('#admin-list-status').textContent = 'โหลดรายการไม่สำเร็จ';
    if (error.status === 401 || error.status === 403) {
      try { await refreshSession(); } catch { /* Fail closed in session UI. */ }
    }
    if (version === routeVersion) showMessage('#admin-message', error.message);
  } finally { if (request === listVersion) updateControls(); }
}
$('#admin-filter').addEventListener('change', loadAdminUsers);
$('#admin-refresh').addEventListener('click', async () => { try { await refreshSession(); await loadAdminUsers(); } catch { /* Banner contains retry. */ } });
$('#cancel-review').addEventListener('click', () => { closeReview(); $('#admin-filter').focus(); });
$('#admin-review-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  runForm(form, '#admin-review-message', async () => {
    const id = selectedUserId;
    try {
      await mutate(`/admin/users/${encodeURIComponent(id)}/status`, values(form, ['verification_status', 'reason', 'current_password', 'code']), 'PATCH', () => adminReady() && selectedUserId === id);
      await refreshSession();
      if (currentView !== 'admin') return;
      closeReview();
      await loadAdminUsers();
      showMessage('#admin-message', 'บันทึกสถานะสมาชิกแล้ว');
    } finally {
      form.elements.namedItem('current_password').value = '';
      form.elements.namedItem('code').value = '';
    }
  });
});
$('#retry-session').addEventListener('click', renderRoute);

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
  about: ['รู้จัก FoundIt', 'พื้นที่ของโรงเรียนตากพิทยาคม ระบบบัญชีจะพร้อมเมื่อเซิร์ฟเวอร์และการเชื่อมต่อที่ปลอดภัยพร้อม ระบบประกาศ การค้นหาจริง การจับคู่ และการรับคืนยังไม่ได้พัฒนา'],
  privacy: ['ความเป็นส่วนตัว เริ่มจากความใส่ใจ', 'แบบฟอร์มบัญชีส่งข้อมูลไปยัง API ของเว็บไซต์เดียวกันเมื่อระบบพร้อมเท่านั้น ไม่เก็บข้อมูลส่วนตัว รหัสผ่าน Secret TOTP หรือรหัสกู้คืนใน localStorage มีเพียงการตั้งค่าธีมที่จำในอุปกรณ์\n\nข้อมูลแบบฟอร์มและรหัสกู้คืนจะถูกล้างเมื่อออกจากหน้านั้น เบราว์เซอร์อาจเติมข้อมูลอัตโนมัติตามการตั้งค่าของคุณ เซสชันปกติ 8 ชั่วโมง หรือจดจำ 30 วัน ผู้ดูแลต้องใช้ TOTP และเก็บรหัสกู้คืน\n\nอย่าเผยแพร่คำตอบลับ หลักฐานยืนยันเจ้าของ หรือจำนวนเงินจริงในช่องทางสาธารณะ ระบบประกาศ ค้นหาจริง จับคู่ และรับคืนยังไม่ได้พัฒนา'],
  contact: ['ติดต่อผู้ดูแล', 'กรุณาติดต่อเจ้าหน้าที่โรงเรียนตากพิทยาคมโดยตรงผ่านช่องทางส่วนตัว ระบบยังไม่มีช่องทางติดต่อผู้ดูแลหรือส่งอีเมล อย่าส่งข้อมูลลับหรือหลักฐานผ่านช่องทางสาธารณะ'],
  forgot: ['ยังส่งอีเมลรีเซ็ตรหัสผ่านไม่ได้', 'ยังไม่มีผู้ให้บริการส่งอีเมล จึงไม่สามารถส่งลิงก์รีเซ็ตรหัสผ่านจากหน้านี้ได้ กรุณาติดต่อเจ้าหน้าที่โรงเรียนผ่านช่องทางส่วนตัว ไม่มีการส่งอีเมลหรือสร้างคำขอรีเซ็ตจากปุ่มนี้']
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
    statusElement.textContent = 'เซิร์ฟเวอร์ตอบสนอง · ดูความพร้อมระบบบัญชีที่แถบสถานะ';
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
  ++routeVersion;
  session = null;
  clearPrivateViews();
  resetForm(loginForm);
  resetForm(registerForm);
  $('#register-summary').replaceChildren();
  showStep(1, false);
  updateControls();
});
window.addEventListener('pageshow', (event) => { if (event.persisted) renderRoute(); });
showStep(1, false);
renderRoute();
checkHealth();
