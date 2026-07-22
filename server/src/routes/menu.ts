import { Router, Response } from 'express';
import Product from '../models/Product';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, search } = req.query;

  const filter: any = { isActive: true };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const products = await Product.find(filter).sort({ category: 1, name: 1 });
  res.json({ products });
});

router.post('/', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, category, price } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Tên sản phẩm không được để trống' });
    return;
  }

  const validCategories = ['tra-sua', 'tra-trai-cay', 'ca-phe', 'da-xay', 'topping'];
  if (!category || !validCategories.includes(category)) {
    res.status(400).json({ error: 'Danh mục không hợp lệ' });
    return;
  }

  if (price === undefined || typeof price !== 'number' || price < 0) {
    res.status(400).json({ error: 'Giá phải là số không âm' });
    return;
  }

  const product = await Product.create({ name: name.trim(), category, price });
  res.status(201).json({ product });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, category, price } = req.body;
  const update: Record<string, any> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Tên sản phẩm không được để trống' });
      return;
    }
    update.name = name.trim();
  }

  if (category !== undefined) {
    const validCategories = ['tra-sua', 'tra-trai-cay', 'ca-phe', 'da-xay', 'topping'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: 'Danh mục không hợp lệ' });
      return;
    }
    update.category = category;
  }

  if (price !== undefined) {
    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ error: 'Giá phải là số không âm' });
      return;
    }
    update.price = price;
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );

  if (!product) {
    res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return;
  }

  res.json({ product });
});

router.delete('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return;
  }

  res.json({ message: 'Đã xóa sản phẩm' });
});

export default router;
