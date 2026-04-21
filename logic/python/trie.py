class Trie:
    """
    Cây tiền tố dùng để lưu domain và username.

    Cấu trúc này hỗ trợ gợi ý khi người dùng gõ tìm kiếm (autocomplete). Ví dụ, khi người dùng gõ "fa", Trie có thể nhanh chóng gợi ý "facebook.com" hoặc "fahasa.com" nếu chúng tồn tại trong Trie.
    Trie rất phù hợp cho autocomplete vì tìm theo tiền tố rất nhanh, với độ phức tạp O(L), trong đó L là độ dài chuỗi đang nhập.

    Args:
        Nút gốc và cách lưu các nút con.
        Mỗi nút có thể lưu thông tin tài khoản nếu nó là kết thúc của một domain hoặc username.
        Hàm insert() để thêm domain hoặc username vào Trie, và hàm search() để tìm kiếm theo tiền tố.

    Returns:
        Một đối tượng Trie dùng để chèn và tìm chuỗi theo tiền tố.
        Ví dụ, trie.insert("facebook.com") sẽ thêm domain này vào Trie, và trie.search("fa") sẽ trả về True nếu có ít nhất một domain bắt đầu bằng "fa", hoặc False nếu không có.
        Tương tác với SearchBar trên extension để gợi ý khi người dùng nhập. Khi người dùng nhập, chương trình sẽ gọi trie.search(prefix) để lấy danh sách gợi ý phù hợp với prefix đã nhập.
    """

    pass
