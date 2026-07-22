# NOTES.md - Known Bugs & Fix Guide

This document describes the 6 known bugs in the TeaShop application and how to fix them.

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

## CR01 — Sai tổng tiền đơn hàng khi có topping

### Mô tả

Hàm `calculateOrderTotal()` chỉ cộng giá món chính (`product.price × quantity`), không cộng thêm giá topping đã chọn.

### File bị ảnh hưởng

- `server/src/utils/calculateOrderTotal.ts`

### Code hiện tại (sai)

```typescript
export function calculateOrderTotal(items: IOrderItem[]): number {
  return items.reduce((total, item) => {
    const basePrice = item.product as any;
    return total + (basePrice.price || 0) * item.quantity;
  }, 0);
}
```

### Cách reproduce

1. Tạo đơn hàng có chọn topping
2. Kiểm tra `totalAmount` trong database
3. Tổng tiền chỉ bao gồm giá món chính, không có tiền topping

### Cách fix

Duyệt qua `item.toppings[]`, cộng thêm `topping.price × topping.quantity`:

```typescript
export function calculateOrderTotal(items: IOrderItem[]): number {
  return items.reduce((total, item) => {
    const basePrice = (item.product as any).price || 0;
    const toppingPrice = item.toppings.reduce((sum, t) => sum + t.price * t.quantity, 0);
    return total + basePrice * item.quantity + toppingPrice;
  }, 0);
}
```

### Expected behavior

Tổng tiền = Σ (giá món × số lượng) + Σ (giá topping × số lượng topping)

---

## CR02 — Trừ tồn kho sai theo size

### Mô tả

Hàm `updateInventoryOnOrder()` dùng `baseQuantity` cố định, không nhân theo `sizeMultipliers[size]` (S=1.0, M=1.3, L=1.6).

### File bị ảnh hưởng

- `server/src/utils/updateInventoryOnOrder.ts`

### Code hiện tại (sai)

```typescript
export async function updateInventoryOnOrder(order: IOrder): Promise<void> {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    for (const ing of product.ingredients) {
      await Ingredient.findByIdAndUpdate(ing.ingredientId, {
        $inc: { quantity: -ing.baseQuantity * item.quantity },
      });
    }
  }
}
```

### Cách reproduce

1. Bán 1 ly size S và 1 ly size L cùng loại
2. Kiểm tra tồn kho - cả 2 đều trừ cùng số lượng
3. Thực tế size L phải trừ nhiều hơn 1.6 lần

### Cách fix

Lấy `sizeMultipliers[size]`, nhân với `baseQuantity`:

```typescript
export async function updateInventoryOnOrder(order: IOrder): Promise<void> {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const multiplier = product.sizeMultipliers[item.size] || 1.0;

    for (const ing of product.ingredients) {
      const deductAmount = ing.baseQuantity * multiplier * item.quantity;
      await Ingredient.findByIdAndUpdate(ing.ingredientId, {
        $inc: { quantity: -deductAmount },
      });
    }
  }
}
```

### Expected behavior

- Size S: baseQuantity × 1.0 × quantity
- Size M: baseQuantity × 1.3 × quantity
- Size L: baseQuantity × 1.6 × quantity

---

## PR01 — Lịch sử đơn hàng không phân trang

### Mô tả

API `GET /api/orders` dùng `Order.find({})` lấy toàn bộ dữ liệu một lần, không phân trang.

### File bị ảnh hưởng

- `server/src/routes/orders.ts`
- `client/src/pages/staff/OrderHistory.tsx`

### Code hiện tại (sai)

**Server:**

```typescript
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ orders });
});
```

**Client:**

```typescript
const fetchOrders = async () => {
  const res = await api.get("/orders");
  setOrders(res.data.orders);
};
```

### Cách reproduce

1. Seed database với 350+ đơn hàng
2. Load trang Order History
3. Nhận thấy chậm, payload lớn

### Cách fix

**Server:**

```typescript
router.get("/", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = "1", limit = "20" } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([Order.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }), Order.countDocuments(filter)]);

  res.json({ orders, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
});
```

**Client:**

- Thêm state cho pagination
- Thêm `<Pagination />` component
- Gọi API với `?page=X&limit=20`

### Expected behavior

- Mỗi trang hiển thị 20 đơn
- Có nút chuyển trang
- Hiển thị "Showing 1-20 of 350 orders"

---

## PR02 — Dashboard hiển thị sai thống kê

### Mô tả

Trang Dashboard tính `totalOrders` bằng `orders.length` — đếm **cả đơn `cancelled`** vào "Tổng đơn", gây nhiễu thống kê doanh thu và hiệu suất kinh doanh.

### File bị ảnh hưởng

