# NOTES.md - Danh sách lỗi và hướng fix

## Cấu trúc chi nhánh

| Chi nhánh    | Mô tả                                                    |
| ------------ | -------------------------------------------------------- |
| `main`       | Chi nhánh sản xuất — chứa CR01, CR02, CR03, PR03         |
| `bugs-fixes` | Chi nhánh đã fix — chứa EF01, EF02, PR01, PR02           |

```bash
git checkout main        # sản xuất — 4 mục cần fix
git checkout bugs-fixes  # đã fix — tất cả 4 mục đã được giải quyết
```

---

## EF01 — Size multiplier không được áp dụng khi tính giá đơn hàng

**Vấn đề:** Model Product có `sizeMultipliers` (S: 1.0, M: 1.3, L: 1.6) nhưng cả client lẫn server đều bỏ qua field này khi tính `itemTotal`. Kết quả là tất cả size (S, M, L) đều có giá giống nhau — người dùng chọn size L nhưng chỉ bị tính giá size S.

**Chi tiết kỹ thuật:**

Trước khi fix (`server/src/routes/orders.ts`):
```typescript
const itemTotal = product.price * item.quantity + toppingTotal;
// → Bỏ qua size multiplier
```

Sau khi fix:
```typescript
const multiplier = product.sizeMultipliers?.[item.size] || 1.0;
const itemTotal = product.price * multiplier * item.quantity + toppingTotal;
// → Áp dụng đúng multiplier theo size
```

Tương tự phía client (`CreateOrder.tsx`), `basePrice` trước đó chỉ nhân `price × quantity`, sau fix thêm `× multiplier`.

**Cách tái tạo lỗi:**
1. Đăng nhập tài khoản staff
2. Vào trang **Tạo đơn** (POS)
3. Chọn một sản phẩm (ví dụ: Trà Sữa, giá 30.000đ)
4. Chọn size **S**, thêm vào giỏ → ghi nhận tổng tiền (30.000đ)
5. Chọn size **L** (multiplier = 1.6), thêm vào giỏ → so sánh tổng tiền
6. **Kết quả lỗi:** Tổng tiền size S và size L đều là 30.000đ
7. **Kết quả đúng:** Size L phải là 48.000đ (30.000 × 1.6)

**File đã fix:**
- `server/src/routes/orders.ts` — thêm `multiplier` vào tính `itemTotal` phía server
- `client/src/pages/staff/CreateOrder.tsx` — thêm `multiplier` vào tính `basePrice` phía client

---

## EF02 — Sửa điểm danh cho phép checkout ≤ checkin, `hoursWorked` âm

**Vấn đề:** Endpoint `PUT /attendance/:id` không kiểm tra `checkOut > checkIn`. Admin có thể cập nhật giờ ra ca thành thời điểm trước giờ vào, dẫn đến `hoursWorked` bị tính thành số âm.

**Chi tiết kỹ thuật:**

Trước khi fix, code chỉ tính `hoursWorked` bằng hiệu hai mốc thời gian mà không validate thứ tự:
```typescript
update.hoursWorked = Math.round(
  (update.checkOut.getTime() - update.checkIn.getTime()) / (1000 * 60 * 60) * 10
) / 10;
// → Nếu checkout < checkin, kết quả âm
```

Sau khi fix, code resolve `finalCheckIn`/`finalCheckOut` từ update + existing record, rồi kiểm tra:
```typescript
if (finalCheckOut <= finalCheckIn) {
  res.status(400).json({ error: 'Giờ ra phải sau giờ vào ca' });
  return;
}
```

**Cách tái tạo lỗi:**
1. Đăng nhập tài khoản manager
2. Vào trang **Quản lý điểm danh**
3. Tìm một bản ghi điểm danh đã có (ví dụ: giờ vào 08:00, giờ ra 17:00)
4. Nhấn **Sửa**, đổi giờ ra thành **06:00** (trước giờ vào 08:00)
5. Nhấn **Lưu**
6. **Kết quả lỗi:** Bản ghi được lưu thành công, `hoursWorked` = -2.0
7. **Kết quả đúng:** Trả về lỗi 400 — "Giờ ra phải sau giờ vào ca"

