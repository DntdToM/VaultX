"""
HashTable dùng để lưu dữ liệu theo cặp khóa - giá trị.

Trong dự án VaultX, HashTable có thể dùng để:
- lưu account theo id
- tìm dữ liệu nhanh hơn so với duyệt mảng
- hỗ trợ xem, sửa, xóa account

Version: Python
Last edit: 2026-05-02
Author: 25520260
"""


class HashTable:
    """
    HashTable có xử lý va chạm bằng chaining.

    Mỗi ô trong bảng băm sẽ là:
    - None nếu chưa có dữ liệu
    - hoặc là một list các cặp (key, value) nếu có va chạm
    """

    def __init__(self, bucket_count=29):
        """
        Tạo một HashTable mới.

        Args:
            bucket_count: Số bucket trong bảng băm.
        Returns:
            None
        """
        self.bucket_count = bucket_count
        self.buckets = [None] * bucket_count
        self.size = 0

    def hash(self, key):
        """
        Tính chỉ số băm cho một key.

        Em dùng cách khá đơn giản:
        - đổi key về chuỗi
        - duyệt từng ký tự
        - lấy mã ASCII nhân với vị trí
        - cộng dồn rồi chia lấy dư cho số bucket

        Args:
            key: Khóa cần băm.
        Returns:
            Chỉ số bucket tương ứng.
        """
        key = str(key)
        total = 0

        for i, char in enumerate(key):
            total += (i + 1) * ord(char)

        return total % self.bucket_count

    def set(self, key, value):
        """
        Thêm hoặc cập nhật một cặp key-value.

        Args:
            key: Khóa cần lưu.
            value: Giá trị tương ứng với khóa.
        Returns:
            Chính object HashTable để có thể chain nếu muốn.
        """
        index = self.hash(key)

        if self.buckets[index] is None:
            self.buckets[index] = []

        for i, (old_key, old_value) in enumerate(self.buckets[index]):
            if old_key == key:
                self.buckets[index][i] = (key, value)
                return self

        self.buckets[index].append((key, value))
        self.size += 1
        return self

    def get(self, key):
        """
        Lấy value từ key.

        Args:
            key: Khóa cần tìm.
        Returns:
            Value nếu tìm thấy, ngược lại là None.
        """
        index = self.hash(key)
        bucket = self.buckets[index]

        if bucket is None:
            return None

        for old_key, old_value in bucket:
            if old_key == key:
                return old_value

        return None

    def has(self, key):
        """
        Kiểm tra key có tồn tại hay không.

        Args:
            key: Khóa cần kiểm tra.
        Returns:
            True nếu có, False nếu không.
        """
        index = self.hash(key)
        bucket = self.buckets[index]

        if bucket is None:
            return False

        for old_key, old_value in bucket:
            if old_key == key:
                return True

        return False

    def remove(self, key):
        """
        Xóa một key khỏi HashTable.

        Args:
            key: Khóa cần xóa.
        Returns:
            True nếu xóa thành công, False nếu không tìm thấy key.
        """
        index = self.hash(key)
        bucket = self.buckets[index]

        if bucket is None:
            return False

        for i, (old_key, old_value) in enumerate(bucket):
            if old_key == key:
                del bucket[i]
                self.size -= 1

                if len(bucket) == 0:
                    self.buckets[index] = None

                return True

        return False

    def clear(self):
        """
        Xóa toàn bộ dữ liệu trong HashTable.

        Args:
            None
        Returns:
            None
        """
        self.buckets = [None] * self.bucket_count
        self.size = 0

    def entries(self):
        """
        Lấy tất cả cặp key-value trong bảng băm.

        Args:
            None
        Returns:
            List chứa toàn bộ các cặp (key, value).
        """
        result = []

        for bucket in self.buckets:
            if bucket is not None:
                result.extend(bucket)

        return result

    def values(self):
        """
        Lấy tất cả value trong bảng băm.

        Args:
            None
        Returns:
            List chứa toàn bộ value.
        """
        result = []

        for bucket in self.buckets:
            if bucket is not None:
                for key, value in bucket:
                    result.append(value)

        return result

    def collisionReport(self):
        """
        Trả về báo cáo va chạm của từng bucket.

        Mỗi phần tử trong list sẽ có:
        - bucket: chỉ số bucket
        - items: số phần tử trong bucket đó
        - collided: bucket đó có va chạm hay không

        Returns:
            List các dict mô tả tình trạng từng bucket.
        """
        report = []

        for index, bucket in enumerate(self.buckets):
            if bucket is None:
                item_count = 0
            else:
                item_count = len(bucket)

            report.append({
                "bucket": index,
                "items": item_count,
                "collided": item_count > 1
            })

        return report

def main():
    """
    Hàm main để test nhanh HashTable.

    Args:
        None
    Returns:
        None
    """
    table = HashTable(7)

    table.set("user1", "password1")
    table.set("user2", "password2")
    table.set("user3", "password3")

    print("Get user1:", table.get("user1"))
    print("Has user2:", table.has("user2"))
    print("Has user9:", table.has("user9"))

    print("\nEntries:")
    print(table.entries())

    print("\nValues:")
    print(table.values())

    print("\nRemove user2:")
    print(table.remove("user2"))
    print(table.entries())

    print("\nCollision report:")
    print(table.collisionReport())

if __name__ == "__main__":
    main()