- `client/src/pages/manager/Dashboard.tsx`

### Code hiện tại (sai)

```typescript
useEffect(() => {
  api.get("/orders").then((res) => {
    const orders: Order[] = res.data.orders || [];
    setStats({
      totalOrders: orders.length,  // đếm CẢ cancelled
      totalRevenue: orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.totalAmount, 0),
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      completedOrders: orders.filter((o) => o.status === "completed").length,
    });
  });
}, []);
```

→ `totalOrders` = 350 (bao gồm cancelled), nhưng `totalRevenue` chỉ tính đơn completed. Thống kê không nhất quán.

### Cách reproduce

1. Seed database với 350+ đơn hàng (có cả cancelled)
2. Vào trang Dashboard
3. Thấy "Tổng đơn: 350" nhưng "Hoàn thành: 280"
4. Người dùng nhầm lẫn: 350 đơn = 280 hoàn thành + 70 cancelled, nhưng giao diện không hiển thị `cancelledOrders`

### Cách fix

Thêm field `cancelledOrders` và hiển thị rõ ràng:

```typescript
useEffect(() => {
  api.get("/orders").then((res) => {
    const orders: Order[] = res.data.orders || [];
    const completed = orders.filter((o) => o.status === "completed");
    const pending = orders.filter((o) => o.status === "pending");
    const cancelled = orders.filter((o) => o.status === "cancelled");

    setStats({
      totalOrders: completed.length + pending.length,  // chỉ tính đơn đang hoạt động
      totalRevenue: completed.reduce((s, o) => s + o.totalAmount, 0),
      pendingOrders: pending.length,
      completedOrders: completed.length,
      cancelledOrders: cancelled.length,  // thêm field mới
    });
  });
}, []);
```

UI Dashboard thêm card "Đã hủy":

```tsx
<Card className="p-4">
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-xl bg-danger/10 flex items-center justify-center">
      <XCircle size={18} className="text-danger" weight="light" />
    </div>
    <div>
      <p className="text-xs text-foreground/50">Đã hủy</p>
      <p className="text-xl font-semibold tracking-tight">{stats.cancelledOrders}</p>
    </div>
  </div>
</Card>
```

### Expected behavior

- `totalOrders` chỉ hiển thị đơn **đang hoạt động** (completed + pending)
- Hiển thị riêng số đơn đã hủy
- Thống kê doanh thu chỉ tính đơn completed
- Phân biệt rõ ràng giữa "Tổng đơn" và "Đơn đã hủy"

---

## CR03 — Đơn hàng bị hủy không hoàn lại tồn kho

### Mô tả

Khi tạo đơn hàng, `updateInventoryOnOrder()` trừ tồn kho các nguyên liệu. Nhưng khi quản lý hủy đơn hàng (`PUT /orders/:id/status` với `status: 'cancelled'`), tồn kho **không được hoàn lại**.

### File bị ảnh hưởng

- `server/src/routes/orders.ts`
- `server/src/utils/updateInventoryOnOrder.ts`

### Code hiện tại (sai)

**Server — Route cập nhật status:**

```typescript
router.put("/:id/status", requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  if (!["pending", "completed", "cancelled"].includes(status)) {
    res.status(400).json({ error: "Trạng thái không hợp lệ" });
    return;
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });

  if (!order) {
    res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    return;
  }

  res.json({ order });
});
```

→ Không có logic hoàn tồn kho khi `status === 'cancelled'`.

### Cách reproduce

1. Tạo đơn hàng 2 ly trà sữa size M → kiểm tra tồn kho đã trừ
2. Hủy đơn hàng qua API `PUT /orders/:id/status` với `{ "status": "cancelled" }`
3. Kiểm tra tồn kho — vẫn bị trừ, **không được cộng lại**
4. Tồn kho bị sai lệch vĩnh viễn sau mỗi lần hủy

### Cách fix

Tạo hàm `restoreInventoryOnOrder()` — đảo ngược logic `updateInventoryOnOrder()`:

```typescript
// server/src/utils/restoreInventoryOnOrder.ts
import Product from "../models/Product";
import Ingredient from "../models/Ingredient";
import { IOrder } from "../models/Order";

export async function restoreInventoryOnOrder(order: IOrder): Promise<void> {
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const multiplier = product.sizeMultipliers[item.size] || 1.0;

    for (const ing of product.ingredients) {
      const restoreAmount = ing.baseQuantity * multiplier * item.quantity;
      await Ingredient.findByIdAndUpdate(ing.ingredientId, {
        $inc: { quantity: restoreAmount },
      });
    }
  }
}
```

Sửa route `PUT /:id/status`:

