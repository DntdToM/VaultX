"""
KMP giải quyết string-matching -> tìm kiếm chuỗi con trong chuỗi lớn.
=> Lọc kết quả hiển thị != Autocomplete 

Version: Python
Last edit: 2026-04-27
Author: 25520260
"""

def build_prefix_table(pattern):
    """
    Tính toán lps (longest prefix-suffix) cho chuỗi pattern.
    Ex:
        pattern: "ABABCABAB"
        lps:     [0, 0, 1, 2, 0, 1, 2, 3, 4]

    Args:
        pattern: chuỗi con cần tìm kiếm trong chuỗi lớn.
    Returns:
        prefix_table: một mảng chứa độ dài của prefix dài nhất mà cũng là suffix cho mỗi vị trí trong pattern.
    """
    if pattern == "":
        return []

    prefix_table = [0] * len(pattern)
    length = 0
    i = 1

    while i < len(pattern):
        if pattern[i] == pattern[length]:
            length += 1
            prefix_table[i] = length
            i += 1
        else:
            if length != 0:
                length = prefix_table[length - 1]
            else:
                prefix_table[i] = 0
                i += 1

    return prefix_table

def kmp_includes(text, pattern):
    """
    Kiểm tra pattern có xuất hiện trong text hay không bằng thuật toán KMP.

    Args:
        text: Chuỗi lớn cần tìm kiếm.
        pattern: Chuỗi con cần tìm.
    Returns:
        True nếu tìm thấy pattern trong text, ngược lại là False.
    """
    if pattern == "":
        return True

    prefix_table = build_prefix_table(pattern)

    i = j = 0
    n = len(text)
    m = len(pattern)

    while i < n:
        if text[i] == pattern[j]:
            i += 1
            j += 1

            if j == m:
                return True
        else:
            if j != 0:
                j = prefix_table[j - 1]
            else:
                i += 1

    return False

def filter_accounts_with_kmp(accounts, query):
    """
    Lọc danh sách account bằng KMP.
    Mỗi account trong list có thể có nhiều {domain: str, username: str, notes: str}

    Nếu query xuất hiện trong một trong các field trên, account đó sẽ được giữ lại (hiển thị).

    Args:
        accounts: Danh sách account dạng dict.
        query: Từ khóa người dùng nhập vào ô search.
    Returns:
        Danh sách account thỏa điều kiện tìm kiếm.
    """
    if query == "":
        return accounts

    results = []
    query = query.lower()

    for account in accounts:
        domain = str(account.get("domain", "")).lower()
        username = str(account.get("username", "")).lower()
        notes = str(account.get("notes", "")).lower()

        if (kmp_includes(domain, query) or kmp_includes(username, query) or kmp_includes(notes, query)):
            results.append(account)

    return results

def main():
    """
    Hàm main để kiểm tra nhanh thuật toán KMP.

    Args:
        None
    Returns:
        None
    """
    accounts = [
        {"domain": "github.com", "username": "bard.ai", "notes": "mlem mlem"},
        {"domain": "notion.so", "username": "bard.workspace", "notes": "mi hao hao"},
        {"domain": "facebook.com", "username": "hacker.lord", "notes": "anh do mixi"},
    ]

    query = input("Nhập từ khóa tìm kiếm: ")
    results = filter_accounts_with_kmp(accounts, query)

    print(f"Kết quả tìm kiếm với '{query}':")
    for account in results:
        print(account)

if __name__ == "__main__":
    main()