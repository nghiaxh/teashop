import { IOrderItem } from '../models/Order';

export function calculateOrderTotal(items: IOrderItem[]): number {
  return items.reduce((total, item) => {
    const basePrice = item.product as any;
    return total + (basePrice.price || 0) * item.quantity;
  }, 0);
}
