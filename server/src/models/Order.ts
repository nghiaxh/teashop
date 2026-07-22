import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderTopping {
  name: string;
  price: number;
  quantity: number;
}

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
  toppings: IOrderTopping[];
  sugarLevel: number;
  iceLevel: number;
  itemTotal: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  note?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    size: { type: String, enum: ['S', 'M', 'L'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    toppings: [{
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 }
    }],
    sugarLevel: { type: Number, enum: [0, 25, 50, 75, 100], default: 50 },
    iceLevel: { type: Number, enum: [0, 25, 50, 75, 100], default: 50 },
    itemTotal: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  note: { type: String, trim: true, maxlength: 200 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model<IOrder>('Order', orderSchema);
