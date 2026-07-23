# NOTES.md - Known Bugs & Fix Guide

This document describes the 6 maintenance items in the TeaShop application and how to fix them.

## Branch Structure

| Branch       | Description                                       |
| ------------ | ------------------------------------------------- |
| `main`       | Full codebase with 6 intentional bugs (see below) |
| `bugs-fixed` | Same as `main` + all 6 bugs fixed                 |

To switch between them:

```bash
git checkout main          # buggy version
git checkout bugs-fixed    # fixed version
```

---

## CR01 — Chuẩn hóa thông báo lỗi Đăng nhập

### Mô tả

Login page hiển thị lỗi chung chung "Đăng nhập thất bại" cho mọi trường hợp (thiếu trường, sai thông tin, tài khoản bị khóa) thay vì thông báo rõ ràng từng lỗi.

### File bị ảnh hưởng

- `client/src/pages/Login.tsx`
- `server/src/routes/auth.ts`

### Code hiện tại (sai)

**Server — cùng 1 message cho mọi lỗi:**

```typescript
// server/src/routes/auth.ts
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Đăng nhập thất bại" });
    return;
  }

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ error: "Đăng nhập thất bại" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: "Đăng nhập thất bại" });
    return;
  }
  // ...
});
```

**Client — không có form validation, chỉ hiện 1 lỗi chung:**

```tsx
// client/src/pages/Login.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const user = await login(username, password);
    navigate(user.role === "manager" ? "/manager" : "/");
  } catch (err: any) {
    const message = err.response?.data?.error || "Đăng nhập thất bại";
    setError(message);
    showToast(message, "error");
  } finally {
    setLoading(false);
  }
};

// Không có formErrors state
// Không có validate() function
// Không có feedback dưới mỗi input field
```

### Cách reproduce

1. Để trống username, click "Đăng Nhập" → không có lỗi hiển thị dưới field
2. Nhập sai username → hiện "Đăng nhập thất bại" — không biết sai ở đâu
3. Nhập đúng username, sai password → cùng thông báo "Đăng nhập thất bại"
4. Tài khoản bị khóa → cùng thông báo "Đăng nhập thất bại"

### Cách fix

**Server — trả message riêng cho từng lỗi:**

```typescript
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu" });
    return;
  }

  const user = await User.findOne({ username });
  if (!user) {
    res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Tài khoản đã bị khóa" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ error: "Sai tên đăng nhập hoặc mật khẩu" });
    return;
  }
  // ...
});
```

**Client — thêm form validation với lỗi cụ thể dưới mỗi field:**

```tsx
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{ username?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: typeof formErrors = {};
    if (!username.trim()) errors.username = "Tên đăng nhập không được để trống";
    if (!password.trim()) errors.password = "Mật khẩu không được để trống";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setError("");
    setLoading(true);

    try {
      const user = await login(username, password);
      navigate(user.role === "manager" ? "/manager" : "/");
    } catch (err: any) {
      const message = err.response?.data?.error || "Đăng nhập thất bại";
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        className={`${formErrors.username ? "border-danger" : "border-divider"}`}
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          if (formErrors.username) setFormErrors((prev) => ({ ...prev, username: undefined }));
        }}
      />
      {formErrors.username && <p className="text-xs text-danger mt-1">{formErrors.username}</p>}

      <input
        type="password"
        className={`${formErrors.password ? "border-danger" : "border-divider"}`}
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
        }}
      />
      {formErrors.password && <p className="text-xs text-danger mt-1">{formErrors.password}</p>}
    </form>
  );
}
```

### Expected behavior

- Thiếu username/password → hiển thị lỗi đỏ dưới field cụ thể
- Sai thông tin đăng nhập → hiện "Sai tên đăng nhập hoặc mật khẩu"
- Tài khoản bị khóa → hiện "Tài khoản đã bị khóa"
- Lỗi dưới field tự biến mất khi user bắt đầu gõ lại

---

## CR02 — Thêm Modal xác nhận Hủy/Xóa

### Mô tả

Các thao tác xóa/khóa dữ liệu (xóa sản phẩm, khóa tài khoản, tạo đơn hàng) thực hiện ngay khi click mà không có bước xác nhận, dễ gây thao tác nhầm.

### File bị ảnh hưởng

- `client/src/components/ui/ConfirmDialog.tsx` (cần tạo mới)
- `client/src/pages/manager/MenuManagement.tsx`
- `client/src/pages/manager/AccountManagement.tsx`
- `client/src/pages/staff/CreateOrder.tsx`

### Code hiện tại (sai)

