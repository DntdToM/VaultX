import { generateSecurePassword } from "../logic/cryptography.js";

const STORAGE_KEY = "vaultxState";
const ACTIVE_PROFILE_KEY = "vaultxActiveGoogleEmail";
const SESSION_KEY = "vaultxSessionVault";
const PENDING_CAPTURE_KEY = "vaultxPendingCapture";
const AUTO_LOCK_ALARM = "vaultx-auto-lock";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function profileStorageKey(email) {
  const normalizedEmail = normalizeEmail(email);
  return normalizedEmail ? `${STORAGE_KEY}:${normalizedEmail}` : STORAGE_KEY;
}

function createDefaultState() {
  return {
    storageMode: "encrypted",
    googleEmail: null,
    masterCredential: null,
    encryptedVault: null,
    locked: true,
    accounts: [],
    settings: {
      autoLockMinutes: 5,
      language: "vi",
      theme: "mono"
    },
    selectedAccountId: null,
    generatorHistory: []
  };
}

function readState() {
  return chrome.storage.local.get(ACTIVE_PROFILE_KEY).then((profileResult) => {
    const activeEmail = normalizeEmail(profileResult[ACTIVE_PROFILE_KEY]);
    if (!activeEmail) {
      return createDefaultState();
    }

    const key = profileStorageKey(activeEmail);
    return chrome.storage.local.get(key).then((result) => {
      const state = result[key];
      return state || createDefaultState();
    });
  });
}

function writeState(nextState) {
  return chrome.storage.local.get(ACTIVE_PROFILE_KEY).then((profileResult) => {
    const activeEmail = normalizeEmail(profileResult[ACTIVE_PROFILE_KEY] || nextState.googleEmail);
    if (!activeEmail) {
      return Promise.resolve();
    }

    const key = profileStorageKey(activeEmail);
    return chrome.storage.local.set({ [key]: nextState });
  });
}

function readLegacyState() {
  return chrome.storage.local.get(STORAGE_KEY).then((result) => {
    const state = result[STORAGE_KEY];
    return state || createDefaultState();
  });
}

function readSessionVault() {
  if (!chrome.storage.session) {
    return Promise.resolve(null);
  }

  return chrome.storage.session.get(SESSION_KEY).then((result) => result[SESSION_KEY] || null);
}

function writePendingCapture(payload) {
  if (!chrome.storage.session) {
    return Promise.reject(new Error("chrome.storage.session khong kha dung."));
  }

  return chrome.storage.session.set({
    [PENDING_CAPTURE_KEY]: {
      ...payload,
      capturedAt: new Date().toISOString()
    }
  });
}

function resolveCredentialForHostname(accounts = [], hostname = "") {
  const normalizedHost = hostname.replace(/^www\./, "").toLowerCase();

  return accounts.find((account) => {
    const normalizedDomain = account.domain.replace(/^www\./, "").toLowerCase();
    return normalizedHost === normalizedDomain || normalizedHost.endsWith(`.${normalizedDomain}`);
  }) || null;
}

function resetAutoLockAlarm(minutes = 5) {
  chrome.alarms.clear(AUTO_LOCK_ALARM);
  if (minutes > 0) {
    chrome.alarms.create(AUTO_LOCK_ALARM, { delayInMinutes: minutes });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const activeProfile = await chrome.storage.local.get(ACTIVE_PROFILE_KEY);
  if (!activeProfile[ACTIVE_PROFILE_KEY]) {
    const legacyState = await readLegacyState();
    if (legacyState.googleEmail) {
      await chrome.storage.local.set({ [ACTIVE_PROFILE_KEY]: normalizeEmail(legacyState.googleEmail) });
    }
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== AUTO_LOCK_ALARM) {
    return;
  }

  const state = await readState();
  if (state && !state.locked) {
    state.locked = true;
    await writeState(state);
    if (chrome.storage.session) {
      await chrome.storage.session.remove([SESSION_KEY, PENDING_CAPTURE_KEY]);
    }
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "captureCredential") {
    writePendingCapture(message.payload)
      .then(() => sendResponse({ ok: true }))
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }

  if (message?.type === "getCredentialSuggestion") {
    readSessionVault()
      .then((sessionVault) => {
        const accounts = sessionVault?.accounts || [];
        const credential = resolveCredentialForHostname(accounts, message.hostname || "");
        sendResponse({ ok: true, credential });
      })
      .catch((error) => sendResponse({ ok: false, error: error.message }));

    return true;
  }

  if (message?.type === "generatePassword") {
    try {
      const password = generateSecurePassword({
        length: message.length || 20,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
      });

      sendResponse({ ok: true, password });
    } catch (error) {
      sendResponse({ ok: false, error: error.message });
    }

    return false;
  }

  if (message?.type === "resetAutoLock") {
    const minutes = message.minutes || 5;
    resetAutoLockAlarm(minutes);
    sendResponse({ ok: true });
    return false;
  }

  return false;
});
