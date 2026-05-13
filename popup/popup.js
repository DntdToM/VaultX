import { HashTable } from "../logic/hashtable.js";
import { Trie } from "../logic/trie.js";
import { filterAccountsWithKmp } from "../logic/kmp.js";
import { PasswordStack } from "../logic/stack.js";
import {
  decryptAES,
  encryptAES,
  estimatePasswordStrength,
  generateSecurePassword,
  hashMasterPassword,
  verifyMasterPassword
} from "../logic/cryptography.js";

const STORAGE_KEY = "vaultxState";
const ACTIVE_PROFILE_KEY = "vaultxActiveGoogleEmail";
const SESSION_KEY = "vaultxSessionVault";
const PENDING_CAPTURE_KEY = "vaultxPendingCapture";
const DEFAULT_SETTINGS = { autoLockMinutes: 5, language: "vi", theme: "mono" };
const THEME_OPTIONS = [
  { value: "mono", label: "Monochrome" },
  { value: "buttermilk", label: "Buttermilk Blue" },
  { value: "neobrutalism", label: "Neubrutalism" }
];
const MAX_HISTORY = 20;

const ICONS = {
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.8-2.4 7.9-7 10-4.6-2.1-7-5.2-7-10V6l7-3Z"/><path d="M9.5 12.5 11.5 14.5 15 10.5"/></svg>',
  key: '<svg viewBox="0 0 24 24"><circle cx="8.5" cy="15.5" r="3.5"/><path d="M11 13l7-7 2 2-2 2 1.5 1.5-1.5 1.5-1.5-1.5-2 2"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V8a4 4 0 1 1 8 0v2"/></svg>',
  copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="10" height="11" rx="2"/><path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="M12.5 5.5 16.5 9.5"/></svg>',
  restore: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 8v5l3 2"/></svg>',
  account: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.2-4.2"/></svg>',
  spark: '<svg viewBox="0 0 24 24"><path d="M12 3l1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4Z"/><path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8Z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="M12 5l-7 7 7 7"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>',
  refresh: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>',
  google: '<svg viewBox="0 0 48 48" stroke="none"><path d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#d4d4d4"/><path d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#777"/><path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3-11.3-7.3l-6.5 5C9.5 39.6 16.2 44 24 44z" fill="#aaa"/><path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C36.7 39.5 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#111"/></svg>'
};

const $ = {};

let state = createDefaultState();
let currentScreen = "welcome";
let activeTab = "vault";
let masterPasswordCache = null;
let searchQuery = "";
let generatedPassword = "";
let accountIndex = new HashTable(29);
let flash = null;
let flashTimer = null;

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function profileStorageKey(email) {
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail ? `${STORAGE_KEY}:${normalizedEmail}` : STORAGE_KEY;
}

document.addEventListener("DOMContentLoaded", async () => {
  cacheDom();
  renderIcons(document);
  bindShell();
  const activeEmail = await readActiveProfileEmail();
  state = normalize(await readStorage(activeEmail));
  if (activeEmail) {
    state.googleEmail = activeEmail;
  }
  state.pendingCapture = await readPendingCapture();
  rebuildAccountIndex();
  applyTheme();
  autoRoute();
  render();
});

function createSampleAccounts() {
  return [
    {
      id: "acct-github",
      domain: "github.com",
      username: "bard.ai",
      password: "G!thubVault2026",
      notes: "Kho ma nguon ca nhan, bat 2FA.",
      updatedAt: "2026-04-02T09:30:00.000Z",
      history: [
        { password: "GitHub#2025Strong", changedAt: "2026-03-15T06:30:00.000Z" },
        { password: "GH@bardSecure24", changedAt: "2025-12-09T09:15:00.000Z" }
      ]
    },
    {
      id: "acct-notion",
      domain: "notion.so",
      username: "bard.workspace",
      password: "Notion!Flow2026",
      notes: "Khong chia se credential trong nhom.",
      updatedAt: "2026-03-29T11:45:00.000Z",
      history: [{ password: "Notion#Notes25", changedAt: "2026-01-10T13:00:00.000Z" }]
    },
    {
      id: "acct-figma",
      domain: "figma.com",
      username: "hacker.nasa",
      password: "Figma!VaultX2026",
      notes: "Dung cho file thiet ke VaultX va FigJam.",
      updatedAt: "2026-04-01T08:20:00.000Z",
      history: [{ password: "Figma#Mockup26", changedAt: "2026-02-11T08:00:00.000Z" }]
    }
  ];
}

function createDefaultState() {
  const accounts = createSampleAccounts();

  return {
    storageMode: "encrypted",
    googleEmail: null,
    masterCredential: null,
    encryptedVault: null,
    locked: true,
    accounts,
    settings: { ...DEFAULT_SETTINGS },
    pendingCapture: null,
    selectedAccountId: accounts[0]?.id || null,
    generatorHistory: []
  };
}

function cacheDom() {
  $.stage = document.getElementById("screen-stage");
  $.banner = document.getElementById("banner");
  $.status = document.getElementById("vault-status");
  $.btnLock = document.getElementById("btn-lock");
  $.bottomNav = document.getElementById("bottom-nav");
  $.dialog = document.getElementById("account-dialog");
  $.form = document.getElementById("account-form");
  $.dialogTitle = document.getElementById("dialog-title");
  $.acctId = document.getElementById("account-id");
  $.acctDomain = document.getElementById("account-domain");
  $.acctUser = document.getElementById("account-username");
  $.acctPass = document.getElementById("account-password");
  $.acctNotes = document.getElementById("account-notes");
  $.dialogClose = document.getElementById("dialog-close");
  $.dialogCancel = document.getElementById("dialog-cancel");
  $.dialogGenerate = document.getElementById("dialog-generate");
}

