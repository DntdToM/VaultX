/**
 * @file kmp.js
 * @description KMP giải quyết string-matching -> tìm kiếm chuỗi con trong chuỗi lớn.
 * => Lọc kết quả hiển thị != Autocomplete
 */

/**
 * Tạo bảng prefix cho chuỗi pattern.
 *
 * Bảng này giúp thuật toán KMP biết khi bị lệch thì phải quay lại đâu,
 * thay vì so sánh lại từ đầu như cách brute force.
 *
 * @param {string} pattern
 * @returns {number[]}
 */
export function buildPrefixTable(pattern) {
  if (pattern === "") {
    return [];
  }

  const prefixTable = new Array(pattern.length).fill(0);
  let length = 0;
  let i = 1;

  while (i < pattern.length) {
    if (pattern[i] === pattern[length]) {
      length += 1;
      prefixTable[i] = length;
      i += 1;
    } else if (length !== 0) {
      length = prefixTable[length - 1];
    } else {
      prefixTable[i] = 0;
      i += 1;
    }
  }

  return prefixTable;
}

/**
 * Kiểm tra pattern có xuất hiện trong text hay không bằng thuật toán KMP.
 *
 * @param {string} text
 * @param {string} pattern
 * @returns {boolean}
 */
export function kmpIncludes(text, pattern) {
  if (pattern === "") {
    return true;
  }

  const prefixTable = buildPrefixTable(pattern);
  let i = 0;
  let j = 0;

  while (i < text.length) {
    if (text[i] === pattern[j]) {
      i += 1;
      j += 1;

      if (j === pattern.length) {
        return true;
      }
    } else if (j !== 0) {
      j = prefixTable[j - 1];
    } else {
      i += 1;
    }
  }

  return false;
}

/**
 * Lọc danh sách account bằng KMP.
 *
 * Nếu query xuất hiện trong domain, username hoặc notes,
 * account đó sẽ được giữ lại.
 *
 * @param {Array<{domain: string, username: string, notes?: string}>} accounts
 * @param {string} query
 * @returns {Array<object>}
 */
export function filterAccountsWithKmp(accounts, query) {
  if (query === "") {
    return accounts;
  }

  const results = [];
  const normalizedQuery = query.toLowerCase();

  for (const account of accounts) {
    const domain = String(account?.domain ?? "").toLowerCase();
    const username = String(account?.username ?? "").toLowerCase();
    const notes = String(account?.notes ?? "").toLowerCase();

    if (
      kmpIncludes(domain, normalizedQuery) ||
      kmpIncludes(username, normalizedQuery) ||
      kmpIncludes(notes, normalizedQuery)
    ) {
      results.push(account);
    }
  }

  return results;
}
