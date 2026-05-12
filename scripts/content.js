const TRIGGER_CLASS = "vaultx-input-trigger";

const MENU_CLASS = "vaultx-input-menu";

const TOAST_CLASS = "vaultx-smart-toast";

const PROCESSED_INPUT = "data-vaultx-bound";

const PROCESSED_FORM = "data-vaultx-form-bound";

let openMenu = null;

injectStyles();
bindExistingInputs();
observePage();

function injectStyles() {
  if (document.getElementById("vaultx-styles")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "vaultx-styles";
  style.textContent = `
    .${TRIGGER_CLASS} {
      position: absolute;
      top: 50%;
      right: 8px;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 10px;
      background: #111;
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999998;
    }

    .${TRIGGER_CLASS} svg {
      width: 16px;
      height: 16px;
      fill: none;
      stroke: currentColor;
      stroke-width: 1.8;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .${MENU_CLASS},
    .${TOAST_CLASS} {
      font-family: "IBM Plex Sans", "Aptos", "Segoe UI", sans-serif;
      color: #222;
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(0, 0, 0, 0.14);
      box-shadow: 0 16px 40px rgba(0,0,0,.16);
      backdrop-filter: blur(12px);
      z-index: 999999;
    }

    .${MENU_CLASS} {
      position: absolute;
      width: 220px;
      padding: 10px;
      border-radius: 16px;
      display: grid;
      gap: 8px;
    }

    .${MENU_CLASS} button,
    .${TOAST_CLASS} button {
      box-sizing: border-box;
      min-height: 38px;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      font: inherit;
    }

    .${MENU_CLASS} button {
      text-align: left;
      padding: 0 12px;
      background: rgba(0,0,0,.05);
      color: #222;
    }

    .${TOAST_CLASS} {
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: min(320px, calc(100vw - 32px));
      padding: 14px;
      border-radius: 18px;
      display: grid;
      gap: 12px;
    }

    .${TOAST_CLASS} strong {
      color: #111;
      font-size: 14px;
    }

    .${TOAST_CLASS} p {
      margin: 4px 0 0;
      color: #666;
      font-size: 12px;
    }

    .vaultx-toast-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
    }

    .${TOAST_CLASS} button {
      appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: auto;
      max-width: 100%;
      padding: 0 14px;
      line-height: 1.2;
      white-space: nowrap;
    }

    .vaultx-btn-secondary {
      background: rgba(0,0,0,.06);
      color: #222;
      flex: 0 0 auto;
    }

    .vaultx-btn-primary {
      background: #111;
      color: #fff;
      font-weight: 700;
      flex: 0 0 auto;
    }

    @media (max-width: 360px) {
      .vaultx-toast-actions {
        display: grid;
        grid-template-columns: 1fr;
      }

      .${TOAST_CLASS} button {
        width: 100%;
      }
    }
  `;
  document.head.appendChild(style);
}

function bindExistingInputs(root = document) {
  root.querySelectorAll('input[type="password"]').forEach(bindPasswordInput);
  root.querySelectorAll("form").forEach(bindFormSubmit);
}

function observePage() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) {
          return;
        }

        if (node.matches?.('input[type="password"], form')) {
          bindExistingInputs(node.parentElement || node);
          return;
        }

        bindExistingInputs(node);
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener("click", (event) => {
    if (openMenu && !openMenu.contains(event.target) && !event.target.closest(`.${TRIGGER_CLASS}`)) {
      closeMenu();
    }
  });
}

function bindPasswordInput(input) {
  if (!(input instanceof HTMLInputElement) || input.getAttribute(PROCESSED_INPUT)) {
    return;
  }

  const container = input.parentElement;
  if (!container) {
    return;
  }

  const computed = window.getComputedStyle(container);
  if (computed.position === "static") {
    container.style.position = "relative";
  }

  input.style.paddingRight = `${Math.max(42, parseFloat(window.getComputedStyle(input).paddingRight) + 36)}px`;
  const trigger = document.createElement("button");
  trigger.className = TRIGGER_CLASS;
  trigger.type = "button";
  trigger.setAttribute("aria-label", "VaultX");
  trigger.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 4.8-2.4 7.9-7 10-4.6-2.1-7-5.2-7-10V6l7-3Z"></path><path d="M9.5 12.5 11.5 14.5 15 10.5"></path></svg>';
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    toggleMenuForInput(input, trigger);
  });

  container.appendChild(trigger);
  input.setAttribute(PROCESSED_INPUT, "true");
}