function bindShell() {
  $.btnLock.addEventListener("click", handleLock);
  $.form.addEventListener("submit", handleAccountSubmit);
  $.dialogClose.addEventListener("click", () => $.dialog.close());
  $.dialogCancel.addEventListener("click", () => $.dialog.close());
  $.dialogGenerate.addEventListener("click", handleDialogGenerate);

  $.bottomNav.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      activeTab = tab.dataset.tab;
      navigate(activeTab === "vault" ? "dashboard" : activeTab);
    });
  });
}

async function readActiveProfileEmail() {
  if (globalThis.chrome?.storage?.local) {
    const result = await chrome.storage.local.get(ACTIVE_PROFILE_KEY);
    return normalizeEmail(result[ACTIVE_PROFILE_KEY]);
  }

  return normalizeEmail(localStorage.getItem(ACTIVE_PROFILE_KEY));
}

async function writeActiveProfileEmail(email) {
  const normalizedEmail = normalizeEmail(email);

  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [ACTIVE_PROFILE_KEY]: normalizedEmail });
    return;
  }

  localStorage.setItem(ACTIVE_PROFILE_KEY, normalizedEmail);
}

async function readStorage(email = null) {
  const activeEmail = normalizeEmail(email) || await readActiveProfileEmail();
  if (!activeEmail) {
    return null;
  }

  const key = profileStorageKey(activeEmail);

  if (globalThis.chrome?.storage?.local) {
    const result = await chrome.storage.local.get(key);
    return result[key] || null;
  }

  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : null;
}

async function readLegacyStorage() {
  if (globalThis.chrome?.storage?.local) {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || null;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function writeStorage(nextState, email = state.googleEmail) {
  const activeEmail = normalizeEmail(email);
  const key = profileStorageKey(activeEmail);

  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.set({ [key]: nextState });
    return;
  }

  localStorage.setItem(key, JSON.stringify(nextState));
}

async function removeProfileStorage(email = state.googleEmail) {
  const activeEmail = normalizeEmail(email);
  const key = profileStorageKey(activeEmail);

  if (globalThis.chrome?.storage?.local) {
    await chrome.storage.local.remove(key);
    return;
  }

  localStorage.removeItem(key);
}

async function writeSessionVault() {
  if (globalThis.chrome?.storage?.session && !state.locked) {
    await chrome.storage.session.set({
      [SESSION_KEY]: {
        accounts: state.accounts,
        updatedAt: new Date().toISOString()
      }
    });
  }
}

async function clearSessionVault() {
  if (globalThis.chrome?.storage?.session) {
    await chrome.storage.session.remove(SESSION_KEY);
  }
}

async function readPendingCapture() {
  if (!globalThis.chrome?.storage?.session) {
    return null;
  }

  const result = await chrome.storage.session.get(PENDING_CAPTURE_KEY);
  return result[PENDING_CAPTURE_KEY] || null;
}

async function clearPendingCapture() {
  if (globalThis.chrome?.storage?.session) {
    await chrome.storage.session.remove(PENDING_CAPTURE_KEY);
  }
}

async function saveState() {
  if (state.masterCredential && masterPasswordCache && !state.locked) {
    const vaultPayload = {
      accounts: state.accounts,
      generatorHistory: state.generatorHistory,
      selectedAccountId: state.selectedAccountId
    };

    state.encryptedVault = await encryptAES(JSON.stringify(vaultPayload), masterPasswordCache, state.masterCredential.salt);
  }

  const storedState = {
    storageMode: state.storageMode,
    googleEmail: state.googleEmail,
    masterCredential: state.masterCredential,
    encryptedVault: state.encryptedVault,
    locked: Boolean(state.locked),
    settings: state.settings
  };

  if (!state.masterCredential) {
    storedState.accounts = state.accounts;
    storedState.generatorHistory = state.generatorHistory;
    storedState.selectedAccountId = state.selectedAccountId;
  }

  await writeStorage(storedState);
  await writeSessionVault();
}

function normalize(raw) {
  const defaults = createDefaultState();
  if (!raw) {
    return defaults;
  }

  const normalized = {
    ...defaults,
    ...raw,
    settings: { ...DEFAULT_SETTINGS, ...(raw.settings || {}) },
    accounts: Array.isArray(raw.accounts) ? raw.accounts : defaults.accounts,
    generatorHistory: Array.isArray(raw.generatorHistory) ? raw.generatorHistory : [],
    pendingCapture: null
  };

  normalized.settings.theme = normalizeTheme(normalized.settings.theme);

  if (raw.masterCredential) {
    normalized.accounts = [];
    normalized.generatorHistory = [];
    normalized.locked = true;
  }

  normalized.selectedAccountId = raw.selectedAccountId || defaults.selectedAccountId;
  return normalized;
}

function autoRoute() {
  if (!state.masterCredential) {
    currentScreen = "welcome";
    activeTab = "vault";
    return;
  }

  currentScreen = state.locked ? "unlock" : "dashboard";
  activeTab = "vault";
}

function navigate(screen) {
  currentScreen = screen;

  render();
}

function rebuildAccountIndex(accounts = state.accounts) {
  accountIndex = new HashTable(29);

  accounts.forEach((account) => {
    accountIndex.set(account.id, account);
  });
}

function applyTheme() {
  const theme = normalizeTheme(state.settings?.theme);
  state.settings.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
}

function normalizeTheme(theme) {
  return THEME_OPTIONS.some((option) => option.value === theme) ? theme : "mono";
}

function render() {
  const focusState = captureFocusState();
  ensureSelectedAccount();
  renderHeader();
  renderBanner();
  renderBottomNav();
  $.stage.innerHTML = screenHTML();
  renderIcons($.stage);
  bindScreen();
  syncMeters();
  restoreFocusState(focusState);
}

function renderIcons(root) {
  root.querySelectorAll("[data-icon]").forEach((node) => {
    node.innerHTML = ICONS[node.dataset.icon] || "";
  });
}

function captureFocusState() {
  const active = document.activeElement;
  if (!active?.id || !$.stage.contains(active)) {
    return null;
  }

  const canRestoreSelection = typeof active.selectionStart === "number"
    && typeof active.selectionEnd === "number";

  return {
    id: active.id,
    scrollTop: $.stage.scrollTop,
    selectionStart: canRestoreSelection ? active.selectionStart : null,
    selectionEnd: canRestoreSelection ? active.selectionEnd : null,
    selectionDirection: canRestoreSelection ? active.selectionDirection : "none"
  };
}

function restoreFocusState(focusState) {
  if (!focusState) {
    return;
  }

  const field = document.getElementById(focusState.id);
  if (!field || !$.stage.contains(field) || typeof field.focus !== "function") {
    return;
  }

  field.focus({ preventScroll: true });
  if (typeof field.setSelectionRange === "function"
    && focusState.selectionStart !== null
    && focusState.selectionEnd !== null) {
    try {
      field.setSelectionRange(
        focusState.selectionStart,
        focusState.selectionEnd,
        focusState.selectionDirection
      );
    } catch {}
  }

  $.stage.scrollTop = focusState.scrollTop;
}

function renderHeader() {
  if (!state.masterCredential) {
    $.status.textContent = "Chưa thiết lập";
    $.status.className = "status-pill tone-neutral";
    $.btnLock.style.display = "none";
    return;
  }

  $.status.textContent = state.locked ? "Đang khóa" : "Đã mở khóa";
  $.status.className = `status-pill ${state.locked ? "tone-warn" : "tone-safe"}`;
  $.btnLock.style.display = state.locked ? "none" : "";
}

function renderBottomNav() {
  const show = Boolean(state.masterCredential && !state.locked);
  $.bottomNav.classList.toggle("is-hidden", !show);

  if (!show) {
    return;
  }

  $.bottomNav.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.tab === activeTab);
  });
  renderIcons($.bottomNav);
}

