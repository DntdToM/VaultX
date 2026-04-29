/**
 * @file trie.js
 * @description Gợi ý từ tiếp theo (Autocomplete) khi người dùng nhập dữ liệu trên SearchBar bằng CTDL Trie.
 */

class TrieNode {
  /**
   * Node trong Trie, dùng để lưu ký tự và các node con.
   */
  constructor() {
    this.children = new Map();
    this.isTerminal = false;
  }
}

/**
 * Trie dùng để lưu các chuỗi và hỗ trợ gợi ý theo tiền tố.
 *
 * Chức năng chính:
 * - insert
 * - collect
 * - suggest
 */
export class Trie {
  /**
   * Tạo một Trie mới với node gốc.
   */
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Thêm một chuỗi vào Trie.
   *
   * @param {string} word
   * @returns {void}
   */
  insert(word) {
    let curNode = this.root;

    for (const char of word) {
      if (!curNode.children.has(char)) {
        curNode.children.set(char, new TrieNode());
      }

      curNode = curNode.children.get(char);
    }

    curNode.isTerminal = true;
  }

  /**
   * Duyệt từ node hiện tại để gom các từ hợp lệ.
   *
   * @param {TrieNode} node
   * @param {string} currentWord
   * @param {string[]} results
   * @param {number} limit
   * @returns {void}
   */
  collect(node, currentWord, results, limit) {
    if (results.length >= limit) {
      return;
    }

    if (node.isTerminal) {
      results.push(currentWord);
    }

    for (const [char, childNode] of node.children.entries()) {
      if (results.length >= limit) {
        return;
      }

      this.collect(childNode, currentWord + char, results, limit);
    }
  }

  /**
   * Tìm danh sách gợi ý bắt đầu bằng prefix.
   *
   * @param {string} prefix
   * @param {number} [limit=6]
   * @returns {string[]}
   */
  suggest(prefix, limit = 6) {
    let curNode = this.root;

    for (const char of prefix) {
      if (!curNode.children.has(char)) {
        return [];
      }

      curNode = curNode.children.get(char);
    }

    const results = [];
    this.collect(curNode, prefix, results, limit);
    return results;
  }
}