**MenuManagement — xóa sản phẩm ngay lập tức:**

```tsx
const handleDelete = async () => {
  try {
    await api.delete(`/menu/${deletingProduct._id}`);
    fetchProducts();
    showToast("Xóa sản phẩm thành công", "success");
  } catch (error: any) {
    showToast(error.response?.data?.error || "Xóa sản phẩm thất bại", "error");
  }
};

// Button xóa gọi handleDelete trực tiếp
<Button isIconOnly size="sm" variant="danger-soft" onClick={handleDelete} aria-label="Xóa">
  <Trash size={14} />
</Button>
// Không có ConfirmDialog, không có bước xác nhận
```

**AccountManagement — khóa tài khoản ngay lập tức:**

```tsx
const handleDeactivate = async () => {
  try {
    await api.delete(`/auth/${deactivatingUser.id}`);
    fetchUsers();
    showToast("Đã khóa tài khoản", "success");
  } catch (error: any) {
    showToast(error.response?.data?.error || "Khóa tài khoản thất bại", "error");
  }
};

// Button khóa gọi handleDeactivate trực tiếp, không có confirm
```

**CreateOrder — tạo đơn ngay lập tức:**

```tsx
const handleCreateOrder = async () => {
  // Gọi API tạo đơn ngay khi click, không có bước xem lại
  try {
    await api.post("/orders", orderData);
    showToast("Tạo đơn hàng thành công", "success");
  } catch (error: any) {
    showToast("Tạo đơn hàng thất bại", "error");
  }
};
```

### Cách reproduce

1. Vào MenuManagement, click icon xóa sản phẩm → sản phẩm bị xóa ngay, không hỏi lại
2. Vào AccountManagement, click icon khóa TK → tài khoản bị khóa ngay
3. Vào CreateOrder, thêm món, click "Tạo đơn" → đơn được tạo ngay, không xem lại tổng

### Cách fix

**Tạo component `ConfirmDialog`:**

```tsx
// client/src/components/ui/ConfirmDialog.tsx
import Modal from "./Modal";
import { Button } from "@heroui/react";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmColor?: "danger" | "warning" | "primary";
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Xác nhận",
  confirmColor = "danger",
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Hủy</Button>
          <Button variant={confirmColor} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-foreground/70">{message}</p>
    </Modal>
  );
}
```

**Sửa MenuManagement — thêm state + ConfirmDialog:**

```tsx
const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

// Button xóa set state, không gọi handleDelete trực tiếp
<Button isIconOnly size="sm" variant="danger-soft" onClick={() => setDeletingProduct(product)}>
  <Trash size={14} />
</Button>

// Thêm ConfirmDialog ở cuối component
<ConfirmDialog
  open={!!deletingProduct}
  onClose={() => setDeletingProduct(null)}
  onConfirm={handleDelete}
  title="Xóa sản phẩm"
  message={`Bạn có chắc muốn xóa "${deletingProduct?.name}"?`}
  confirmLabel="Xóa"
/>
```

**Sửa AccountManagement — tương tự:**

```tsx
const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

<Button isIconOnly size="sm" variant="danger-soft" onClick={() => setDeactivatingUser(user)}>
  <Prohibit size={14} />
</Button>

<ConfirmDialog
  open={!!deactivatingUser}
  onClose={() => setDeactivatingUser(null)}
  onConfirm={handleDeactivate}
  title="Khóa tài khoản"
  message={`Bạn có chắc muốn khóa tài khoản "${deactivatingUser?.name}"?`}
  confirmLabel="Khóa"
/>
```

**Sửa CreateOrder — thêm modal xác nhận trước khi tạo đơn:**

```tsx
const [showOrderConfirm, setShowOrderConfirm] = useState(false);

// Button "Tạo đơn" mở modal thay vì gọi API trực tiếp
<Button onClick={() => setShowOrderConfirm(true)}>Tạo đơn</Button>

<ConfirmDialog
  open={showOrderConfirm}
  onClose={() => setShowOrderConfirm(false)}
  onConfirm={handleCreateOrder}
  title="Xác nhận tạo đơn"
  message={`${cart.length} món — Tổng: ${total.toLocaleString("vi-VN")}đ`}
  confirmLabel="Tạo đơn"
  confirmColor="primary"
/>
```

### Expected behavior

- Click xóa/khóa/tạo đơn → hiện modal "Bạn có chắc muốn...?"
- Click "Hủy" → đóng modal, không thay đổi gì
- Click "Xác nhận" → thực hiện hành động
- Tránh được thao tác nhầm trên POS

---

