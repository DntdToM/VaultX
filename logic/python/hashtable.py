class HashTable:
    """
    Bảng băm dùng để lưu tài khoản dưới dạng key-value.

    Mỗi key là một ID duy nhất của tài khoản.
    Nhờ đó, chương trình có thể tìm, sửa, xóa hoặc lấy chi tiết tài khoản rất nhanh, gần như O(1), thay vì phải duyệt cả danh sách O(N).

    Args:
        Hàm khởi tạo và các thuộc tính cần thiết để lưu bucket, size và dữ liệu.

    Returns:
        Một đối tượng HashTable dùng để quản lý tài khoản theo ID. 
        Thực tế, gọi hàm khởi tạo sẽ trả về một bảng băm rỗng, sẵn sàng để lưu trữ tài khoản.
        Gọi, ví dụ, hash_table.set("user123", account_data) sẽ lưu tài khoản vào bảng băm với ID "user123" và dữ liệu account_data.
        Gọi, ví dụ, hash_table.get("user123") sẽ trả về dữ liệu tài khoản đã lưu với ID "user123", hoặc None nếu không tồn tại.
        Tương tác với block trên extension.
    """

    pass
