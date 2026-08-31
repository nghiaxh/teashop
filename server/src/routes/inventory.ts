import { Router, Response } from 'express';
import Ingredient from '../models/Ingredient';
import Product from '../models/Product';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page, limit } = req.query;

  if (page) {
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [ingredients, total] = await Promise.all([
      Ingredient.find().skip(skip).limit(limitNum).sort({ name: 1 }),
      Ingredient.countDocuments(),
    ]);

    res.json({ ingredients, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } else {
    const ingredients = await Ingredient.find().sort({ name: 1 });
    res.json({ ingredients });
  }
});

router.post('/', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, unit, quantity, reorderLevel } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Tên nguyên liệu không được để trống' });
    return;
  }

  if (!unit || typeof unit !== 'string' || !unit.trim()) {
    res.status(400).json({ error: 'Đơn vị không được để trống' });
    return;
  }

  if (quantity === undefined || typeof quantity !== 'number' || quantity < 0) {
    res.status(400).json({ error: 'Số lượng phải là số không âm' });
    return;
  }

  if (reorderLevel === undefined || typeof reorderLevel !== 'number' || reorderLevel < 0) {
    res.status(400).json({ error: 'Mức đặt hàng lại phải là số không âm' });
    return;
  }

  const ingredient = await Ingredient.create({ name: name.trim(), unit: unit.trim(), quantity, reorderLevel });
  res.status(201).json({ ingredient });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, unit, quantity, reorderLevel } = req.body;
  const update: Record<string, any> = {};

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Tên nguyên liệu không được để trống' });
      return;
    }
    update.name = name.trim();
  }

  if (unit !== undefined) {
    if (typeof unit !== 'string' || !unit.trim()) {
      res.status(400).json({ error: 'Đơn vị không được để trống' });
      return;
    }
    update.unit = unit.trim();
  }

  if (quantity !== undefined) {
    if (typeof quantity !== 'number' || quantity < 0) {
      res.status(400).json({ error: 'Số lượng phải là số không âm' });
      return;
    }
    update.quantity = quantity;
  }

  if (reorderLevel !== undefined) {
    if (typeof reorderLevel !== 'number' || reorderLevel < 0) {
      res.status(400).json({ error: 'Mức đặt hàng lại phải là số không âm' });
      return;
    }
    update.reorderLevel = reorderLevel;
  }

  const ingredient = await Ingredient.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );

  if (!ingredient) {
    res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    return;
  }

  res.json({ ingredient });
});

router.delete('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const ingredient = await Ingredient.findById(req.params.id);
  if (!ingredient) {
    res.status(404).json({ error: 'Không tìm thấy nguyên liệu' });
    return;
  }

  const productUsingIt = await Product.findOne({ 'ingredients.ingredientId': req.params.id });
  if (productUsingIt) {
    res.status(400).json({ error: 'Nguyên liệu đang được sử dụng trong sản phẩm' });
    return;
  }

  await Ingredient.findByIdAndDelete(req.params.id);
  res.json({ message: 'Đã xóa nguyên liệu' });
});

export default router;
