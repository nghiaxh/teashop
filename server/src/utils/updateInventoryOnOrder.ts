import Product from '../models/Product';
import Ingredient from '../models/Ingredient';
import { IOrder } from '../models/Order';

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
