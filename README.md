# VaultX

Kho luu tru source code cho do an mon hoc ve Chrome Extension quan ly mat khau.

## Muc tieu hien tai

Hien tai repo nay uu tien dua len GitHub phan `logic/python` de ghi nhan tien do
viet lai cac cau truc du lieu va giai thuat bang tay. Mot so thu muc khac duoc
giu lai tren repo duoi dang placeholder de the hien cau truc tong the cua project.

## Cau truc thu muc

```text
VaultX/
|-- assets/
|   `-- .gitkeep
|-- docs/
|   `-- .gitkeep
|-- logic/
|   |-- python/
|   |   |-- cryptography.py
|   |   |-- hashtable.py
|   |   |-- kmp.py
|   |   |-- stack.py
|   |   `-- trie.py
|   `-- *.js
|-- popup/
|   `-- .gitkeep
|-- scripts/
|   `-- .gitkeep
|-- manifest.json
|-- .gitignore
`-- README.md
```

## Ghi chu

- `logic/python/`: Noi viet va luu cac phien ban Python cua thuat toan.
- `assets/`, `docs/`, `popup/`, `scripts/`: Dang duoc giu tren GitHub bang
  file `.gitkeep` de hien thi cau truc thu muc. Noi dung that se duoc dua len sau.
- `logic/*.js`, `manifest.json`: Tam thoi chua dua len trong giai doan hien tai.

## Tien do du kien

1. Hoan thien ban Python cho tung thuat toan.
2. Chuyen doi sang JavaScript theo API cua extension.
3. Dua len cac phan giao dien, script va tai nguyen con lai.
