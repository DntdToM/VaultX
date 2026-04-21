class PasswordStack:
    """
    Stack dùng để lưu lịch sử các mật khẩu cũ của từng tài khoản.

    Stack hoạt động theo nguyên tắc LIFO, nghĩa là phần tử vào sau sẽ được lấy ra trước. Nhờ đó, người dùng có thể khôi phục nhanh mật khẩu gần nhất và kiểm tra để tránh dùng lại mật khẩu cũ.

    Args:
        Cấu trúc stack.
        Lưu trữ mật khẩu cũ của từng tài khoản.
        Thêm hàm push() để thêm mật khẩu mới vào stack, pop() để lấy mật khẩu gần nhất và peek() để xem mật khẩu gần nhất mà không xóa nó khỏi stack.
        Hàm len() để kiểm tra số lượng mật khẩu đã lưu trong stack, giúp hiển thị số lượng mật khẩu cũ được lưu trữ (ví dụ chỉ lưu 5 mật khẩu gần nhất).
        while(!s.empty()) { s.pop(); } để xóa toàn bộ lịch sử mật khẩu cũ khi người dùng muốn reset lại.

    Returns:
        Một đối tượng PasswordStack dùng để push, pop và kiểm tra lịch sử.
    """

    pass