function renderBanner() {
  if (state.pendingCapture && state.masterCredential && !state.locked) {
    const pending = state.pendingCapture;
    $.banner.className = "message-banner surface-soft";
    $.banner.innerHTML = `<div class="banner-row"><div>
      <strong>Đăng nhập mới: ${esc(pending.domain)}</strong>
      <p class="hint">Tài khoản ${esc(pending.username || "?")}. Bạn muốn lưu vào VaultX?</p>
    </div><div class="action-row">
      <button class="btn btn-ghost" data-banner="dismiss">Bỏ qua</button>
      <button class="btn btn-primary" data-banner="save">Lưu</button>
    </div></div>`;
    $.banner.querySelectorAll("[data-banner]").forEach((button) => {
      button.addEventListener("click", handleBanner);
    });
    return;
  }

  if (flash) {
    $.banner.className = "message-banner surface-soft";
    $.banner.innerHTML = `<strong>${esc(flash)}</strong>`;
    return;
  }

  $.banner.className = "message-banner is-hidden";
  $.banner.innerHTML = "";
}

function screenHTML() {
  if (!state.masterCredential && !["welcome", "onboarding"].includes(currentScreen)) {
    return welcome();
  }

  if (state.masterCredential && state.locked && currentScreen !== "unlock") {
    return unlock();
  }

  const screens = {
    welcome,
    onboarding,
    unlock,
    dashboard,
    detail,
    generator,
    genHistory,
    settings
  };

  return screens[currentScreen] ? screens[currentScreen]() : dashboard();
}

function welcome() {
  return `<section class="screen welcome-screen">
    <div class="welcome-panel surface">
      <div class="welcome-card">
        <div class="welcome-orbit" aria-label="Các phần chính của VaultX">
          <span class="orbit-line orbit-line-a"></span>
          <span class="orbit-line orbit-line-b"></span>
          <span class="orbit-core">
            <span data-icon="shield"></span>
            Vault
          </span>
          <span class="orbit-node orbit-crypto">
            <span data-icon="lock"></span>
            Crypto
          </span>
          <span class="orbit-node orbit-search">
            <span data-icon="search"></span>
            Trie + KMP
          </span>
          <span class="orbit-node orbit-shuffle">
            <span data-icon="key"></span>
            Shuffle
          </span>
        </div>
        <div class="auth-actions">
          <button id="btn-google" class="btn btn-secondary btn-full btn-google" type="button">
            <span data-icon="google"></span>
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
    </div>
  </section>`;
}

function onboarding() {
  return `<section class="screen">
    <div class="panel surface">
      <div class="center-card">
        <span class="hero-icon" data-icon="key"></span>
        <strong>Tạo Master Password</strong>
        <p class="hint">${state.googleEmail
          ? `Google: ${esc(state.googleEmail)}. Mật khẩu chính vẫn dùng để mã hóa vault.`
          : "Mật khẩu này dùng để mở khóa dữ liệu của bạn."}</p>
        <form id="form-onboard">
          <div class="field">
            <label for="mp-create">Master Password</label>
            <div class="input-with-action">
              <input id="mp-create" type="password" autocomplete="new-password" placeholder="Tối thiểu 12 ký tự" required />
              <button id="btn-ob-gen" class="input-action" type="button" title="Tạo mật khẩu ngẫu nhiên">
                <span data-icon="spark"></span>
              </button>
            </div>
          </div>
          <div class="field">
            <label for="mp-confirm">Nhập lại</label>
            <input id="mp-confirm" type="password" autocomplete="new-password" placeholder="Xác nhận mật khẩu" required />
          </div>
          ${meter("ob")}
          <button class="btn btn-primary btn-full" type="submit">Tạo Vault</button>
        </form>
      </div>
    </div>
  </section>`;
}

function unlock() {
  return `<section class="screen">
    <div class="panel surface">
      <div class="center-card">
        <span class="hero-icon" data-icon="lock"></span>
        <strong>Mở khóa VaultX</strong>
        <p class="hint">${state.googleEmail
          ? `Google: ${esc(state.googleEmail)}. Nhập mật khẩu chính để mở vault.`
          : "Nhập mật khẩu chính để xem dữ liệu đã lưu."}</p>
        <form id="form-unlock">
          <div class="field">
            <label for="mp-unlock">Master Password</label>
            <input id="mp-unlock" type="password" placeholder="Nhập mật khẩu chính" required />
          </div>
          <button class="btn btn-primary btn-full" type="submit">Mở khóa</button>
        </form>
      </div>
    </div>
  </section>`;
}

