"""
Quản lý lịch sử mật khẩu cũ của tài khoản theo CTDL Stack.

Version: Python
Last edit: 2026-04-25
Author: 25520260
"""

from datetime import datetime


class PasswordStack:
    """
    Class dùng để quản lý lịch sử mật khẩu cũ của 1 tài khảon.

    Mỗi phần tử trong stack gồm:
    {
        "password": mật khẩu cũ,
        "changedAt": thời gian đổi mật khẩu
    }
    """

    def __init__(self, max_size=20):
        self.items = []
        self.max_size = max_size

    def size(self):
        """Trả về số lượng phần tử hiện có.
        Args:
            self
        Returns:
            len(self.items)
        """
        return len(self.items)

    def is_empty(self):
        """Kiểm tra stack có rỗng không.
        Args:
            self
        Returns:
            bool
        """
        return len(self.items) == 0

    def push(self, password):
        """
        Thêm mật khẩu cũ vào stack.
        Khi đổi mật khẩu mới thì mật khẩu cũ sẽ được lưu vào đây.
        Args:
            self
            password
        Returns:
            None
        Note:
            self.items.insert(0, new_item) --- thêm phần tử mới vào đầu stack
            self.items.pop() --- xóa phần tử cũ nhất nếu vượt quá giới hạn
        """
        if password == "":
            return

        time_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        new_item = {
            "password": password,
            "changedAt": time_now
        }

        self.items.insert(0, new_item)

        if len(self.items) > self.max_size:
            self.items.pop()

    def pop(self):
        """
        Lấy và xóa mật khẩu gần nhất.
        Args:
            self
        Returns:
            password gần nhất hoặc None nếu stack rỗng
        """
        if self.is_empty():
            return None

        return self.items.pop(0)

    def peek(self):
        """
        Xem mật khẩu gần nhất nhưng không xóa.
        Args:
            self
        Returns:
            password gần nhất hoặc None nếu stack rỗng
        """
        if self.is_empty():
            return None

        return self.items[0]

    def is_duplicate(self, password):
        """
        Kiểm tra mật khẩu đã từng dùng chưa.
        Args:
            self
            password
        Returns:
            bool
        """
        for item in self.items:
            if item["password"] == password:
                return True

        return False

    def restore_at(self, index, current_password):
        """
        Khôi phục mật khẩu cũ tại vị trí index.
        Args:
            self
            index
            current_password
        Returns:
            password đã khôi phục hoặc None nếu vị trí không hợp lệ
        """
        if index < 0 or index >= len(self.items):
            return None

        old_item = self.items.pop(index)

        self.push(current_password)

        return old_item["password"]

    def clear(self):
        self.items = []

    def to_array(self):
        """Trả về danh sách lịch sử.
        Args:
            self
        Returns:
            list
        """
        return self.items


def main():
    history = PasswordStack(5)

    current_password = "abc123"

    print("Mật khẩu hiện tại:", current_password)
    print("Lịch sử ban đầu:", history.to_array())

    history.push(current_password)
    current_password = "abc456"

    print("\nSau khi đổi mật khẩu:")
    print("Mật khẩu hiện tại:", current_password)
    print("Lịch sử:", history.to_array())

    check = history.is_duplicate("abc123")
    print("\nabc123 đã từng dùng chưa?", check)

    print("Mật khẩu cũ gần nhất:", history.peek())

    restore = history.restore_at(0, current_password)
    current_password = restore

    print("\nSau khi khôi phục:")
    print("Mật khẩu hiện tại:", current_password)
    print("Lịch sử:", history.to_array())


if __name__ == "__main__":
    main()