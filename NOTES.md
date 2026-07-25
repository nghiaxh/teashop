# NOTES.md - Danh sach loi va huong fix

## Cau truc chi nhanh

| Chi nhanh    | Mo ta                                              |
| ------------ | -------------------------------------------------- |
| `main`       | Chi nhanh san xuat                                 |
| `bugs-fixes` | Chi nhanh da fix — chua EF01, EF02, PR01, PR02     |

---

## EF01 — Size multiplier khong duoc ap dung khi tinh gia don hang

**Van de:** Model Product co `sizeMultipliers` (S: 1.0, M: 1.3, L: 1.6) nhung ca client va server deu khong su dung khi tinh `itemTotal`. Tat ca size deu co gia giong nhau.

**File da fix:**
- `server/src/routes/orders.ts`
- `client/src/pages/staff/CreateOrder.tsx`

---

## EF02 — Sua diem danh cho phep checkout <= checkin, `hoursWorked` am

**Van de:** `PUT /attendance/:id` khong kiem tra `checkOut > checkIn`. Admin co the set checkin sau checkout, tao ra `hoursWorked` am.

**File da fix:**
- `server/src/routes/attendance.ts`

---

## PR01 — Phan trang cho tat ca trang quan ly danh sach

**Van de:** Tat ca 6 trang danh sach lay tat ca ban ghi mot luc, khong phan trang. Du lieu lon gay cham va bang cuon dai.

**File da fix:**
- Server: `menu.ts`, `inventory.ts`, `auth.ts`
- Client: `OrderHistory.tsx`, `AttendanceHistory.tsx`, `AttendanceManagement.tsx`, `MenuManagement.tsx`, `InventoryManagement.tsx`, `AccountManagement.tsx`

---

## PR02 — Xuat bao cao Excel tren trang Reports

**Van de:** Trang Reports chi hien thi thong ke tren man hinh. Khong co cach tai bao cao doanh thu/kho thanh file Excel.

**File da fix:**
- `client/src/pages/manager/Reports.tsx`

---

## Tong hop

| Ma    | Loai        | Mo ta                                           |
| ----- | ----------- | ----------------------------------------------- |
| EF01  | Fix loi     | Size multiplier khong duoc ap dung vao gia don  |
| EF02  | Fix loi     // Sua diem danh cho phep checkout <= checkin |
| PR01  | Nang cap    | Phan trang cho tat ca 6 trang quan ly          |
| PR02  | Nang cap    | Xuat Excel tren trang Reports                   |
