import { IOrderItem } from '../models/Order';

export function calculateOrderTotal(items: IOrderItem[]): number {
  return items.reduce((total, item) => total + item.itemTotal, 0);
}