## CR03 — Việt hóa & Format hiển thị Bảng

### Mô tả

Tiêu đề cột trong bảng dùng code Tiếng Anh (Product, Total, Note, Status, Date) và giá tiền hiển thị số nguyên không format theo chuẩn VNĐ.

### File bị ảnh hưởng

- `client/src/pages/staff/OrderHistory.tsx`

### Code hiện tại (sai)

```tsx
<thead>
  <tr className="border-b border-divider">
    <th className="text-left px-4 py-3">#</th>
    <th className="text-left px-4 py-3">Product</th>
    <th className="text-left px-4 py-3">Size</th>
    <th className="text-left px-4 py-3">Topping</th>
    <th className="text-left px-4 py-3">Total</th>
    <th className="text-left px-4 py-3">Note</th>
    <th className="text-left px-4 py-3">Status</th>
    <th className="text-left px-4 py-3">Date</th>
  </tr>
</thead>

{/* Giá hiển thị số nguyên */}
<td className="px-4 py-3">{order.totalAmount}đ</td>
<td className="px-4 py-3">{item.itemTotal}đ</td>

{/* Status hiển thị raw code */}
<td className="px-4 py-3">{order.status}</td>

{/* Date format mặc định */}
<td className="px-4 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
```

### Cách reproduce

1. Vào trang Lịch sử đơn hàng
2. Thấy tiêu đề cột: "Product", "Total", "Note", "Status", "Date"
3. Giá tiền hiển thị: "150000đ" thay vì "150.000đ"
4. Status hiển thị: "completed", "pending", "cancelled"
5. Date format: "7/22/2026" thay vì "22/07/2026"

### Cách fix

```tsx
const statusMap: Record<string, { label: string; variant: "success" | "warning" | "danger" | "neutral" }> = {
  completed: { label: "Hoàn thành", variant: "success" },
  pending: { label: "Đang chờ", variant: "warning" },
  cancelled: { label: "Đã hủy", variant: "danger" },
};

<thead>
  <tr className="border-b border-divider">
    <th className="text-left px-4 py-3">#</th>
    <th className="text-left px-4 py-3">Món</th>
    <th className="text-left px-4 py-3">Size</th>
    <th className="text-left px-4 py-3">Topping</th>
    <th className="text-left px-4 py-3">Tổng</th>
    <th className="text-left px-4 py-3">Ghi chú</th>
    <th className="text-left px-4 py-3">Trạng thái</th>
    <th className="text-left px-4 py-3">Ngày</th>
  </tr>
</thead>

{/* Format tiền VNĐ */}
<td className="px-4 py-3 font-semibold text-sm">
  {order.totalAmount.toLocaleString("vi-VN")}đ
</td>

{/* Status badge tiếng Việt */}
<td className="px-4 py-3">
  <Badge variant={statusMap[order.status]?.variant}>
    {statusMap[order.status]?.label || order.status}
  </Badge>
</td>

{/* Date format tiếng Việt */}
<td className="px-4 py-3 text-sm text-foreground/60">
  {new Date(order.createdAt).toLocaleDateString("vi-VN")}
</td>
```

### Expected behavior

- Tất cả tiêu đề cột hiển thị tiếng Việt: "Món", "Size", "Topping", "Tổng", "Ghi chú", "Trạng thái", "Ngày"
- Giá tiền format chuẩn VNĐ: "150.000đ", "1.250.000đ"
- Status hiển thị badge tiếng Việt: "Hoàn thành" (xanh), "Đang chờ" (vàng), "Đã hủy" (đỏ)
- Date format: "22/07/2026" thay vì "7/22/2026"

---

## PR01 — Lịch sử đơn hàng không phân trang

### Mô tả

API `GET /api/orders` dùng `Order.find({})` lấy toàn bộ dữ liệu một lần, không phân trang. Trang OrderHistory và Attendance render toàn bộ records trong một bảng duy nhất.

### File bị ảnh hưởng

- `server/src/routes/orders.ts`
- `client/src/pages/staff/OrderHistory.tsx`
- `client/src/pages/staff/AttendanceHistory.tsx`
- `client/src/pages/manager/AttendanceManagement.tsx`

### Code hiện tại (sai)

**Server — parse page/limit nhưng KHÔNG dùng:**

```typescript
// server/src/routes/orders.ts
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = "1", limit = "20", status, date } = req.query;
  // page và limit KHÔNG BAO GIỜ DÙNG

  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ orders });
  // Không có total, totalPages
});
```

**Client — fetchall, không Pagination:**

