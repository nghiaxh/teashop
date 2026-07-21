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
  const product = await Product.create(req.body);
  res.status(201).json({ product });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
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
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ message: 'Product deleted' });
});

export default router;
