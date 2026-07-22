import mongoose, { Document, Schema } from 'mongoose';

export interface IProductIngredient {
  ingredientId: mongoose.Types.ObjectId;
  baseQuantity: number;
}

export interface IProductTopping {
  name: string;
  price: number;
}

export interface IProduct extends Document {
  name: string;
  category: 'tra-sua' | 'tra-trai-cay' | 'ca-phe' | 'da-xay' | 'topping';
  price: number;
  image: string;
  sizeMultipliers: {
    S: number;
    M: number;
    L: number;
  };
  availableToppings: IProductTopping[];
  ingredients: IProductIngredient[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ['tra-sua', 'tra-trai-cay', 'ca-phe', 'da-xay', 'topping'],
    required: true
  },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: '' },
  sizeMultipliers: {
    S: { type: Number, default: 1.0 },
    M: { type: Number, default: 1.3 },
    L: { type: Number, default: 1.6 }
  },
  availableToppings: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 }
  }],
  ingredients: [{
    ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
    baseQuantity: { type: Number, required: true, min: 0 }
  }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', productSchema);
