import { Router, Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { requireAuth, requireManager, AuthRequest } from '../middleware/auth';
import { calculateOrderTotal } from '../utils/calculateOrderTotal';
import { updateInventoryOnOrder } from '../utils/updateInventoryOnOrder';
import { restoreInventoryOnOrder } from '../utils/restoreInventoryOnOrder';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { page = '1', limit = '20', status, date } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const filter: any = {};

  if (req.user?.role === 'staff') {
    filter.userId = req.user.id;
  }

  if (status) {
    filter.status = status;
  }

  if (date) {
    const startDate = new Date(date as string);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    filter.createdAt = { $gte: startDate, $lt: endDate };
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).skip(skip).limit(limitNum).sort({ createdAt: -1 }).populate('userId', 'name username'),
    Order.countDocuments(filter),
  ]);

  res.json({
    orders,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
  });
});

router.get('/:id', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const order = await Order.findById(req.params.id)
    .populate('userId', 'name username');

  if (!order) {
    res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    return;
  }

  if (req.user?.role === 'staff' && order.userId._id.toString() !== req.user.id) {
    res.status(403).json({ error: 'Không có quyền xem đơn hàng này' });
    return;
  }

  res.json({ order });
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  const { items, note } = req.body;

  if (!items || items.length === 0) {
    res.status(400).json({ error: 'Đơn hàng phải có ít nhất 1 món' });
    return;
  }

  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(400).json({ error: `Không tìm thấy sản phẩm ${item.product}` });
      return;
    }

    if (!product.isActive) {
      res.status(400).json({ error: `Sản phẩm "${product.name}" đã ngừng bán` });
      return;
    }

    const multiplier = product.sizeMultipliers?.[item.size as keyof typeof product.sizeMultipliers] || 1.0;
    const toppingTotal = (item.toppings || []).reduce(
      (sum: number, t: { price: number; quantity?: number }) => sum + t.price * (t.quantity || 1), 0
    );
    const itemTotal = product.price * multiplier * item.quantity + toppingTotal;
    orderItems.push({
      product: product._id,
      productName: product.name,
      size: item.size || 'M',
      quantity: item.quantity,
      toppings: item.toppings || [],
      sugarLevel: item.sugarLevel ?? 50,
      iceLevel: item.iceLevel ?? 50,
      itemTotal
    });
  }

  const totalAmount = calculateOrderTotal(orderItems);

  const order = await Order.create({
    userId: req.user!.id,
    items: orderItems,
    totalAmount,
    note: note || undefined,
    status: 'pending'
  });

  await updateInventoryOnOrder(order);

  res.status(201).json({ order });
});

router.put('/:id/status', requireAuth, requireManager, async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    res.status(400).json({ error: 'Trạng thái không hợp lệ' });
    return;
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    return;
  }

  if (order.status === 'cancelled') {
    res.status(400).json({ error: 'Đơn hàng đã bị hủy' });
    return;
  }

  if (status === 'cancelled') {
    await restoreInventoryOnOrder(order);
  }

  order.status = status;
  await order.save();

  res.json({ order });
});

export default router;
