"""
Cryptography dùng để bảo vệ dữ liệu trong extension.

Trong file này em gom các chức năng chính:
- Băm master password
- Kiểm tra master password
- Mã hóa / giải mã dữ liệu
- Đánh giá độ mạnh mật khẩu
- Sinh mật khẩu ngẫu nhiên bằng Fisher-Yates Shuffle

Version: Python
Last edit: 2026-05-01
Author: 25520260
"""

import base64
import hashlib
import hmac
import os
import secrets
from Crypto.Cipher import AES

LOWERCASE_CHARS = "abcdefghijklmnopqrstuvwxyz"
UPPERCASE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
NUMBER_CHARS = "0123456789"
SYMBOL_CHARS = "!@#$%^&*()-_=+[]{}|;:,.<>?/~`"

def _derive_key(master_password, salt_base64, iterations=210000):
    """
    Sinh khóa bí mật từ master password và salt.

    Args:
        master_password: Mật khẩu chính của người dùng.
        salt_base64: Salt đã được mã hóa base64.
        iterations: Số vòng lặp PBKDF2.
    Returns:
        Khóa dạng bytes để dùng cho mã hóa.
    """
    salt_bytes = base64.b64decode(salt_base64.encode("utf-8"))
    return hashlib.pbkdf2_hmac(
        "sha256",
        master_password.encode("utf-8"),
        salt_bytes,
        iterations,
        dklen=32
    )

def hash_master_password(password, salt_base64=None, iterations=210000):
    """
    Băm master password để lưu an toàn hơn.

    Args:
        password: Mật khẩu chính người dùng nhập vào.
        salt_base64: Salt dạng base64. Nếu chưa có thì tự tạo mới.
        iterations: Số vòng lặp của PBKDF2.
    Returns:
        Một dict gồm hash, salt và iterations.
    """
    if salt_base64 is None:
        salt_bytes = os.urandom(16)
        salt_base64 = base64.b64encode(salt_bytes).decode("utf-8")
    else:
        salt_bytes = base64.b64decode(salt_base64.encode("utf-8"))
        salt_base64 = base64.b64encode(salt_bytes).decode("utf-8")

    hash_bytes = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt_bytes,
        iterations,
        dklen=32
    )

    return {
        "hash": base64.b64encode(hash_bytes).decode("utf-8"),
        "salt": salt_base64,
        "iterations": iterations
    }

def verify_master_password(password, credential):
    """
    Kiểm tra master password có đúng với dữ liệu đã lưu hay không.

    Args:
        password: Mật khẩu người dùng vừa nhập.
        credential: Dict chứa hash, salt và iterations đã lưu trước đó.
    Returns:
        True nếu đúng, ngược lại là False.
    """
    saved_hash = credential["hash"]
    saved_salt = credential["salt"]
    saved_iterations = credential.get("iterations", 210000)

    new_credential = hash_master_password(password, saved_salt, saved_iterations)
    return hmac.compare_digest(saved_hash, new_credential["hash"])

def encrypt_aes(plaintext, master_password, salt_base64):
    """
    Mã hóa chuỗi plaintext bằng AES.

    Em dùng AES-GCM vì nó vừa mã hóa vừa kiểm tra tính toàn vẹn dữ liệu.

    Args:
        plaintext: Dữ liệu gốc cần mã hóa.
        master_password: Mật khẩu chính để sinh khóa.
        salt_base64: Salt dạng base64.
    Returns:
        Chuỗi ciphertext đã mã hóa và đổi sang base64.
    """
    key = _derive_key(master_password, salt_base64)
    nonce = os.urandom(12)

    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    ciphertext, tag = cipher.encrypt_and_digest(plaintext.encode("utf-8"))

    encrypted_bytes = nonce + tag + ciphertext
    return base64.b64encode(encrypted_bytes).decode("utf-8")

def decrypt_aes(ciphertext_base64, master_password, salt_base64):
    """
    Giải mã dữ liệu đã mã hóa bằng AES.

    Args:
        ciphertext_base64: Dữ liệu đã mã hóa, đang ở dạng base64.
        master_password: Mật khẩu chính để sinh khóa.
        salt_base64: Salt dạng base64.
    Returns:
        Chuỗi plaintext sau khi giải mã.
    """
    encrypted_bytes = base64.b64decode(ciphertext_base64.encode("utf-8"))

    nonce = encrypted_bytes[:12]
    tag = encrypted_bytes[12:28]
    ciphertext = encrypted_bytes[28:]

    key = _derive_key(master_password, salt_base64)
    cipher = AES.new(key, AES.MODE_GCM, nonce=nonce)
    plaintext = cipher.decrypt_and_verify(ciphertext, tag)

    return plaintext.decode("utf-8")

