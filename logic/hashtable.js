/**
 * @file hashtable.js
 * @description HashTable dùng để lưu dữ liệu theo cặp khóa - giá trị.
 *
 * Trong dự án VaultX, HashTable có thể dùng để:
 * - lưu account theo id
 * - tìm dữ liệu nhanh hơn so với duyệt mảng
 * - hỗ trợ xem, sửa, xóa account
 */

/**
 * HashTable có xử lý va chạm bằng chaining.
 *
 * Mỗi bucket có thể là:
 * - null nếu chưa có dữ liệu
 * - hoặc là một mảng các cặp [key, value] nếu có va chạm
 */
export class HashTable {
  /**
   * @param {number} [bucketCount=29]
   */
  constructor(bucketCount = 29) {
    this.bucketCount = bucketCount;
    this.buckets = new Array(bucketCount).fill(null);
    this.size = 0;
  }

  /**
   * Tính chỉ số băm cho một key.
   *
   * @param {string} key
   * @returns {number}
   */
  hash(key) {
    const normalizedKey = String(key);
    let total = 0;

    for (let i = 0; i < normalizedKey.length; i += 1) {
      total += (i + 1) * normalizedKey.charCodeAt(i);
    }

    return total % this.bucketCount;
  }

  /**
   * Thêm hoặc cập nhật một cặp key-value.
   *
   * @param {string} key
   * @param {unknown} value
   * @returns {HashTable}
   */
  set(key, value) {
    const index = this.hash(key);

    if (this.buckets[index] === null) {
      this.buckets[index] = [];
    }

    for (let i = 0; i < this.buckets[index].length; i += 1) {
      const [oldKey] = this.buckets[index][i];

      if (oldKey === key) {
        this.buckets[index][i] = [key, value];
        return this;
      }
    }

    this.buckets[index].push([key, value]);
    this.size += 1;
    return this;
  }

  /**
   * Lấy value từ key.
   *
   * @param {string} key
   * @returns {unknown}
   */
  get(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    if (bucket === null) {
      return null;
    }

    for (const [oldKey, oldValue] of bucket) {
      if (oldKey === key) {
        return oldValue;
      }
    }

    return null;
  }

  /**
   * Kiểm tra key có tồn tại hay không.
   *
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    if (bucket === null) {
      return false;
    }

    for (const [oldKey] of bucket) {
      if (oldKey === key) {
        return true;
      }
    }

    return false;
  }

  /**
   * Xóa một key khỏi HashTable.
   *
   * @param {string} key
   * @returns {boolean}
   */
  remove(key) {
    const index = this.hash(key);
    const bucket = this.buckets[index];

    if (bucket === null) {
      return false;
    }

    for (let i = 0; i < bucket.length; i += 1) {
      const [oldKey] = bucket[i];

      if (oldKey === key) {
        bucket.splice(i, 1);
        this.size -= 1;

        if (bucket.length === 0) {
          this.buckets[index] = null;
        }

        return true;
      }
    }

    return false;
  }

  /**
   * Xóa toàn bộ dữ liệu trong HashTable.
   *
   * @returns {void}
   */
  clear() {
    this.buckets = new Array(this.bucketCount).fill(null);
    this.size = 0;
  }

  /**
   * Lấy tất cả cặp key-value trong bảng băm.
   *
   * @returns {Array<[string, unknown]>}
   */
  entries() {
    const result = [];

    for (const bucket of this.buckets) {
      if (bucket !== null) {
        result.push(...bucket);
      }
    }

    return result;
  }

  /**
   * Lấy tất cả value trong bảng băm.
   *
   * @returns {Array<unknown>}
   */
  values() {
    const result = [];

    for (const bucket of this.buckets) {
      if (bucket !== null) {
        for (const [, value] of bucket) {
          result.push(value);
        }
      }
    }

    return result;
  }

  /**
   * Trả về báo cáo va chạm của từng bucket.
   *
   * @returns {Array<{bucket: number, items: number, collided: boolean}>}
   */
  collisionReport() {
    const report = [];

    for (let index = 0; index < this.buckets.length; index += 1) {
      const bucket = this.buckets[index];
      const itemCount = bucket === null ? 0 : bucket.length;

      report.push({
        bucket: index,
        items: itemCount,
        collided: itemCount > 1
      });
    }

    return report;
  }
}