```typescript
import { restoreInventoryOnOrder } from "../utils/restoreInventoryOnOrder";

router.put("/:id/status", requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  if (!["pending", "completed", "cancelled"].includes(status)) {
    res.status(400).json({ error: "Trạng thái không hợp lệ" });
    return;
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ error: "Không tìm thấy đơn hàng" });
    return;
  }

  if (order.status === "cancelled") {
    res.status(400).json({ error: "Đơn hàng đã bị hủy" });
    return;
  }

  if (status === "cancelled") {
    await restoreInventoryOnOrder(order);
  }

  order.status = status;
  await order.save();

  res.json({ order });
});
```

### Expected behavior

- Tạo đơn → tồn kho trừ đúng (theo size multiplier)
- Hủy đơn → tồn kho được **hoàn lại đúng** theo size multiplier
- Không thể hủy đơn hàng đã bị hủy trước đó

---

## PR03 — Dashboard & Reports thiếu endpoint thống kê riêng

### Mô tả

Cả trang Dashboard (`/manager/dashboard`) và Reports (`/manager/reports`) đều gọi `GET /api/orders` lấy toàn bộ đơn hàng để tự tính thống kê ở client-side. Khi PR01 (phân trang) được fix, API chỉ trả 20 đơn → thống kê **sai hoàn toàn**.

### File bị ảnh hưởng

- `server/src/routes/orders.ts` (thiếu endpoint `/orders/stats`)
- `client/src/pages/manager/Dashboard.tsx`
- `client/src/pages/manager/Reports.tsx`

### Code hiện tại (sai)

**Dashboard.tsx:**

```typescript
useEffect(() => {
  api
    .get("/orders")
    .then((res) => {
      const orders: Order[] = res.data.orders || [];
      setStats({
        totalOrders: orders.length,
        totalRevenue: orders.filter((o) => o.status === "completed").reduce((s, o) => s + o.totalAmount, 0),
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        completedOrders: orders.filter((o) => o.status === "completed").length,
      });
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);
```

**Reports.tsx:**

```typescript
useEffect(() => {
  api
    .get("/orders")
    .then((res) => {
      const orders = res.data.orders;
      const completed = orders.filter((o: any) => o.status === "completed");
      const totalRevenue = completed.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
      setStats({
        totalOrders: orders.length,
        totalRevenue,
        avgOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0,
        completedOrders: completed.length,
      });
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);
```

### Cách reproduce

1. Seed database với 350+ đơn hàng
2. Fix PR01 (thêm phân trang server-side, mỗi trang 20 đơn)
3. Vào trang Dashboard → thống kê chỉ hiển thị dữ liệu từ 20 đơn đầu tiên
4. Tổng đơn hiển thị 20 thay vì 350+, doanh thu sai

### Cách fix

**Server — Thêm endpoint `/orders/stats`:**

```typescript
router.get("/stats", requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const filter: any = {};

  if (req.user?.role === "staff") {
    filter.userId = req.user.id;
  }

  const stats = await Order.aggregate([
    { $match: filter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  const result = {
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    avgOrderValue: 0,
  };

  for (const stat of stats) {
    result.totalOrders += stat.count;
    if (stat._id === "completed") {
      result.completedOrders = stat.count;
      result.totalRevenue = stat.revenue;
    }
    if (stat._id === "pending") result.pendingOrders = stat.count;
    if (stat._id === "cancelled") result.cancelledOrders = stat.count;
  }

  result.avgOrderValue = result.completedOrders > 0 ? Math.round(result.totalRevenue / result.completedOrders) : 0;

  res.json(result);
});
```

**Dashboard.tsx — Gọi endpoint stats:**

```typescript
useEffect(() => {
  api
    .get("/orders/stats")
    .then((res) => {
      setStats({
        totalOrders: res.data.totalOrders,
        totalRevenue: res.data.totalRevenue,
        pendingOrders: res.data.pendingOrders,
        completedOrders: res.data.completedOrders,
      });
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);
```

**Reports.tsx — Gọi endpoint stats:**

```typescript
useEffect(() => {
  api
    .get("/orders/stats")
    .then((res) => {
      setStats({
        totalOrders: res.data.totalOrders,
        totalRevenue: res.data.totalRevenue,
        avgOrderValue: res.data.avgOrderValue,
        completedOrders: res.data.completedOrders,
      });
      setLoading(false);
    })
    .catch(() => setLoading(false));
}, []);
```

### Expected behavior

- Dashboard hiển thị thống kê **chính xác** từ toàn bộ dữ liệu
- Reports hiển thị doanh thu trung bình, tỷ lệ hoàn thành chính xác
- API `/orders/stats` trả về kết quả aggregation nhanh, không load toàn bộ documents
- Khi thêm/xóa đơn hàng, thống kê cập nhật ngay lập tức