def estimate_password_strength(password):
    """
    Đánh giá độ mạnh của mật khẩu.

    Args:
        password: Mật khẩu cần kiểm tra.
    Returns:
        Một dict gồm score, label và feedback.
    """
    if password == "":
        return {
            "score": 0,
            "label": "Rất yếu",
            "feedback": "Mật khẩu đang trống."
        }

    has_lower = any(char.islower() for char in password)
    has_upper = any(char.isupper() for char in password)
    has_number = any(char.isdigit() for char in password)
    has_symbol = any(not char.isalnum() for char in password)

    score = 0

    if len(password) >= 8:
        score += 1
    if len(password) >= 12:
        score += 1
    if has_lower:
        score += 1
    if has_upper:
        score += 1
    if has_number:
        score += 1
    if has_symbol:
        score += 1

    if score <= 2:
        label = "Yếu"
        feedback = "Mật khẩu còn yếu."
    elif score <= 4:
        label = "Trung bình"
        feedback = "Mật khẩu tạm ổn."
    elif score == 5:
        label = "Mạnh"
        feedback = "Mật khẩu khá mạnh."
    else:
        label = "Rất mạnh"
        feedback = "Mật khẩu rất tốt."

    return {
        "score": score,
        "label": label,
        "feedback": feedback
    }

def fisher_yates_shuffle(arr):
    """
    Xáo trộn ngẫu nhiên một mảng bằng Fisher-Yates Shuffle.

    Args:
        arr: Mảng ký tự cần xáo trộn.
    Returns:
        Mảng sau khi đã được xáo trộn.
    """

    len_arr = len(arr)

    for i in range(len_arr - 1, 0, -1):
        j = secrets.randbelow(i + 1)
        arr[i], arr[j] = arr[j], arr[i]

    return arr

def generate_secure_password(options=None):
    """
    Sinh mật khẩu ngẫu nhiên theo các tùy chọn đầu vào.

    Args:
        options: Dict chứa length, uppercase, lowercase, numbers, symbols.
    Returns:
        Mật khẩu ngẫu nhiên dạng chuỗi.
    """
    if options is None:
        options = {}

    length = options.get("length", 16)
    use_uppercase = options.get("uppercase", True)
    use_lowercase = options.get("lowercase", True)
    use_numbers = options.get("numbers", True)
    use_symbols = options.get("symbols", True)

    pools = []
    password_chars = []

    if use_lowercase:
        pools.append(LOWERCASE_CHARS)
        password_chars.append(secrets.choice(LOWERCASE_CHARS))
    if use_uppercase:
        pools.append(UPPERCASE_CHARS)
        password_chars.append(secrets.choice(UPPERCASE_CHARS))
    if use_numbers:
        pools.append(NUMBER_CHARS)
        password_chars.append(secrets.choice(NUMBER_CHARS))
    if use_symbols:
        pools.append(SYMBOL_CHARS)
        password_chars.append(secrets.choice(SYMBOL_CHARS))

    if not pools:
        print("Phải chọn ít nhất một nhóm ký tự.")

    if length < len(password_chars):
        print("Độ dài mật khẩu quá ngắn so với số nhóm ký tự đã chọn.")

    all_chars = "".join(pools)

    while len(password_chars) < length:
        password_chars.append(secrets.choice(all_chars))

    fisher_yates_shuffle(password_chars)
    return "".join(password_chars)

def main():
    """
    Hàm main để kiểm tra nhanh các chức năng trong file.

    Args:
        None
    Returns:
        None
    """

    master_password = "master123"
    plaintext = "hello vaultx"

    print("\n1. Test hash master password")
    credential = hash_master_password(master_password)
    print("Credential:", credential)

    print("\n2. Test verify master password")
    print("Đúng mật khẩu:", verify_master_password("master123", credential))
    print("Sai mật khẩu:", verify_master_password("sai_mat_khau", credential))

    print("\n3. Test generate password")
    generated_password = generate_secure_password({
        "length": 16,
        "uppercase": True,
        "lowercase": True,
        "numbers": True,
        "symbols": True
    })
    print("Mật khẩu sinh ra:", generated_password)

    print("\n4. Test estimate password strength")
    strength = estimate_password_strength(generated_password)
    print("Độ mạnh:", strength)

    print("\n5. Test AES encrypt / decrypt")
    ciphertext = encrypt_aes(plaintext, master_password, credential["salt"])
    decrypted_text = decrypt_aes(ciphertext, master_password, credential["salt"])
    print("Plaintext:", plaintext)
    print("Ciphertext:", ciphertext)
    print("Decrypted:", decrypted_text)

if __name__ == "__main__":
    main()