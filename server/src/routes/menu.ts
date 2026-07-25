import { Router, Response } from 'express';
import Product from '../models/Product';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { category, search, page, limit } = req.query;

  const filter: any = { isActive: true };

  if (category && category !== 'all') {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  if (page) {
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).skip(skip).limit(limitNum).sort({ category: 1, name: 1 }),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } else {
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json({ products });
  }
});

router.post('/', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, category, price, image } = req.body;

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

  const product = await Product.create({ name: name.trim(), category, price, image: image || '' });
  res.status(201).json({ product });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, category, price, image } = req.body;
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

  if (image !== undefined) update.image = image || '';

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

router.put('/:id/toggle', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Không tìm thấy sản phẩm' });
    return;
  }

  product.isActive = !product.isActive;
  await product.save();

  res.json({ product });
});

export default router;
