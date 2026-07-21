export interface User {
  id: string;
  username: string;
  name: string;
  role: 'staff' | 'manager';
}

export interface ProductTopping {
  name: string;
  price: number;
}

export interface ProductIngredient {
  ingredientId: string;
  baseQuantity: number;
}

export interface Product {
  _id: string;
  name: string;
  category: 'tra-sua' | 'tra-trai-cay' | 'ca-phe' | 'da-xay' | 'topping';
  price: number;
  image: string;
  sizeMultipliers: {
    S: number;
    M: number;
    L: number;
  };
  availableToppings: ProductTopping[];
  ingredients: ProductIngredient[];
  isActive: boolean;
  createdAt: string;
}

export interface Ingredient {
  _id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  createdAt: string;
}

export interface OrderTopping {
  name: string;
  price: number;
  quantity: number;
}

export interface OrderItem {
  product: string;
  productName: string;
  size: 'S' | 'M' | 'L';
  quantity: number;
  toppings: OrderTopping[];
  sugarLevel: number;
  iceLevel: number;
  itemTotal: number;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    name: string;
    username: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Attendance {
  _id: string;
  userId: {
    _id: string;
    name: string;
    username: string;
  };
  date: string;
  shift: 'morning' | 'afternoon';
  checkIn: string;
  checkOut: string | null;
  isLate: boolean;
  hoursWorked: number;
  createdAt: string;
}

export type CategoryType = 'tra-sua' | 'tra-trai-cay' | 'ca-phe' | 'da-xay' | 'topping' | 'all';