```tsx
// client/src/pages/staff/OrderHistory.tsx
const fetchOrders = async () => {
  setLoading(true);
  try {
    const res = await api.get("/orders");
    setOrders(res.data.orders);  // lấy toàn bộ, không có ?page=
  } catch (error) {
    console.error("Failed to fetch orders:", error);
  } finally {
    setLoading(false);
  }
};

// Không import usePagination
// Không import Pagination component
// Component render orders.map() trực tiếp, không slice theo trang
```

**Attendance — tương tự, fetchall:**

```tsx
// client/src/pages/staff/AttendanceHistory.tsx
useEffect(() => {
  api.get("/attendance").then((res) => {
    setAttendance(res.data.attendance || []);  // lấy toàn bộ
  });
}, []);
// Không có phân trang
```

### Cách reproduce

1. Seed database với 350+ đơn hàng
2. Vào trang Lịch sử đơn hàng → load toàn bộ 350 records vào 1 bảng
3. Bảng rất dài, phải cuộn rất nhiều
4. Network tab thấy payload response lớn
5. Tương tự với Lịch sử chấm công

### Cách fix

**Server — áp dụng skip/limit và trả metadata:**

```typescript
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = "1", limit = "20", status, date } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};
  if (status) filter.status = status;
  if (date) {
    const start = new Date(date as string);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }).populate("userId", "name username"),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});
```

**Client — thêm usePagination + Pagination component:**

