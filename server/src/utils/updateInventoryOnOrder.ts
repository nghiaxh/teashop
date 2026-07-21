import Product from '../models/Product';
import Ingredient from '../models/Ingredient';
import { IOrder } from '../models/Order';

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
