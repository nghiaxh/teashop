import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User';
import Product from './models/Product';
import Ingredient from './models/Ingredient';
import Order from './models/Order';
import Attendance from './models/Attendance';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/teashop';

const ingredients = [
  { name: 'Trà nhài', unit: 'g', quantity: 5000, reorderLevel: 1000 },
  { name: 'Sữa tươi', unit: 'ml', quantity: 10000, reorderLevel: 2000 },
  { name: 'Sữa đặc', unit: 'ml', quantity: 5000, reorderLevel: 1000 },
  { name: 'Đường', unit: 'g', quantity: 5000, reorderLevel: 1000 },
  { name: 'Đá', unit: 'g', quantity: 20000, reorderLevel: 5000 },
  { name: 'Bột Matcha', unit: 'g', quantity: 1000, reorderLevel: 200 },
  { name: 'Cà phê bột', unit: 'g', quantity: 2000, reorderLevel: 500 },
  { name: 'Trân châu', unit: 'g', quantity: 3000, reorderLevel: 500 },
  { name: 'Thạch dừa', unit: 'g', quantity: 2000, reorderLevel: 500 },
  { name: 'Pudding mix', unit: 'g', quantity: 1500, reorderLevel: 300 },
  { name: 'Khoai môn', unit: 'g', quantity: 1500, reorderLevel: 300 },
  { name: 'Kem cheese', unit: 'ml', quantity: 2000, reorderLevel: 500 },
  { name: 'Đào ngâm', unit: 'g', quantity: 1000, reorderLevel: 200 },
  { name: 'Dâu tươi', unit: 'g', quantity: 1000, reorderLevel: 200 },
  { name: 'Đường nâu', unit: 'g', quantity: 1000, reorderLevel: 200 }
];

const toppings = [
  { name: 'Trân châu đen', price: 5000 },
  { name: 'Trân châu trắng', price: 5000 },
  { name: 'Thạch dừa', price: 5000 },
  { name: 'Pudding', price: 8000 },
  { name: 'Khoai môn', price: 8000 },
  { name: 'Kem cheese', price: 10000 }
];

const products = [
  { name: 'Trà Sữa Truyền Thống', category: 'tra-sua', price: 25000, availableToppings: toppings.slice(0, 3) },
  { name: 'Trà Sữa Matcha', category: 'tra-sua', price: 30000, availableToppings: [toppings[0], toppings[1], toppings[5]] },
  { name: 'Trà Sữa Khoai Môn', category: 'tra-sua', price: 30000, availableToppings: [toppings[0], toppings[4], toppings[3]] },
  { name: 'Trà Sữa Dâu', category: 'tra-sua', price: 30000, availableToppings: [toppings[0], toppings[1]] },
  { name: 'Trà Sữa Caramel', category: 'tra-sua', price: 32000, availableToppings: [toppings[0], toppings[3], toppings[5]] },
  { name: 'Trà Sữa Dừa', category: 'tra-sua', price: 30000, availableToppings: [toppings[0], toppings[1]] },
  { name: 'Trà Sữa Đào', category: 'tra-sua', price: 32000, availableToppings: [toppings[0], toppings[2]] },
  { name: 'Trà Chanh', category: 'tra-trai-cay', price: 20000, availableToppings: [toppings[1], toppings[2]] },
  { name: 'Trà Đào', category: 'tra-trai-cay', price: 25000, availableToppings: [toppings[1], toppings[2]] },
  { name: 'Trà Xoài', category: 'tra-trai-cay', price: 28000, availableToppings: [toppings[1], toppings[2]] },
  { name: 'Trà Dâu Tây', category: 'tra-trai-cay', price: 28000, availableToppings: [toppings[1]] },
  { name: 'Trà Việt Quất', category: 'tra-trai-cay', price: 30000, availableToppings: [toppings[1], toppings[2]] },
  { name: 'Cà Phê Đen', category: 'ca-phe', price: 20000, availableToppings: [] },
  { name: 'Cà Phê Sữa', category: 'ca-phe', price: 25000, availableToppings: [] },
  { name: 'Bạc Xỉu', category: 'ca-phe', price: 28000, availableToppings: [] },
  { name: 'Americano', category: 'ca-phe', price: 30000, availableToppings: [] },
  { name: 'Matcha Đá Xay', category: 'da-xay', price: 35000, availableToppings: [toppings[5], toppings[3]] },
  { name: 'Cà Phê Đá Xay', category: 'da-xay', price: 35000, availableToppings: [toppings[5]] },
  { name: 'Dâu Đá Xay', category: 'da-xay', price: 35000, availableToppings: [toppings[1]] },
  { name: 'Cookies & Cream', category: 'da-xay', price: 38000, availableToppings: [toppings[5]] }
];