function dashboard() {
  return `<section class="screen">
    <div class="panel surface">
      <div class="field">
        <div class="search-shell">
          <span data-icon="search"></span>
          <input id="dash-search" type="search" value="${esc(searchQuery)}" placeholder="Tìm domain, username, ghi chú..." />
        </div>
      </div>
      <div id="dash-suggestions-host">${dashboardSuggestionsHTML()}</div>
      <div class="action-row" style="justify-content:flex-start">
        <button id="btn-add" class="btn btn-primary" type="button"><span data-icon="plus"></span>Thêm tài khoản</button>
      </div>
    </div>
    <div id="dash-results-host">${dashboardResultsHTML()}</div>
  </section>`;
}

function detail() {
  const account = getSelectedAccount();
  if (!account) {
    return dashboard();
  }

  return `<section class="screen">
    <div class="nav-row">
      <button class="btn-back" id="btn-back" type="button"><span data-icon="back"></span></button>
      <h2>${esc(account.domain)}</h2>
      <span class="tag tone-safe">${fmtDate(account.updatedAt)}</span>
    </div>
    <div class="panel surface">
      <div class="grid-2">
        <div class="field"><label>Username</label><input value="${esc(account.username)}" readonly /></div>
        <div class="field"><label>Mật khẩu</label><input value="${esc(account.password)}" readonly /></div>
      </div>
      ${account.notes ? `<p class="hint">${esc(account.notes)}</p>` : ""}
      <div class="action-row" style="justify-content:flex-start">
        <button class="btn btn-primary" id="btn-copy-pw" type="button"><span data-icon="copy"></span>Copy</button>
        <button class="btn btn-secondary" id="btn-edit-acct" type="button"><span data-icon="edit"></span>Sửa</button>
        <button class="btn btn-warning" id="btn-del-acct" type="button"><span data-icon="trash"></span>Xóa</button>
      </div>
    </div>
    <div class="panel surface">
      <div class="panel-head">
        <h3>Lịch sử mật khẩu</h3>
        <span class="tag tone-neutral">${account.history.length} bản ghi</span>
      </div>
      ${account.history.length
        ? `<div class="history-list">${account.history.map((entry, index) => historyCard(entry, index)).join("")}</div>`
        : '<p class="hint">Chưa có lịch sử thay đổi.</p>'}
    </div>
  </section>`;
}

function generator() {
  const historyCount = (state.generatorHistory || []).length;

  return `<section class="screen">
    <div class="panel surface">
      <div class="panel-head"><h3>Tạo mật khẩu</h3></div>
      <div class="gen-result-row">
        <span class="gen-text" id="gen-text">-</span>
        <div class="gen-actions">
          <button class="icon-button" id="btn-gen-refresh" type="button" title="Tạo mới"><span data-icon="refresh"></span></button>
          <button class="icon-button" id="btn-gen-copy" type="button" title="Sao chép"><span data-icon="copy"></span></button>
        </div>
      </div>
      ${meter("gen")}
      <div class="field">
        <label for="gen-len">Độ dài: <strong id="gen-len-label">18</strong></label>
        <input id="gen-len" type="range" min="8" max="128" value="18" />
      </div>
      <div class="panel-head"><h3>Bao gồm</h3></div>
      <div class="check-grid">
        <label class="stat-card"><input id="ck-upper" type="checkbox" checked /><span>A-Z</span></label>
        <label class="stat-card"><input id="ck-lower" type="checkbox" checked /><span>a-z</span></label>
        <label class="stat-card"><input id="ck-num" type="checkbox" checked /><span>0-9</span></label>
        <label class="stat-card"><input id="ck-sym" type="checkbox" checked /><span>!@#$%</span></label>
      </div>
    </div>
    <button class="link-row" id="btn-gen-history" type="button">
      <span>Generator history</span>
      <span class="link-row-right">
        <span id="gen-history-count">${historyCount}</span>
        <span data-icon="back" style="transform:rotate(180deg)"></span>
      </span>
    </button>
  </section>`;
}

function genHistory() {
  const history = state.generatorHistory || [];

  return `<section class="screen">
    <div class="nav-row">
      <button class="btn-back" id="btn-back-gen" type="button"><span data-icon="back"></span></button>
      <h2>Generator history</h2>
      <span class="tag tone-neutral">${history.length}</span>
    </div>
    ${history.length
      ? `<div class="history-list">${history.map((entry, index) => genHistoryCard(entry, index)).join("")}</div>
         <button class="btn btn-warning btn-full btn-danger-history" id="btn-clear-gen-history" type="button">Xóa toàn bộ lịch sử</button>`
      : emptyState("Chưa có mật khẩu nào được tạo.")}
  </section>`;
}