function bindFormSubmit(form) {
  if (!(form instanceof HTMLFormElement) || form.getAttribute(PROCESSED_FORM)) {
    return;
  }

  if (!form.querySelector('input[type="password"]')) {
    return;
  }

  form.addEventListener("submit", () => {
    const payload = collectFormPayload(form);
    if (!payload.password) {
      return;
    }

    setTimeout(() => showSaveToast(payload), 150);
  });

  form.setAttribute(PROCESSED_FORM, "true");
}

function toggleMenuForInput(input, trigger) {
  if (openMenu) {
    closeMenu();
  }

  const menu = document.createElement("div");
  menu.className = MENU_CLASS;
  menu.innerHTML = `
    <button data-action="strong" type="button">Gợi ý mật khẩu mạnh</button>
    <button data-action="autofill" type="button">Tự động điền</button>
  `;

  const rect = trigger.getBoundingClientRect();
  menu.style.top = `${window.scrollY + rect.bottom + 8}px`;
  menu.style.left = `${Math.max(12, window.scrollX + rect.right - 220)}px`;

  menu.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.action === "strong") {
        const password = await requestGeneratePassword();
        if (password) {
          input.value = password;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      if (button.dataset.action === "autofill") {
        const suggestion = await requestCredentialSuggestion();
        if (suggestion?.password) {
          const usernameField = findUsernameField(input.form);
          if (usernameField) {
            usernameField.value = suggestion.username || "";
            usernameField.dispatchEvent(new Event("input", { bubbles: true }));
          }

          input.value = suggestion.password;
          input.dispatchEvent(new Event("input", { bubbles: true }));
        }
      }

      closeMenu();
    });
  });

  document.body.appendChild(menu);
  openMenu = menu;
}

function closeMenu() {
  openMenu?.remove();
  openMenu = null;
}

function collectFormPayload(form) {
  const passwordField = form.querySelector('input[type="password"]');
  const usernameField = findUsernameField(form);

  return {
    domain: location.hostname.replace(/^www\./, ""),
    username: usernameField?.value?.trim() || "",
    password: passwordField?.value?.trim() || ""
  };
}

function findUsernameField(scope) {
  if (!scope) {
    return null;
  }

  return scope.querySelector('input[type="email"], input[type="text"], input[name*="user" i], input[name*="email" i], input[name*="login" i]');
}

async function requestGeneratePassword(length = 20) {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { type: "generatePassword", length },
      (response) => {
        if (!response || response.ok === false) {
          resolve(null);
          return;
        }

        resolve(response.password || null);
      }
    );
  });
}

async function requestCredentialSuggestion() {
  if (!globalThis.chrome?.runtime?.sendMessage) {
    return null;
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        type: "getCredentialSuggestion",
        hostname: location.hostname
      },
      (response) => resolve(response?.credential || null)
    );
  });
}

function showSaveToast(payload) {
  document.querySelector(`.${TOAST_CLASS}`)?.remove();

  const toast = document.createElement("div");
  toast.className = TOAST_CLASS;
  toast.innerHTML = `
    <div>
      <strong>Lưu thông tin đăng nhập này vào VaultX?</strong>
      <p>${escapeHtml(payload.username || "Không rõ username")} trên ${escapeHtml(payload.domain)}</p>
    </div>
    <div class="vaultx-toast-actions">
      <button class="vaultx-btn-secondary" data-toast="dismiss" type="button">Bỏ qua</button>
      <button class="vaultx-btn-primary" data-toast="save" type="button">Lưu vào VaultX</button>
    </div>
  `;

  toast.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.toast === "dismiss") {
        toast.remove();
        return;
      }

      globalThis.chrome?.runtime?.sendMessage?.({
        type: "captureCredential",
        payload: {
          ...payload,
          notes: "Lưu từ trang đăng nhập"
        }
      });
      toast.remove();
    });
  });

  document.body.appendChild(toast);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
