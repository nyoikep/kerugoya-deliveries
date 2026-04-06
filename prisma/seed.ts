import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

let dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

let prisma: PrismaClient;

if (!dbUrl.startsWith('file:')) {
  console.warn(`DATABASE_URL is not a file URL but schema is SQLite. Falling back to local SQLite.`);
  dbUrl = 'file:./prisma/dev.db';
}

try {
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const adapter = new PrismaBetterSqlite3({ url: dbUrl });
  prisma = new PrismaClient({ adapter });
} catch (e) {
  console.error('Failed to load SQLite adapter:', e);
  prisma = new PrismaClient({} as any);
}

async function main() {
  // Check if we should actually seed (useful for production safety)
  if (process.env.NODE_ENV === 'production' && process.env.FORCE_SEED !== 'true') {
    console.log('Skipping seed in production. Set FORCE_SEED=true to override.');
    return;
  }

  console.log('Start seeding ...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      phone: '0000000000',
      password: hashedPassword,
      name: 'System Admin',
      role: 'ADMIN',
      status: 'APPROVED',
    },
  });

  // Create Rider
  const rider = await prisma.user.upsert({
    where: { email: 'rider@test.com' },
    update: {},
    create: {
      email: 'rider@test.com',
      phone: '1111111111',
      password: hashedPassword,
      name: 'Professional Rider',
      role: 'RIDER',
      status: 'APPROVED',
      idNumber: 'ID123456',
      motorcyclePlateNumber: 'KMD 123A',
    },
  });

  // Create Users
  const user1 = await prisma.user.upsert({
    where: { email: 'owner1@test.com' },
    update: {},
    create: {
      email: 'owner1@test.com',
      phone: '1234567890',
      password: hashedPassword,
      name: 'Business Owner 1',
      role: 'CLIENT',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'owner2@test.com' },
    update: {},
    create: {
      email: 'owner2@test.com',
      phone: '0987654321',
      password: hashedPassword,
      name: 'Business Owner 2',
      role: 'CLIENT',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'lokkomotto@test.com' },
    update: {},
    create: {
      email: 'lokkomotto@test.com',
      phone: '1112223333',
      password: hashedPassword,
      name: 'Lokko Motto Owner',
      role: 'CLIENT',
    },
  });

  const user4 = await prisma.user.upsert({
    where: { email: 'alphawines@test.com' },
    update: {},
    create: {
      email: 'alphawines@test.com',
      phone: '4445556666',
      password: hashedPassword,
      name: 'Alpha Wines Owner',
      role: 'CLIENT',
    },
  });

  const user5 = await prisma.user.upsert({
    where: { email: 'mbikaagencies@test.com' },
    update: {},
    create: {
      email: 'mbikaagencies@test.com',
      phone: '7778889999',
      password: hashedPassword,
      name: 'Mbika Agencies Owner',
      role: 'CLIENT',
    },
  });

  const hardwareOwner = await prisma.user.upsert({
    where: { email: 'hardwareowner@test.com' },
    update: {},
    create: {
      email: 'hardwareowner@test.com',
      phone: '1231231234',
      password: hashedPassword,
      name: 'Hardware Store Owner',
      role: 'CLIENT',
    },
  });

  const mrChipsOwner = await prisma.user.upsert({
    where: { email: 'mrchipsowner@test.com' },
    update: {},
    create: {
      email: 'mrchipsowner@test.com',
      phone: '4564564567',
      password: hashedPassword,
      name: 'MrChips Owner',
      role: 'CLIENT',
    },
  });

  const hotelOwner = await prisma.user.upsert({
    where: { email: 'hotelowner@test.com' },
    update: {},
    create: {
      email: 'hotelowner@test.com',
      phone: '7897897890',
      password: hashedPassword,
      name: 'Hotel Owner',
      role: 'CLIENT',
    },
  });

  // Create Businesses
  const lokkoMotto = await prisma.business.upsert({
    where: { name: 'Lokko Motto' },
    update: {},
    create: {
      name: 'Lokko Motto',
      description: 'A club that sells wines and spirits',
      category: 'SHOP',
      ownerId: user3.id,
    },
  });

  const alphaWines = await prisma.business.upsert({
    where: { name: 'Alpha Wines' },
    update: {},
    create: {
      name: 'Alpha Wines',
      description: 'Liquor store with a wide selection of wines',
      category: 'SHOP',
      ownerId: user4.id,
    },
  });

  const mbikaAgencies = await prisma.business.upsert({
    where: { name: 'Mbika Agencies' },
    update: {},
    create: {
      name: 'Mbika Agencies',
      description: 'Your trusted partner for spirits and beverages',
      category: 'SHOP',
      ownerId: user5.id,
    },
  });

  const bodaBodaServices = await prisma.business.upsert({
    where: { name: 'Boda Boda Services' },
    update: {},
    create: {
      name: 'Boda Boda Services',
      description: 'Fast and reliable transport services',
      category: 'SERVICE',
      ownerId: user2.id,
    },
  });

  const hardwareStore = await prisma.business.upsert({
    where: { name: 'Kerugoya Hardware' },
    update: {},
    create: {
      name: 'Kerugoya Hardware',
      description: 'Your one-stop shop for all hardware needs.',
      category: 'HARDWARE',
      ownerId: hardwareOwner.id,
    },
  });

  const mrChips = await prisma.business.upsert({
    where: { name: 'MrChips' },
    update: {},
    create: {
      name: 'MrChips',
      description: 'The best chips in town.',
      category: 'HOTEL',
      ownerId: mrChipsOwner.id,
    },
  });

  const grandHotel = await prisma.business.upsert({
    where: { name: 'Grand Hotel' },
    update: {},
    create: {
      name: 'Grand Hotel',
      description: 'Luxury hotel with a view.',
      category: 'HOTEL',
      ownerId: hotelOwner.id,
    },
  });


  // Create Products for Lokko Motto
  const products = [
    { name: 'Johnnie Walker Red Label (750ml)', description: 'Scotch Whisky', price: 2500, businessId: lokkoMotto.id, imageUrl: '/pexels-mcgzay-30661393.jpg' },
    { name: 'Smirnoff Vodka (750ml)', description: 'Premium Vodka', price: 1800, businessId: lokkoMotto.id, imageUrl: '/pexels-bruce-byereta-422939715-31961615.jpg' },
    { name: 'Gilbeys Gin (750ml)', description: 'Classic Gin', price: 1500, businessId: lokkoMotto.id, imageUrl: '/pexels-clayton-943956-11206901.jpg' },
    { name: 'Tusker Lager (500ml)', description: 'Local Beer', price: 250, businessId: lokkoMotto.id, imageUrl: '/pexels-odonti-photography-661992921-27999926.jpg' },
    { name: 'Guinness Stout (500ml)', description: 'Dark Beer', price: 300, businessId: lokkoMotto.id, imageUrl: 'https://images.unsplash.com/photo-1597075095404-0c2f6236b327?q=80&w=400' },
    { name: 'Four Cousins Sweet Red (750ml)', description: 'Sweet Red Wine', price: 1200, businessId: lokkoMotto.id, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400' },
    { name: 'K.C.B. Brandy (750ml)', description: 'Kenyan Brandy', price: 1000, businessId: lokkoMotto.id, imageUrl: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?q=80&w=400' },
    { name: 'Nederburg Baronne (750ml)', description: 'Red Wine', price: 1300, businessId: alphaWines.id, imageUrl: 'https://images.unsplash.com/photo-1553361371-9bb22f93ed6e?q=80&w=400' },
    { name: 'Cellar Cask Sweet White (5L)', description: 'Sweet White Wine', price: 2800, businessId: alphaWines.id, imageUrl: 'https://images.unsplash.com/photo-1569919650474-0498f3b6016c?q=80&w=400' },
    { name: 'Caprice Wine (750ml)', description: 'Assorted Flavors', price: 900, businessId: alphaWines.id, imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=400' },
    { name: 'Drostdy Hof Red (750ml)', description: 'Red Wine', price: 1100, businessId: alphaWines.id, imageUrl: 'https://images.unsplash.com/photo-1553361371-9bb22f93ed6e?q=80&w=400' },
    { name: 'Jack Daniels Old No. 7 (750ml)', description: 'Tennessee Whiskey', price: 3500, businessId: mbikaAgencies.id, imageUrl: 'https://images.unsplash.com/photo-1527281405159-ca568974777a?q=80&w=400' },
    { name: 'Bombay Sapphire Gin (750ml)', description: 'Premium Gin', price: 2200, businessId: mbikaAgencies.id, imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cea9e?q=80&w=400' },
    { name: 'Absolut Vodka (750ml)', description: 'Swedish Vodka', price: 2000, businessId: mbikaAgencies.id, imageUrl: 'https://images.unsplash.com/photo-1550985543-f47f38aee65e?q=80&w=400' },
    { name: 'Jameson Irish Whiskey (750ml)', description: 'Irish Whiskey', price: 2800, businessId: mbikaAgencies.id, imageUrl: 'https://images.unsplash.com/photo-1594224734568-7dfba8d32d04?q=80&w=400' },
    { name: 'Town Trip', description: 'A trip within the town', price: 150, businessId: bodaBodaServices.id, imageUrl: 'https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=400' },
    { name: 'Parcel Delivery', description: 'Deliver a parcel within the town', price: 200, businessId: bodaBodaServices.id, imageUrl: 'https://images.unsplash.com/photo-1566576721346-d4a3b4eaad5b?q=80&w=400' },
    { name: 'Shopping', description: 'We do the shopping for you', price: 300, businessId: bodaBodaServices.id, imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=400' },
    { name: 'Hammer', description: 'A tool for pounding things.', price: 500, businessId: hardwareStore.id, imageUrl: 'https://images.unsplash.com/photo-1586864387917-f349c4f15ee3?q=80&w=400' },
    { name: 'Screwdriver', description: 'A tool for turning screws.', price: 300, businessId: hardwareStore.id, imageUrl: 'https://images.unsplash.com/photo-1530124560676-41bc1275d4d6?q=80&w=400' },
    { name: 'Wrench', description: 'A tool for turning nuts and bolts.', price: 400, businessId: hardwareStore.id, imageUrl: 'https://images.unsplash.com/photo-1620054371900-5178f566e6c4?q=80&w=400' },
    { name: 'Chips', description: 'Plain chips.', price: 100, businessId: mrChips.id, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=400' },
    { name: 'Chips Masala', description: 'Chips with masala sauce.', price: 150, businessId: mrChips.id, imageUrl: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?q=80&w=400' },
    { name: 'Chips and Sausage', description: 'Chips with a sausage.', price: 200, businessId: mrChips.id, imageUrl: 'https://images.unsplash.com/photo-1626078297492-b7ca551ec442?q=80&w=400' },
    { name: 'Beef Stew', description: 'A hearty beef stew.', price: 500, businessId: grandHotel.id, imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=400' },
    { name: 'Chicken Curry', description: 'A spicy chicken curry.', price: 600, businessId: grandHotel.id, imageUrl: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?q=80&w=400' },
    { name: 'Fish and Chips', description: 'Classic fish and chips.', price: 450, businessId: grandHotel.id, imageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?q=80&w=400' },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: {
        imageUrl: product.imageUrl,
      },
      create: product,
    });
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