function settings() {
  const stats = getAlgorithmStats();

  return `<section class="screen">
    <div class="panel surface">
      <div class="panel-head"><h3>Tùy chọn</h3></div>
      <div class="grid-2">
        <div class="field">
          <label for="set-autolock">Tự động khóa</label>
          <select id="set-autolock">
            ${[1, 5, 10, 30].map((value) => `<option value="${value}" ${state.settings.autoLockMinutes === value ? "selected" : ""}>${value} phút</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Giao diện</label>
          <select id="set-theme">
            ${THEME_OPTIONS.map((theme) => `<option value="${theme.value}" ${state.settings.theme === theme.value ? "selected" : ""}>${theme.label}</option>`).join("")}
          </select>
        </div>
      </div>
    </div>
    <div class="panel surface">
      <div class="panel-head"><h3>Thống kê thuật toán</h3></div>
      <div class="stats-grid">
        <div class="stat-item"><span class="stat-value">${stats.accounts}</span><span class="stat-label">Account trong HashTable</span></div>
        <div class="stat-item"><span class="stat-value">${stats.collisions}</span><span class="stat-label">Collided buckets</span></div>
        <div class="stat-item"><span class="stat-value">${stats.trieWords}</span><span class="stat-label">Từ trong Trie</span></div>
        <div class="stat-item"><span class="stat-value">${stats.kmpMatches}</span><span class="stat-label">Kết quả KMP</span></div>
        <div class="stat-item"><span class="stat-value">${stats.history}</span><span class="stat-label">Lịch sử Stack</span></div>
      </div>
    </div>
    <div class="panel surface">
      <div class="panel-head"><h3>Phiên đăng nhập</h3></div>
      <p class="hint">${state.googleEmail
        ? `Google: ${esc(state.googleEmail)}`
        : "Chưa liên kết tài khoản Google. Master Password vẫn là lớp bảo vệ chính của vault."}</p>
      <button class="btn btn-secondary btn-full" id="btn-logout" type="button">Khóa vault</button>
    </div>
    <div class="panel surface">
      <div class="panel-head"><h3>Vùng nguy hiểm</h3></div>
      <p class="hint">Xóa toàn bộ dữ liệu đã lưu và quay lại bước tạo vault.</p>
      <button class="btn btn-warning btn-full" id="btn-reset-vault" type="button">Xóa toàn bộ dữ liệu</button>
    </div>
  </section>`;
}

function meter(prefix, options = {}) {
  const showLabel = options.label !== false;

  return `<div class="meter">
    <div class="meter-track"><span id="${prefix}-fill" class="meter-fill"></span></div>
    <div class="meter-meta ${showLabel ? "" : "is-centered"}">
      ${showLabel ? `<strong id="${prefix}-label">-</strong>` : `<strong id="${prefix}-label" class="sr-only">-</strong>`}
      <small id="${prefix}-hint"></small>
    </div>
  </div>`;
}

function accountCard(account) {
  const selected = account.id === state.selectedAccountId ? "is-selected" : "";

  return `<article class="account-card ${selected}" data-id="${esc(account.id)}">
    <div class="panel-head">
      <div><strong>${esc(account.domain)}</strong><p class="hint">${esc(account.username)}</p></div>
      <span class="tag tone-safe">${account.history.length} ver</span>
    </div>
    <div class="secret-row">
      <span>${mask(account.password)}</span>
      <div class="quick-actions">
        <button class="icon-button" data-act="copy" data-id="${esc(account.id)}" type="button"><span data-icon="copy"></span></button>
        <button class="icon-button" data-act="detail" data-id="${esc(account.id)}" type="button"><span data-icon="account"></span></button>
      </div>
    </div>
  </article>`;
}

function historyCard(entry, index) {
  return `<article class="history-item"><div class="history-row">
    <div><strong style="font-family:monospace;font-size:12px">${mask(entry.password)}</strong><p class="hint">${fmtDate(entry.changedAt)}</p></div>
    <button class="btn btn-secondary" data-restore="${index}" type="button"><span data-icon="restore"></span>Khôi phục</button>
  </div></article>`;
}

function genHistoryCard(entry, index) {
  return `<article class="history-item"><div class="history-row">
    <div><strong class="generated-secret" data-gen-secret="${index}" style="font-family:monospace;font-size:12px">${mask(entry.password)}</strong><p class="hint">${fmtDate(entry.changedAt || entry.createdAt || new Date().toISOString())}</p></div>
    <div class="quick-actions">
      <button class="icon-button" data-gen-hist-copy="${index}" type="button" title="Sao chép"><span data-icon="copy"></span></button>
      <button class="icon-button" data-gen-hist-reveal="${index}" type="button" title="Giữ chuột để hiện mật khẩu"><span data-icon="eye"></span></button>
    </div>
  </div></article>`;
}

function emptyState(text) {
  return `<div class="empty-state"><span data-icon="search"></span><p class="hint">${esc(text)}</p></div>`;
}

function dashboardSuggestionsHTML() {
  const suggestions = getSuggestions(searchQuery);

  if (!suggestions.length) {
    return "";
  }

  return `<div class="suggestions">${suggestions.map((word) => `<button class="mini-chip tone-neutral" data-suggest="${esc(word)}">${esc(word)}</button>`).join("")}</div>`;
}

function dashboardResultsHTML() {
  const accounts = getFilteredAccounts();

  return accounts.length
    ? `<div class="account-list">${accounts.map(accountCard).join("")}</div>`
    : emptyState("Không tìm thấy tài khoản phù hợp.");
}

function bindScreen() {
  document.getElementById("btn-google")?.addEventListener("click", handleGoogleSignIn);
  document.getElementById("form-onboard")?.addEventListener("submit", handleOnboard);
  document.getElementById("btn-ob-gen")?.addEventListener("click", handleOnboardGenerate);
  document.getElementById("form-unlock")?.addEventListener("submit", handleUnlock);
  document.getElementById("mp-create")?.addEventListener("input", (event) => {
    updateStrengthMeter("ob", event.currentTarget.value);
  });

  const searchInput = document.getElementById("dash-search");
  searchInput?.addEventListener("input", handleDashboardSearchInput);
  document.getElementById("dash-suggestions-host")?.addEventListener("click", handleDashboardSuggestionClick);

  document.getElementById("btn-add")?.addEventListener("click", () => openDialog());
  document.getElementById("dash-results-host")?.addEventListener("click", handleDashboardResultsClick);

  document.getElementById("btn-back")?.addEventListener("click", () => navigate("dashboard"));
  document.getElementById("btn-copy-pw")?.addEventListener("click", () => {
    const account = getSelectedAccount();
    if (account) {
      copyText(account.password);
    }
  });
  document.getElementById("btn-edit-acct")?.addEventListener("click", () => {
    const account = getSelectedAccount();
    if (account) {
      openDialog(account);
    }
  });
  document.getElementById("btn-del-acct")?.addEventListener("click", handleDelete);
  document.querySelectorAll("[data-restore]").forEach((button) => {
    button.addEventListener("click", () => handleRestore(Number(button.dataset.restore)));
  });

  document.getElementById("btn-gen-refresh")?.addEventListener("click", handleGeneratePassword);
  document.getElementById("btn-gen-copy")?.addEventListener("click", handleCopyGeneratedPassword);
  document.getElementById("btn-gen-history")?.addEventListener("click", () => navigate("genHistory"));
  document.getElementById("btn-back-gen")?.addEventListener("click", () => navigate("generator"));
  document.getElementById("btn-clear-gen-history")?.addEventListener("click", handleClearGeneratorHistory);
  document.querySelectorAll("[data-gen-hist-copy]").forEach((button) => {
    button.addEventListener("click", () => {
      const entry = (state.generatorHistory || [])[Number(button.dataset.genHistCopy)];
      if (entry) {
        copyText(entry.password, "Đã sao chép mật khẩu trong history.");
      }
    });
  });
  document.querySelectorAll("[data-gen-hist-reveal]").forEach((button) => {
    const entry = (state.generatorHistory || [])[Number(button.dataset.genHistReveal)];
    const secret = document.querySelector(`[data-gen-secret="${button.dataset.genHistReveal}"]`);

    if (!entry || !secret) {
      return;
    }

    const show = () => { secret.textContent = entry.password; };
    const hide = () => { secret.textContent = mask(entry.password); };

    button.addEventListener("mouseenter", show);
    button.addEventListener("mouseleave", hide);
    button.addEventListener("focus", show);
    button.addEventListener("blur", hide);
  });

  ["gen-len", "ck-upper", "ck-lower", "ck-num", "ck-sym"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", handleGeneratorOptionChange);
  });

  document.getElementById("set-autolock")?.addEventListener("change", handleSettings);
  document.getElementById("set-theme")?.addEventListener("change", handleSettings);
  document.getElementById("btn-logout")?.addEventListener("click", handleLock);
  document.getElementById("btn-reset-vault")?.addEventListener("click", handleResetVault);
}

function syncMeters() {
  const onboardPassword = document.getElementById("mp-create")?.value || "";
  updateStrengthMeter("ob", onboardPassword);
  try {
    syncGeneratorPreview();
  } catch (error) {
    showFlash(error.message);
  }
}

function updateStrengthMeter(prefix, password) {
  const fill = document.getElementById(`${prefix}-fill`);
  const label = document.getElementById(`${prefix}-label`);
  const hint = document.getElementById(`${prefix}-hint`);
  if (!fill || !label) {
    return;
  }

  const strength = estimatePasswordStrength(password || "");
  fill.style.width = `${Math.round(strength.score)}%`;
  label.textContent = strength.label;
  if (hint) {
    hint.textContent = strength.feedback;
  }
}

function handleOnboardGenerate(event) {
  event.preventDefault();
  const password = generateSecurePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true });
  const createInput = document.getElementById("mp-create");
  const confirmInput = document.getElementById("mp-confirm");

  if (createInput) {
    createInput.value = password;
    createInput.type = "text";
  }

  if (confirmInput) {
    confirmInput.value = password;
  }

  updateStrengthMeter("ob", password);
}

function readChromeProfileUserInfo() {
  return new Promise((resolve, reject) => {
    const done = (info) => {
      const runtimeError = globalThis.chrome?.runtime?.lastError;
      if (runtimeError) {
        reject(new Error(runtimeError.message));
        return;
      }

      resolve(info || {});
    };

    try {
      chrome.identity.getProfileUserInfo({ accountStatus: "ANY" }, done);
    } catch {
      try {
        chrome.identity.getProfileUserInfo(done);
      } catch (error) {
        reject(error);
      }
    }
  });
}

async function handleGoogleSignIn(event) {
  event?.preventDefault();

  if (!globalThis.chrome?.identity?.getProfileUserInfo) {
    showFlash("Chrome Identity API chưa khả dụng trong môi trường này.");
    return;
  }

  try {
    const info = await readChromeProfileUserInfo();

    if (!info.email) {
      showFlash("Chrome chưa trả email. Hãy reload extension và kiểm tra Chrome profile.");
      return;
    }

    const email = normalizeEmail(info.email);
    await writeActiveProfileEmail(email);

    let rawState = await readStorage(email);

    if (!rawState) {
      const legacyState = await readLegacyStorage();
      const legacyEmail = normalizeEmail(legacyState?.googleEmail);
      if (legacyState?.masterCredential && (!legacyEmail || legacyEmail === email)) {
        rawState = { ...legacyState, googleEmail: email };
        await writeStorage(rawState, email);
      }
    }

    state = normalize(rawState);
    state.googleEmail = email;
    state.pendingCapture = await readPendingCapture();
    rebuildAccountIndex();
    applyTheme();

    showFlash(`Đã mở profile Google: ${email}`);

    if (!state.masterCredential) {
      navigate("onboarding");
      return;
    }

    navigate(state.locked ? "unlock" : "dashboard");
  } catch (error) {
    showFlash(`Không đăng nhập Google được: ${error.message}`);
  }
}

async function handleOnboard(event) {
  event.preventDefault();
  const password = document.getElementById("mp-create")?.value || "";
  const confirmPassword = document.getElementById("mp-confirm")?.value || "";

  if (password !== confirmPassword) {
    showFlash("Hai mật khẩu chưa khớp.");
    return;
  }

  if (estimatePasswordStrength(password).score < 65) {
    showFlash("Mật khẩu còn yếu.");
    return;
  }

  const credential = await hashMasterPassword(password);
  masterPasswordCache = password;
  state = {
    ...state,
    storageMode: "encrypted",
    masterCredential: credential,
    locked: false,
    accounts: state.accounts.length ? state.accounts : createSampleAccounts(),
    selectedAccountId: state.selectedAccountId || "acct-github"
  };

  await saveState();
  resetAutoLockAlarm();
  showFlash("Đã tạo vault và mã hóa dữ liệu mẫu.");
  navigate("dashboard");
}

async function handleUnlock(event) {
  event.preventDefault();
  const password = document.getElementById("mp-unlock")?.value || "";

  try {
    const ok = await verifyMasterPassword(password, state.masterCredential);
    if (!ok) {
      showFlash("Master password không đúng.");
      return;
    }

    const payload = state.encryptedVault
      ? JSON.parse(await decryptAES(state.encryptedVault, password, state.masterCredential.salt))
      : { accounts: createSampleAccounts(), generatorHistory: [], selectedAccountId: "acct-github" };

    masterPasswordCache = password;
    state.accounts = Array.isArray(payload.accounts) ? payload.accounts : [];
    state.generatorHistory = Array.isArray(payload.generatorHistory) ? payload.generatorHistory : [];
    state.selectedAccountId = payload.selectedAccountId || state.accounts[0]?.id || null;
    state.locked = false;
    rebuildAccountIndex();

    await saveState();
    resetAutoLockAlarm();
    showFlash("Đã mở khóa vault.");
    navigate("dashboard");
  } catch (error) {
    showFlash(`Không mở khóa được vault: ${error.message}`);
  }
}

async function handleLock() {
  if (!state.masterCredential) {
    return;
  }

  state.locked = true;
  state.accounts = [];
  state.generatorHistory = [];
  rebuildAccountIndex();
  masterPasswordCache = null;
  searchQuery = "";
  generatedPassword = "";
  await clearSessionVault();
  await clearPendingCapture();
  await saveState();
  navigate("unlock");
}

async function handleAccountSubmit(event) {
  event.preventDefault();

  const id = $.acctId.value || `acct-${Date.now()}`;
  const existing = getAccountById(id);
  const newPassword = $.acctPass.value.trim();
  let history = existing?.history ? [...existing.history] : [];

  if (existing && existing.password !== newPassword) {
    const stack = new PasswordStack(history, MAX_HISTORY);
    if (stack.isDuplicate(newPassword)) {
      showFlash("Mật khẩu này đã từng dùng trước đó.");
      return;
    }

    stack.push(existing.password);
    history = stack.toArray();
  }

  const account = {
    id,
    domain: $.acctDomain.value.trim(),
    username: $.acctUser.value.trim(),
    password: newPassword,
    notes: $.acctNotes.value.trim(),
    updatedAt: new Date().toISOString(),
    history
  };

  state.accounts = [account, ...state.accounts.filter((entry) => entry.id !== id)]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
  rebuildAccountIndex();
  state.pendingCapture = null;
  state.selectedAccountId = id;
  await clearPendingCapture();

  await saveState();
  $.dialog.close();
  showFlash(`Đã lưu ${account.domain}.`);
  navigate("detail");
}

async function handleDelete() {
  const account = getSelectedAccount();
  if (!account) {
    return;
  }

  state.accounts = state.accounts.filter((entry) => entry.id !== account.id);
  rebuildAccountIndex();
  state.selectedAccountId = state.accounts[0]?.id || null;
  await saveState();
  showFlash(`Đã xóa ${account.domain}.`);
  navigate("dashboard");
}

async function handleRestore(index) {
  const account = getSelectedAccount();
  if (!account) {
    return;
  }

  const stack = new PasswordStack(account.history, MAX_HISTORY);
  const restored = stack.restoreAt(index, account.password);
  if (!restored) {
    showFlash("Không khôi phục được mật khẩu.");
    return;
  }

  account.password = restored.restoredPassword;
  account.history = stack.toArray();
  account.updatedAt = new Date().toISOString();
  await saveState();
  showFlash("Đã khôi phục mật khẩu cũ.");
  render();
}

async function handleGeneratePassword() {
  try {
    syncGeneratorPreview();
    if (generatedPassword && generatedPassword !== "-") {
      await addToGenHistory(generatedPassword);
    }
    updateGeneratorView();
  } catch (error) {
    showFlash(error.message);
  }
}

async function handleCopyGeneratedPassword() {
  const password = document.getElementById("gen-text")?.textContent || generatedPassword;

  if (!password || password === "-") {
    return;
  }

  await addToGenHistory(password);
  await copyText(password, "Đã sao chép mật khẩu vừa sinh.");
  updateGeneratorView();
}

function handleGeneratorOptionChange() {
  try {
    syncGeneratorPreview();
  } catch (error) {
    showFlash(error.message);
  }
}

async function handleClearGeneratorHistory() {
  state.generatorHistory = [];
  await saveState();
  showFlash("Đã xóa lịch sử.");
  render();
}

async function addToGenHistory(password) {
  const normalizedHistory = (state.generatorHistory || [])
    .filter((entry) => entry?.password)
    .map((entry) => ({
      password: entry.password,
      changedAt: entry.changedAt || entry.createdAt || new Date().toISOString()
    }));
  const stack = PasswordStack.fromArray(normalizedHistory, 50);
  stack.push(password);
  state.generatorHistory = stack.toArray();
  await saveState();
}

async function handleSettings() {
  state.settings.autoLockMinutes = Number(document.getElementById("set-autolock")?.value || 5);
  state.settings.theme = normalizeTheme(document.getElementById("set-theme")?.value || "mono");
  state.settings.language = "vi";
  await saveState();
  resetAutoLockAlarm();
  applyTheme();
  showFlash("Đã cập nhật cài đặt.");
  render();
}

async function handleBanner(event) {
  if (event.currentTarget.dataset.banner === "dismiss") {
    state.pendingCapture = null;
    await clearPendingCapture();
    await saveState();
    render();
    return;
  }

  openDialog(null, state.pendingCapture);
}

async function handleResetVault() {
  const currentEmail = normalizeEmail(state.googleEmail);

  await removeProfileStorage(currentEmail);

  await clearSessionVault();
  await clearPendingCapture();

  state = createDefaultState();
  state.googleEmail = currentEmail;
  rebuildAccountIndex();
  masterPasswordCache = null;
  searchQuery = "";
  generatedPassword = "";
  currentScreen = currentEmail ? "onboarding" : "welcome";
  activeTab = "vault";
  showFlash("Đã xóa dữ liệu vault.");
  render();
}

function handleDialogGenerate() {
  const password = generateSecurePassword({ length: 18, uppercase: true, lowercase: true, numbers: true, symbols: true });
  $.acctPass.value = password;
}

function handleDashboardSearchInput(event) {
  searchQuery = event.currentTarget.value;
  updateDashboardSearchView();
}

function handleDashboardSuggestionClick(event) {
  const button = event.target.closest("[data-suggest]");
  if (!button) {
    return;
  }

  searchQuery = button.dataset.suggest || "";
  const searchInput = document.getElementById("dash-search");
  if (searchInput) {
    searchInput.value = searchQuery;
    searchInput.focus({ preventScroll: true });
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length);
  }

  updateDashboardSearchView();
}

function handleDashboardResultsClick(event) {
  const actionButton = event.target.closest("[data-act]");
  if (actionButton) {
    event.stopPropagation();
    const account = getAccountById(actionButton.dataset.id);
    if (!account) {
      return;
    }

    if (actionButton.dataset.act === "copy") {
      copyText(account.password);
      return;
    }

    state.selectedAccountId = account.id;
    navigate("detail");
    return;
  }

  const card = event.target.closest(".account-card[data-id]");
  if (!card) {
    return;
  }

  state.selectedAccountId = card.dataset.id;
  navigate("detail");
}

function updateDashboardSearchView() {
  if (currentScreen !== "dashboard") {
    return;
  }

  const suggestionsHost = document.getElementById("dash-suggestions-host");
  if (suggestionsHost) {
    suggestionsHost.innerHTML = dashboardSuggestionsHTML();
  }

  const resultsHost = document.getElementById("dash-results-host");
  if (resultsHost) {
    resultsHost.innerHTML = dashboardResultsHTML();
  }

  renderIcons($.stage);
}

function updateGeneratorView() {
  if (currentScreen !== "generator") {
    return;
  }

  const passwordText = document.getElementById("gen-text");
  const lengthLabel = document.getElementById("gen-len-label");
  const historyCount = document.getElementById("gen-history-count");

  if (passwordText) {
    passwordText.textContent = generatedPassword || "-";
  }

  if (lengthLabel) {
    lengthLabel.textContent = String(getGeneratorOptions().length);
  }

  if (historyCount) {
    historyCount.textContent = String((state.generatorHistory || []).length);
  }

  updateStrengthMeter("gen", generatedPassword);
}

function syncGeneratorPreview() {
  if (currentScreen !== "generator") {
    return false;
  }

  generatedPassword = generatePasswordFromControls();
  updateGeneratorView();
  return true;
}

function openDialog(account = null, seed = null) {
  const source = seed || {};
  $.dialogTitle.textContent = account ? "Sửa tài khoản" : "Thêm tài khoản";
  $.acctId.value = account?.id || "";
  $.acctDomain.value = source.domain || account?.domain || "";
  $.acctUser.value = source.username || account?.username || "";
  $.acctPass.value = source.password || account?.password || "";
  $.acctNotes.value = source.notes || account?.notes || "";
  $.dialog.showModal();
  renderIcons($.dialog);
}

function getGeneratorOptions() {
  return {
    length: Number(document.getElementById("gen-len")?.value || 18),
    uppercase: document.getElementById("ck-upper")?.checked ?? true,
    lowercase: document.getElementById("ck-lower")?.checked ?? true,
    numbers: document.getElementById("ck-num")?.checked ?? true,
    symbols: document.getElementById("ck-sym")?.checked ?? true
  };
}

function generatePasswordFromControls() {
  return generateSecurePassword(getGeneratorOptions());
}

function getAccountById(id) {
  return accountIndex.get(id);
}

function getSelectedAccount() {
  return getAccountById(state.selectedAccountId) || state.accounts[0] || null;
}

function getFilteredAccounts() {
  const query = searchQuery.trim();
  return query ? filterAccountsWithKmp(state.accounts, query) : state.accounts;
}

function buildAutocompleteWords() {
  const words = [];

  state.accounts.forEach((account) => {
    if (account.domain) {
      words.push(account.domain.toLowerCase());
    }

    if (account.username) {
      words.push(account.username.toLowerCase());
    }
  });

  return [...new Set(words)];
}

function getSuggestions(query) {
  const prefix = query.trim().toLowerCase();
  if (!prefix) {
    return [];
  }

  const trie = new Trie();
  buildAutocompleteWords().forEach((word) => trie.insert(word));
  return trie.suggest(prefix, 6);
}

function getAlgorithmStats() {
  const report = accountIndex.collisionReport();

  return {
    accounts: accountIndex.size,
    collisions: report.filter((entry) => entry.collided).length,
    trieWords: buildAutocompleteWords().length,
    kmpMatches: searchQuery.trim() ? getFilteredAccounts().length : state.accounts.length,
    history: state.accounts.reduce((total, account) => total + account.history.length, 0)
  };
}

function ensureSelectedAccount() {
  if (!state.accounts.length) {
    state.selectedAccountId = null;
    return;
  }

  if (!getAccountById(state.selectedAccountId)) {
    state.selectedAccountId = state.accounts[0].id;
  }
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function mask(password) {
  if (!password) {
    return "";
  }

  if (password.length <= 4) {
    return "*".repeat(password.length);
  }

  return password.slice(0, 2) + "*".repeat(Math.max(4, password.length - 4)) + password.slice(-2);
}

function fmtDate(value) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function showFlash(text) {
  flash = text;
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => {
    flash = null;
    renderBanner();
  }, 2400);
  renderBanner();
}

function resetAutoLockAlarm() {
  globalThis.chrome?.runtime?.sendMessage?.({
    type: "resetAutoLock",
    minutes: state.settings.autoLockMinutes
  });
}

async function copyText(value, text = "Đã sao chép mật khẩu.") {
  if (!value) {
    return;
  }

  try {
    await navigator.clipboard.writeText(value);
    showFlash(text);
  } catch {
    showFlash("Clipboard không khả dụng.");
  }
}