**File đã fix:**
- `server/src/routes/attendance.ts` — thêm validation `finalCheckOut <= finalCheckIn` trong PUT endpoint, đồng thời refactor giảm duplicate `findById`

---

## PR01 — Phân trang cho tất cả trang quản lý danh sách

**Vấn đề:** Tất cả 6 trang danh sách (đơn hàng, điểm danh, lịch sử ca, thực đơn, kho, tài khoản) đều fetch toàn bộ bản ghi từ server cùng lúc và hiển thị trong một bảng dài không có phân trang. Với dữ liệu lớn, giao diện chậm và bảng cuộn rất dài.

**Chi tiết kỹ thuật:**
- Server thêm query params `?page=X&limit=20` (mặc định 20 bản ghi/trang), trả về `{ products, total, page, totalPages }`
- Client sử dụng hook `usePagination` quản lý state trang hiện tại + component `Pagination` render nút Previous/Next/số trang
- Khi không truyền `?page`, server trả về tất cả (backward compatible)

**Cách kiểm tra:**
1. Đăng nhập tài khoản manager
2. Vào bất kỳ trang quản lý nào (Thực đơn, Kho, Tài khoản, Điểm danh, Lịch sử ca, Đơn hàng)
3. **Kết quả cũ:** Bảng hiển thị tất cả bản ghi cùng lúc, không có nút chuyển trang
4. **Kết quả mới:** Bảng hiển thị tối đa 20 bản ghi, có thanh phân trang Previous/Next ở cuối bảng

**File đã fix:**
- Server: `menu.ts`, `inventory.ts`, `auth.ts` — thêm logic phân trang trong GET endpoint
- Client: `OrderHistory.tsx`, `AttendanceHistory.tsx`, `AttendanceManagement.tsx`, `MenuManagement.tsx`, `InventoryManagement.tsx`, `AccountManagement.tsx` — tích hợp hook + component phân trang

---

## PR02 — Xuất báo cáo Excel trên trang Reports

**Vấn đề:** Trang Reports chỉ hiển thị thống kê (doanh thu, đơn hàng, tồn kho) trên màn hình. Không có cách tải dữ liệu đó về dạng file để chia sẻ hoặc lưu trữ.

**Chi tiết kỹ thuật:**
- Sử dụng thư viện `xlsx` (SheetJS v0.18.5)
- File Excel gồm 1 sheet **"Báo cáo doanh thu"** với các cột: STT, Ngày, Nhân viên, Trạng thái, Số lượng món, Tổng tiền
- Dòng cuối cùng là tổng cộng (TỔNG CÔNG)
- Tên file: `bao-cao-doanh-thu-{dateFilter}.xlsx`

**Cách sử dụng:**
1. Đăng nhập tài khoản manager
2. Vào trang **Báo cáo** (Reports)
3. Chọn khoảng ngày (tuần, tháng, năm)
4. Nhấn nút **"Xuất Excel"**
5. File `.xlsx` tự động tải về

**File đã fix:**
- `client/src/pages/manager/Reports.tsx` — thêm hàm xuất Excel, import thư viện `xlsx`

---

## Tổng hợp

| Mã   | Loại        | Mô tả                                              |
| ---- | ----------- | -------------------------------------------------- |
| EF01 | Fix lỗi     | Size multiplier không được áp dụng vào giá đơn hàng |
| EF02 | Fix lỗi     | Sửa điểm danh cho phép checkout ≤ checkin           |
| PR01 | Nâng cấp    | Phân trang cho tất cả 6 trang quản lý danh sách     |
| PR02 | Nâng cấp    | Xuất báo cáo Excel trên trang Reports                |
