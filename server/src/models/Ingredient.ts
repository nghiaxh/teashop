import mongoose, { Document, Schema } from 'mongoose';

export interface IIngredient extends Document {
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  createdAt: Date;
  updatedAt: Date;
}

const ingredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true, trim: true },
  unit: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  reorderLevel: { type: Number, required: true, min: 0 }
}, { timestamps: true });

export default mongoose.model<IIngredient>('Ingredient', ingredientSchema);