```tsx
import { useState, useEffect } from "react";
import { usePagination } from "../../hooks/usePagination";
import Pagination from "../../components/Pagination";

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  const fetchOrders = async (page: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${page}&limit=${limit}`);
      setOrders(res.data.orders);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(currentPage); }, [currentPage]);

  const paginationRange = usePagination({ currentPage, totalPages, siblingCount: 1 });

  return (
    <div className="space-y-4">
      {/* ... table ... */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        paginationRange={paginationRange}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
```

Áp dụng tương tự cho `AttendanceHistory.tsx` và `AttendanceManagement.tsx`.

### Expected behavior

- Mỗi trang hiển thị tối đa 20 records
- Có nút chuyển trang (Pagination component đã tồn tại)
- Hiển thị "Trang 1 / 18" (với 350 records)
- Trang sau load nhanh vì chỉ lấy 20 records

---

## PR02 — Xuất Báo cáo ra file Excel/PDF

### Mô tả

Trang Báo cáo (Reports) chỉ hiển thị thống kê trên giao diện, không cho phépManager tải báo cáo doanh thu & tồn kho về máy dưới dạng file Excel.

### File bị ảnh hưởng

- `client/src/pages/manager/Reports.tsx`
- `client/package.json` (cần thêm thư viện)

### Code hiện tại (sai)

```tsx
// client/src/pages/manager/Reports.tsx
export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  useEffect(() => {
    api.get("/orders").then((res) => {
      setOrders(res.data.orders || []);
    });
  }, []);

  // Có stats, topProducts, dateFilter
  // NHƯNG KHÔNG CÓ NÚT EXPORT
  // Không import xlsx, file-saver
  // Không có function exportToExcel / exportToPDF

  return (
    <motion.div>
      {/* Stat cards */}
      {/* Detail section */}
      {/* Top products table */}
      {/* KHÔNG CÓ NÚT XUẤT BÁO CÁO */}
    </motion.div>
  );
}
```

### Cách reproduce

1. Vào trang Báo cáo
2. Chọn filter ngày (Hôm nay / Tuần này / Tháng này)
3. Xem thống kê, top sản phẩm
4. Không có nút "Xuất Excel" hay "Xuất PDF" nào
5. Không thể tải báo cáo về máy

### Cách fix

**Thêm thư viện:**

```bash
cd client
npm install xlsx file-saver
npm install -D @types/file-saver
```

**Thêm function export + nút vào Reports.tsx:**

```tsx
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, Spinner, Button } from "@heroui/react";
import { Download } from "@phosphor-icons/react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import api from "../../api/axios";
import type { Order } from "../../types";

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // ... existing code (filteredOrders, stats, topProducts) ...

  const exportToExcel = () => {
    const data = filteredOrders.map((o, i) => ({
      "STT": i + 1,
      "Ngày": new Date(o.createdAt).toLocaleDateString("vi-VN"),
      "Nhân viên": o.userId?.name || "",
      "Trạng thái": o.status === "completed" ? "Hoàn thành" : o.status === "pending" ? "Đang chờ" : "Đã hủy",
      "Số lượng món": o.items.reduce((s, it) => s + it.quantity, 0),
      "Tổng tiền": o.totalAmount,
    }));

    // Thêm dòng tổng cộng
    data.push({
      "STT": "" as any,
      "Ngày": "" as any,
      "Nhân viên": "" as any,
      "Trạng thái": "TỔNG CỘNG" as any,
      "Số lượng món": data.reduce((s, r) => s + (r["Số lượng món"] as number), 0) as any,
      "Tổng tiền": stats.totalRevenue as any,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo doanh thu");

    // Format cột
    ws["!cols"] = [
      { wch: 5 },   // STT
      { wch: 12 },  // Ngày
      { wch: 18 },  // Nhân viên
      { wch: 12 },  // Trạng thái
      { wch: 12 },  // Số lượng
      { wch: 15 },  // Tổng tiền
    ];

    XLSX.writeFile(wb, `bao-cao-doanh-thu-${dateFilter}.xlsx`);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Báo cáo Doanh thu</h2>
        <div className="flex gap-2">
          {/* Date filter buttons */}
          <Button
            variant="primary"
            onClick={exportToExcel}
            startContent={<Download size={16} />}
          >
            Xuất Excel
          </Button>
        </div>
      </motion.div>

      {/* ... rest of existing code ... */}
    </motion.div>
  );
}
```

### Expected behavior

- Có nút "Xuất Excel" trên trang Reports
- File Excel chứa dữ liệu filtered (theo date range đang chọn)
- File tên: `bao-cao-doanh-thu-today.xlsx`, `bao-cao-doanh-thu-week.xlsx`, `bao-cao-doanh-thu-month.xlsx`
- Dữ liệu gồm: STT, Ngày, Nhân viên, Trạng thái, Số lượng món, Tổng tiền
- Có dòng tổng cộng ở cuối

---

## PR03 — Ghi nhớ Đăng nhập & Show/Hide Password

### Mô tả

Tại máy POS, nhân viên phải nhập lại thông tin đăng nhập mỗi lần mở trang. Không có tùy chọn "Ghi nhớ đăng nhập" và không có nút hiển thị/ẩn mật khẩu để kiểm tra đã nhập đúng chưa.

### File bị ảnh hưởng

- `client/src/pages/Login.tsx`

### Code hiện tại (sai)

```tsx
// client/src/pages/Login.tsx
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // Không có showPassword state
  // Không có rememberMe state
  // Không có localStorage logic

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Nhập tên đăng nhập" value={username} />

      {/* Mật khẩu chỉ có type="password", không có toggle show/hide */}
      <input type="password" placeholder="Nhập mật khẩu" value={password} />

      {/* Không có checkbox "Ghi nhớ đăng nhập" */}
      {/* Không có eye icon để show/hide password */}

      <button type="submit">Đăng Nhập</button>
    </form>
  );
}
```

### Cách reproduce

1. Vào trang Login
2. Nhập username + password — không có cách nào xem password đã nhập đúng chưa
3. Login thành công → đóng tab → mở lại → phải nhập lại từ đầu
4. Không có checkbox "Ghi nhớ đăng nhập"
5. Session cookie `maxAge: 24h` giúp giữ login nếu không close browser, nhưng close = mất

### Cách fix

**Thêm Eye/EyeSlash toggle password:**

```tsx
import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Khôi phục username từ localStorage khi mount
  useEffect(() => {
    const saved = localStorage.getItem("teashop_username");
    if (saved) setUsername(saved);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    // ... validate ...
    try {
      const user = await login(username, password);

      // Lưu username nếu tick "Ghi nhớ"
      if (rememberMe) {
        localStorage.setItem("teashop_username", username);
      } else {
        localStorage.removeItem("teashop_username");
      }

      navigate(user.role === "manager" ? "/manager" : "/");
    } catch (err: any) {
      // ... error handling ...
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label>Tên đăng nhập</label>
        <input
          type="text"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-5">
        <label>Mật khẩu</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="w-4 h-4 rounded border-divider"
        />
        <label htmlFor="rememberMe" className="text-sm text-foreground/60 cursor-pointer">
          Ghi nhớ đăng nhập
        </label>
      </div>

      <button type="submit" className="w-full">
        Đăng Nhập
      </button>
    </form>
  );
}
```

### Expected behavior

- Có icon 👁 bên phải input password, click để hiện/ẩn mật khẩu
- Có checkbox "Ghi nhớ đăng nhập" dưới form
- Nếu tick → lần sau mở trang tự động điền username (đã lưu trong localStorage)
- Nếu không tick → mở trang mới phải nhập lại từ đầu
- Chỉ lưu username, KHÔNG lưu password (bảo mật)
