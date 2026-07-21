import { Router, Response } from 'express';
import Ingredient from '../models/Ingredient';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const ingredients = await Ingredient.find().sort({ name: 1 });
  res.json({ ingredients });
});

router.post('/', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const ingredient = await Ingredient.create(req.body);
  res.status(201).json({ ingredient });
});

router.put('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const ingredient = await Ingredient.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!ingredient) {
    res.status(404).json({ error: 'Ingredient not found' });
    return;
  }

  res.json({ ingredient });
});

router.delete('/:id', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  await Ingredient.findByIdAndDelete(req.params.id);
  res.json({ message: 'Ingredient deleted' });
});

export default router;
