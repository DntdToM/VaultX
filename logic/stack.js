/**
 * @file stack.js
 * @description Quản lý lịch sử mật khẩu cũ của tài khoản theo CTDL Stack.
 *
 * Mỗi phần tử trong stack có dạng:
 * {
 *   password: "mật-khẩu-cũ",
 *   changedAt: "thời-gian-đổi-mật-khẩu"
 * }
 */

/**
 * Lớp quản lý lịch sử mật khẩu cũ của một tài khoản.
 */
export class PasswordStack {
  /**
   * @param {Array<{password: string, changedAt: string}>} [initialItems=[]]
   * @param {number} [maxSize=20]
   */
  constructor(initialItems = [], maxSize = 20) {
    this.items = Array.isArray(initialItems) ? initialItems.slice(0, maxSize).map((item) => ({ ...item })) : [];
    this.maxSize = maxSize;
  }

  /**
   * Trả về số lượng phần tử hiện có.
   *
   * @returns {number}
   */
  get size() {
    return this.items.length;
  }

  /**
   * Kiểm tra stack có rỗng không.
   *
   * @returns {boolean}
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Thêm mật khẩu cũ vào đầu stack.
   *
   * @param {string} password
   * @param {string} [changedAt]
   * @returns {PasswordStack}
   */
  push(password, changedAt = new Date().toISOString()) {
    if (!password) {
      return this;
    }

    const newItem = {
      password,
      changedAt
    };

    this.items.unshift(newItem);

    if (this.items.length > this.maxSize) {
      this.items.pop();
    }

    return this;
  }

  /**
   * Lấy và xóa mật khẩu cũ gần nhất.
   *
   * @returns {{password: string, changedAt: string} | undefined}
   */
  pop() {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.items.shift();
  }

  /**
   * Xem mật khẩu cũ gần nhất nhưng không xóa.
   *
   * @returns {{password: string, changedAt: string} | undefined}
   */
  peek() {
    if (this.isEmpty()) {
      return undefined;
    }

    return this.items[0];
  }

  /**
   * Kiểm tra mật khẩu đã từng xuất hiện trong lịch sử hay chưa.
   *
   * @param {string} password
   * @returns {boolean}
   */
  isDuplicate(password) {
    for (const item of this.items) {
      if (item.password === password) {
        return true;
      }
    }

    return false;
  }

  /**
   * Khôi phục mật khẩu cũ tại vị trí index.
   *
   * @param {number} index
   * @param {string} currentPassword
   * @returns {{restoredPassword: string, changedAt: string} | null}
   */
  restoreAt(index, currentPassword) {
    if (index < 0 || index >= this.items.length) {
      return null;
    }

    const oldItem = this.items.splice(index, 1)[0];
    this.push(currentPassword);

    return {
      restoredPassword: oldItem.password,
      changedAt: oldItem.changedAt
    };
  }

  /**
   * Xóa toàn bộ lịch sử.
   *
   * @returns {PasswordStack}
   */
  clear() {
    this.items = [];
    return this;
  }

  /**
   * Trả về bản sao của lịch sử.
   *
   * @returns {Array<{password: string, changedAt: string}>}
   */
  toArray() {
    return this.items.map((item) => ({ ...item }));
  }

  /**
   * Tạo PasswordStack từ mảng dữ liệu có sẵn.
   *
   * @param {Array<{password: string, changedAt: string}>} data
   * @param {number} [maxSize=20]
   * @returns {PasswordStack}
   */
  static fromArray(data, maxSize = 20) {
    return new PasswordStack(data, maxSize);
  }
}