export async function seedDatabase(): Promise<void> {
  await mongoose.connect(MONGODB_URI);

  await User.deleteMany({});
  await Product.deleteMany({});
  await Ingredient.deleteMany({});
  await Order.deleteMany({});
  await Attendance.deleteMany({});

  const hashedPassword = await bcrypt.hash('123456', 10);

  const staffUsers = [];
  for (let i = 1; i <= 15; i++) {
    const user = await User.create({
      username: `staff${i.toString().padStart(2, '0')}`,
      password: hashedPassword,
      name: `Nhân viên ${i.toString().padStart(2, '0')}`,
      role: 'staff'
    });
    staffUsers.push(user);
  }

  const managerUsers = [];
  for (let i = 1; i <= 3; i++) {
    const user = await User.create({
      username: `manager${i.toString().padStart(2, '0')}`,
      password: hashedPassword,
      name: `Quản lý ${i.toString().padStart(2, '0')}`,
      role: 'manager'
    });
    managerUsers.push(user);
  }

  const createdIngredients = await Ingredient.insertMany(ingredients);

  const ingredientMap = new Map<string, mongoose.Types.ObjectId>();
  createdIngredients.forEach((ing) => {
    ingredientMap.set(ing.name, ing._id);
  });

  const productDocs = products.map((p) => ({
    ...p,
    ingredients: [
      { ingredientId: ingredientMap.get('Trà nhài')!, baseQuantity: 15 },
      { ingredientId: ingredientMap.get('Sữa tươi')!, baseQuantity: 100 },
      { ingredientId: ingredientMap.get('Sữa đặc')!, baseQuantity: 30 },
      { ingredientId: ingredientMap.get('Đường')!, baseQuantity: 20 },
      { ingredientId: ingredientMap.get('Đá')!, baseQuantity: 100 }
    ]
  }));

  const createdProducts = await Product.insertMany(productDocs);

  const allUsers = [...staffUsers, ...managerUsers];
  const orders = [];

  for (let day = 0; day < 30; day++) {
    const ordersPerDay = Math.floor(Math.random() * 6) + 8;

    for (let o = 0; o < ordersPerDay; o++) {
      const user = allUsers[Math.floor(Math.random() * allUsers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const items = [];

      for (let i = 0; i < numItems; i++) {
        const product = createdProducts[Math.floor(Math.random() * createdProducts.length)];
        const sizes: Array<'S' | 'M' | 'L'> = ['S', 'M', 'L'];
        const size = sizes[Math.floor(Math.random() * sizes.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        const sugarLevels: number[] = [0, 25, 50, 75, 100];
        const iceLevels: number[] = [0, 25, 50, 75, 100];

        const availableToppings = product.availableToppings || [];
        const numToppings = Math.floor(Math.random() * Math.min(3, availableToppings.length + 1));
        const selectedToppings = availableToppings.slice(0, numToppings).map((t) => ({
          name: t.name,
          price: t.price,
          quantity: 1
        }));

        const itemTotal = product.price * quantity + selectedToppings.reduce((sum, t) => sum + t.price * t.quantity, 0);

        items.push({
          product: product._id,
          productName: product.name,
          size,
          quantity,
          toppings: selectedToppings,
          sugarLevel: sugarLevels[Math.floor(Math.random() * sugarLevels.length)],
          iceLevel: iceLevels[Math.floor(Math.random() * iceLevels.length)],
          itemTotal
        });
      }

      const totalAmount = items.reduce((sum, item) => sum + item.itemTotal, 0);
      const statuses: Array<'pending' | 'completed' | 'cancelled'> = ['completed', 'completed', 'completed', 'pending', 'cancelled'];
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(Math.floor(Math.random() * 14) + 6, Math.floor(Math.random() * 60));

      orders.push({
        userId: user._id,
        items,
        totalAmount,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        createdAt: date
      });
    }
  }

  await Order.insertMany(orders);

  const attendanceRecords = [];
  for (let day = 0; day < 14; day++) {
    for (const user of staffUsers) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      const shift = Math.random() > 0.5 ? 'morning' : 'afternoon';
      const shiftStart = shift === 'morning' ? 6 : 14;
      const isLate = Math.random() > 0.85;
      const checkIn = new Date(date);
      checkIn.setHours(shiftStart + (isLate ? Math.floor(Math.random() * 2) + 1 : 0), Math.floor(Math.random() * 60));

      const checkOut = new Date(date);
      checkOut.setHours(shiftStart + 8, Math.floor(Math.random() * 60));

      attendanceRecords.push({
        userId: user._id,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        shift,
        checkIn,
        checkOut,
        isLate,
        hoursWorked: Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60) * 10) / 10
      });
    }
  }

  await Attendance.insertMany(attendanceRecords);

  console.log('Seed completed:');
  console.log(`  - ${staffUsers.length} staff users`);
  console.log(`  - ${managerUsers.length} manager users`);
  console.log(`  - ${createdProducts.length} products`);
  console.log(`  - ${createdIngredients.length} ingredients`);
  console.log(`  - ${orders.length} orders`);
  console.log(`  - ${attendanceRecords.length} attendance records`);
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed finished');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
