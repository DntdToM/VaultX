"""
Gợi ý từ tiếp theo (Autocomplete) khi người dùng nhập dữ liệu trên SearchBar bằng CTDL Trie.

Version: Python
Last edit: 2026-04-26
Author: 25520260
"""


class TrieNode:
    """
    Node trong Trie, dùng để lưu ký tự và các node con.

    Mỗi node có:
    - children: dict chứa các node con.
    - is_end_of_word: đánh dấu đây có phải là điểm kết thúc của một từ hay không.
    """

    def __init__(self):
        """
        Khởi tạo một node rỗng.

        Args:
            None
        Returns:
            None

        {
            "children": 
            {
                "u": TrieNode,
                "a": TrieNode,
                ...
            },
            "is_end_of_word": True/False
        }        
        """
        self.children = {} 
        self.is_end_of_word = False


class Trie:
    """
    Trie dùng để lưu các chuỗi và hỗ trợ gợi ý theo tiền tố.

    Chức năng chính:
    - insert
    - collect
    - suggest
    """

    def __init__(self):
        """
        Tạo một Trie mới với node gốc.

        Args:
            None
        Returns:
            None
        """
        self.root = TrieNode()

    def insert(self, word):
        """
        Thêm một chuỗi vào Trie.

        Args:
            word: Chuỗi cần thêm vào Trie.
        Returns:
            None
        """
        cur_node = self.root
        for char in word:
            if char not in cur_node.children:
                cur_node.children[char] = TrieNode()
            cur_node = cur_node.children[char]
        cur_node.is_end_of_word = True

    def collect(self, node, cur_word, results, limit):
        """
        Duyệt từ node hiện tại để gom các từ hợp lệ.
        DFS Traversal để thu thập các chuỗi con bắt đầu từ node hiện tại.

        Args:
            node: Node hiện tại đang xét.
            current_word: Chuỗi đã ghép được đến node này.
            results: Danh sách kết quả đang thu thập.
            limit: Số lượng kết quả tối đa.
        Returns:
            None
        """
        if len(results) >= limit:
            return
        
        if node.is_end_of_word:
            results.append(cur_word)

        for char, child_node in node.children.items():
            self.collect(child_node, cur_word + char, results, limit)

    def suggest(self, prefix, limit = 6):
        """
        Tìm danh sách gợi ý bắt đầu bằng prefix.

        Args:
            prefix: Chuỗi tiền tố cần tìm.
            limit: Số lượng kết quả tối đa muốn lấy.
        Returns:
            List các chuỗi bắt đầu bằng prefix.
        """
        cur_node = self.root

        for char in prefix:
            if char not in cur_node.children:
                return []
            cur_node = cur_node.children[char]

        results = []
        self.collect(cur_node, prefix, results, limit)

        return results


def main():
    """
    Hàm main để kiểm tra nhanh Trie.

    Args:
        None
    Returns:
        None
    """
    trie = Trie()

    trie.insert("user123")
    trie.insert("user456")
    trie.insert("admin999")
    trie.insert("adam123")

    prefix = "9"
    results = trie.suggest(prefix, 6)
    print(f"Gợi ý với prefix '{prefix}': {results}")

if __name__ == "__main__":
    main()