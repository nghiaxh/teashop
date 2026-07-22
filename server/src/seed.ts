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
  { name: 'Cookies & Cream', category: 'da-xay', price: 38000, availableToppings: [toppings[5]] },
  { name: 'Trân châu đen', category: 'topping', price: 5000, availableToppings: [] },
  { name: 'Trân châu trắng', category: 'topping', price: 5000, availableToppings: [] },
  { name: 'Thạch dừa', category: 'topping', price: 5000, availableToppings: [] },
  { name: 'Pudding', category: 'topping', price: 8000, availableToppings: [] },
  { name: 'Khoai môn', category: 'topping', price: 8000, availableToppings: [] },
  { name: 'Kem cheese', category: 'topping', price: 10000, availableToppings: [] }
];

export async function seedDatabase(): Promise<void> {
  await mongoose.connect(MONGODB_URI);

  await User.deleteMany({});
  await Product.deleteMany({});
  await Ingredient.deleteMany({});
  await Order.deleteMany({});
  await Attendance.deleteMany({});

  const hashedPassword = await bcrypt.hash('123456', 10);

  const staffData = [
    { username: 'staff01', name: 'Nguyễn Văn An', gender: 'male' as const, phone: '0901234001', email: 'an.nguyen@teashop.vn', dateOfBirth: new Date('1995-03-15'), hireDate: new Date('2022-06-01') },
    { username: 'staff02', name: 'Trần Thị Bình', gender: 'female' as const, phone: '0901234002', email: 'binh.tran@teashop.vn', dateOfBirth: new Date('1998-07-22'), hireDate: new Date('2022-08-15') },
    { username: 'staff03', name: 'Lê Minh Đức', gender: 'male' as const, phone: '0901234003', email: 'duc.le@teashop.vn', dateOfBirth: new Date('1993-11-10'), hireDate: new Date('2023-01-10') },
    { username: 'staff04', name: 'Phạm Thị Elen', gender: 'female' as const, phone: '0901234004', email: 'elen.pham@teashop.vn', dateOfBirth: new Date('2000-01-05'), hireDate: new Date('2023-03-20') },
    { username: 'staff05', name: 'Hoàng Văn Giang', gender: 'male' as const, phone: '0901234005', email: 'giang.hoang@teashop.vn', dateOfBirth: new Date('1996-09-18'), hireDate: new Date('2023-05-01') },
    { username: 'staff06', name: 'Vũ Thị Hằng', gender: 'female' as const, phone: '0901234006', email: 'hang.vu@teashop.vn', dateOfBirth: new Date('1999-04-25'), hireDate: new Date('2023-07-12') },
    { username: 'staff07', name: 'Đặng Văn Kiên', gender: 'male' as const, phone: '0901234007', email: 'kien.dang@teashop.vn', dateOfBirth: new Date('1994-12-03'), hireDate: new Date('2023-09-01') },
    { username: 'staff08', name: 'Bùi Thị Lan', gender: 'female' as const, phone: '0901234008', email: 'lan.bui@teashop.vn', dateOfBirth: new Date('1997-06-14'), hireDate: new Date('2024-01-15') },
    { username: 'staff09', name: 'Ngô Minh Minh', gender: 'male' as const, phone: '0901234009', email: 'minh.ngo@teashop.vn', dateOfBirth: new Date('2001-08-30'), hireDate: new Date('2024-03-01') },
    { username: 'staff10', name: 'Đỗ Thị Oanh', gender: 'female' as const, phone: '0901234010', email: 'oanh.do@teashop.vn', dateOfBirth: new Date('1998-02-20'), hireDate: new Date('2024-05-10') },
  ];

  const managerData = [
    { username: 'manager01', name: 'Phan Văn Quang', gender: 'male' as const, phone: '0901234101', email: 'quang.phan@teashop.vn', dateOfBirth: new Date('1990-05-12'), hireDate: new Date('2022-01-01') },
    { username: 'manager02', name: 'Lý Thị Hương', gender: 'female' as const, phone: '0901234102', email: 'huong.ly@teashop.vn', dateOfBirth: new Date('1992-10-08'), hireDate: new Date('2022-03-01') },
  ];

  const staffUsers = [];
  for (const data of staffData) {
    const user = await User.create({ ...data, password: hashedPassword, role: 'staff' });
    staffUsers.push(user);
  }

  const managerUsers = [];
  for (const data of managerData) {
    const user = await User.create({ ...data, password: hashedPassword, role: 'manager' });
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

  const sampleNotes = [
    'Ít đường',
    'Nhiều đá',
    'Không đá',
    'Ít sữa',
    'Thêm đường',
    'Làm nhanh',
    'Ít đá'
  ];

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
        note: Math.random() > 0.5 ? sampleNotes[Math.floor(Math.random() * sampleNotes.length)] : undefined,
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
