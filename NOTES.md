# NOTES.md - Known Bugs & Fix Guide

This document describes the4 known bugs in the TeaShop application and how to fix them.

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
    const toppingPrice = item.toppings.reduce(
      (sum, t) => sum + t.price * t.quantity, 0
    );
    return total + (basePrice * item.quantity) + toppingPrice;
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
        $inc: { quantity: -ing.baseQuantity * item.quantity }
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
        $inc: { quantity: -deductAmount }
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
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ orders });
});
```

**Client:**
```typescript
const fetchOrders = async () => {
  const res = await api.get('/orders');
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
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Order.countDocuments(filter)
  ]);

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

## PR02 — Menu chưa có tìm kiếm / lọc

### Mô tả
Trang POS (CreateOrder) hiển thị toàn bộ danh sách món mà không có ô tìm kiếm hay bộ lọc theo danh mục.

### File bị ảnh hưởng
- `client/src/pages/staff/CreateOrder.tsx`

### Code hiện tại (sai)
```tsx
const filteredProducts = products.filter(p => {
  return selectedCategory === 'all' || p.category === selectedCategory;
});
// Không có search, chỉ filter theo category
```

### Cách reproduce
1. Vào trang Tạo đơn hàng
2. Thấy danh sách dài, phải cuộn tìm thủ công
3. Không thể search theo tên món

### Cách fix
Thêm state `search`, ô input search, và filter kết hợp:

```tsx
const [search, setSearch] = useState('');
const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

const filteredProducts = products.filter(p => {
  const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
  const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
  return matchSearch && matchCategory;
});
```

Thêm UI:
```tsx
<input
  type="text"
  placeholder="Tìm kiếm món..."
  className="input input-bordered w-full mb-4"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

### Expected behavior
- Có ô search để tìm theo tên món
- Có category tabs để lọc theo loại
- Kết quả filter realtime khi gõ
