import {
  collection,
  doc,
  writeBatch,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { BusinessType } from '../data/store'

export interface DemoProduct {
  name: string
  category: string
  price: number
  initialStock: number
}

export const PRODUCT_CATALOG: Record<BusinessType, DemoProduct[]> = {
  'Sari-sari Store': [
    { name: 'Lucky Me Pancit Canton', category: 'Noodles', price: 15, initialStock: 50 },
    { name: 'Coke 1.5L', category: 'Beverages', price: 42, initialStock: 24 },
    { name: 'Royal 1.5L', category: 'Beverages', price: 42, initialStock: 24 },
    { name: 'Bear Brand Powdered Milk', category: 'Coffee & Milk', price: 58, initialStock: 20 },
    { name: 'Milo 3-in-1', category: 'Coffee & Milk', price: 12, initialStock: 40 },
    { name: 'Gardenia Bread 200g', category: 'Bread', price: 38, initialStock: 15 },
    { name: 'Nescafe Classic 3in1', category: 'Coffee & Milk', price: 8, initialStock: 60 },
    { name: 'Safeguard Soap', category: 'Personal Care', price: 25, initialStock: 30 },
    { name: 'Palmolive Shampoo', category: 'Personal Care', price: 45, initialStock: 20 },
    { name: 'Century Tuna Flakes', category: 'Canned Goods', price: 35, initialStock: 30 },
    { name: 'Argentina Corned Beef', category: 'Canned Goods', price: 38, initialStock: 25 },
    { name: 'SkyFlakes Crackers', category: 'Biscuits', price: 7, initialStock: 80 },
    { name: 'Piattos Sour Cream', category: 'Snacks', price: 20, initialStock: 40 },
    { name: 'Nova Original', category: 'Snacks', price: 20, initialStock: 40 },
    { name: 'Sprite 1.5L', category: 'Beverages', price: 42, initialStock: 24 },
    { name: 'Tender Juicy Hotdog', category: 'Frozen Goods', price: 95, initialStock: 15 },
    { name: 'Magic Sarap', category: 'Condiments', price: 12, initialStock: 40 },
    { name: 'Surf Powder 500g', category: 'Cleaning', price: 55, initialStock: 20 },
    { name: 'Downy Fabric Conditioner', category: 'Cleaning', price: 48, initialStock: 20 },
    { name: 'Alaska Evaporated Milk', category: 'Coffee & Milk', price: 22, initialStock: 30 },
  ],
  'Food & Beverage': [
    { name: 'Bottled Water 500ml', category: 'Beverages', price: 18, initialStock: 80 },
    { name: 'Coca-Cola 500ml', category: 'Beverages', price: 22, initialStock: 60 },
    { name: 'Sprite 500ml', category: 'Beverages', price: 22, initialStock: 60 },
    { name: 'Royal 500ml', category: 'Beverages', price: 22, initialStock: 60 },
    { name: 'C2 Green Tea 500ml', category: 'Beverages', price: 25, initialStock: 48 },
    { name: 'Iced Tea (Pitcher)', category: 'Beverages', price: 120, initialStock: 999 },
    { name: 'Fresh Lemonade', category: 'Beverages', price: 45, initialStock: 999 },
    { name: 'Siomai (4 pcs)', category: 'Snack', price: 45, initialStock: 999 },
    { name: 'Lumpia Shanghai (5 pcs)', category: 'Snack', price: 55, initialStock: 999 },
    { name: 'Fish Ball (10 pcs)', category: 'Street Food', price: 25, initialStock: 999 },
    { name: 'Kwek-Kwek (5 pcs)', category: 'Street Food', price: 30, initialStock: 999 },
    { name: 'Turon', category: 'Snack', price: 20, initialStock: 999 },
    { name: 'Halo-Halo', category: 'Dessert', price: 55, initialStock: 999 },
    { name: 'Mais Con Yelo', category: 'Dessert', price: 45, initialStock: 999 },
    { name: 'Graham Float Slice', category: 'Dessert', price: 50, initialStock: 999 },
    { name: 'Hardinero Iced Coffee', category: 'Beverages', price: 55, initialStock: 999 },
    { name: 'Bottled Juice (Orange)', category: 'Beverages', price: 35, initialStock: 30 },
    { name: 'Cheese Stick (5 pcs)', category: 'Snack', price: 35, initialStock: 999 },
    { name: 'Hotdog on Stick', category: 'Street Food', price: 25, initialStock: 999 },
    { name: 'Balut (per piece)', category: 'Street Food', price: 18, initialStock: 20 },
  ],
  'Restaurant': [
    { name: 'Sinigang na Baboy', category: 'Soups', price: 185, initialStock: 999 },
    { name: 'Tinolang Manok', category: 'Soups', price: 165, initialStock: 999 },
    { name: 'Nilagang Baka', category: 'Soups', price: 195, initialStock: 999 },
    { name: 'Chicken Adobo', category: 'Main Course', price: 155, initialStock: 999 },
    { name: 'Kare-Kare', category: 'Main Course', price: 210, initialStock: 999 },
    { name: 'Bicol Express', category: 'Main Course', price: 175, initialStock: 999 },
    { name: 'Pinakbet', category: 'Main Course', price: 165, initialStock: 999 },
    { name: 'Lechon Kawali', category: 'Main Course', price: 195, initialStock: 999 },
    { name: 'Grilled Liempo', category: 'Main Course', price: 185, initialStock: 999 },
    { name: 'Fish Tinola', category: 'Main Course', price: 155, initialStock: 999 },
    { name: 'Sisig', category: 'Main Course', price: 175, initialStock: 999 },
    { name: 'Calamares', category: 'Appetizers', price: 145, initialStock: 999 },
    { name: 'Lumpiang Shanghai', category: 'Appetizers', price: 135, initialStock: 999 },
    { name: 'Kare-Kare Bagoong', category: 'Sides', price: 25, initialStock: 999 },
    { name: 'Steamed Rice', category: 'Sides', price: 35, initialStock: 999 },
    { name: 'Garlic Rice', category: 'Sides', price: 45, initialStock: 999 },
    { name: 'Coke (Glass)', category: 'Beverages', price: 45, initialStock: 48 },
    { name: 'Iced Tea (Glass)', category: 'Beverages', price: 45, initialStock: 48 },
    { name: 'Halo-Halo', category: 'Desserts', price: 75, initialStock: 999 },
    { name: 'Buko Pandan', category: 'Desserts', price: 65, initialStock: 15 },
  ],
  'Café / Milk Tea': [
    { name: 'Classic Milk Tea (Medium)', category: 'Milk Tea', price: 79, initialStock: 999 },
    { name: 'Classic Milk Tea (Large)', category: 'Milk Tea', price: 99, initialStock: 999 },
    { name: 'Taro Milk Tea (Medium)', category: 'Milk Tea', price: 89, initialStock: 999 },
    { name: 'Taro Milk Tea (Large)', category: 'Milk Tea', price: 109, initialStock: 999 },
    { name: 'Matcha Milk Tea (Medium)', category: 'Milk Tea', price: 89, initialStock: 999 },
    { name: 'Matcha Milk Tea (Large)', category: 'Milk Tea', price: 109, initialStock: 999 },
    { name: 'Wintermelon Milk Tea', category: 'Milk Tea', price: 95, initialStock: 999 },
    { name: 'Brown Sugar Pearl Milk Tea', category: 'Milk Tea', price: 105, initialStock: 999 },
    { name: 'Fruit Tea (Orange)', category: 'Fruit Tea', price: 75, initialStock: 999 },
    { name: 'Fruit Tea (Green Apple)', category: 'Fruit Tea', price: 75, initialStock: 999 },
    { name: 'Iced Americano', category: 'Coffee', price: 85, initialStock: 999 },
    { name: 'Iced Latte', category: 'Coffee', price: 95, initialStock: 999 },
    { name: 'Brown Sugar Latte', category: 'Coffee', price: 110, initialStock: 999 },
    { name: 'Caramel Macchiato', category: 'Coffee', price: 120, initialStock: 999 },
    { name: 'Cheesecake Foam', category: 'Toppings', price: 15, initialStock: 999 },
    { name: 'Tapioca Pearls', category: 'Toppings', price: 10, initialStock: 999 },
    { name: 'Pudding', category: 'Toppings', price: 15, initialStock: 999 },
    { name: 'Nata de Coco', category: 'Toppings', price: 10, initialStock: 999 },
    { name: 'Cream Cheese', category: 'Toppings', price: 20, initialStock: 999 },
    { name: 'Oreo Crumbs', category: 'Toppings', price: 15, initialStock: 999 },
  ],
  'Bakery': [
    { name: 'Pandesal (per piece)', category: 'Bread', price: 5, initialStock: 200 },
    { name: 'Ensaymada', category: 'Pastries', price: 25, initialStock: 50 },
    { name: 'Spanish Bread', category: 'Bread', price: 15, initialStock: 60 },
    { name: 'Cheese Roll', category: 'Pastries', price: 20, initialStock: 50 },
    { name: 'Mamon', category: 'Pastries', price: 15, initialStock: 40 },
    { name: 'Hopia Monggo', category: 'Pastries', price: 18, initialStock: 40 },
    { name: 'Ube Bread', category: 'Bread', price: 20, initialStock: 30 },
    { name: 'Whole Wheat Loaf', category: 'Bread', price: 65, initialStock: 15 },
    { name: 'White Bread Loaf', category: 'Bread', price: 55, initialStock: 20 },
    { name: 'Chocolate Cake Slice', category: 'Cakes', price: 55, initialStock: 10 },
    { name: 'Mango Bravo Slice', category: 'Cakes', price: 65, initialStock: 8 },
    { name: 'Carrot Cake Slice', category: 'Cakes', price: 50, initialStock: 10 },
    { name: 'Red Velvet Slice', category: 'Cakes', price: 60, initialStock: 8 },
    { name: 'Brownies', category: 'Pastries', price: 35, initialStock: 20 },
    { name: 'Cinnamon Roll', category: 'Pastries', price: 30, initialStock: 25 },
    { name: 'Donut (Glazed)', category: 'Pastries', price: 18, initialStock: 30 },
    { name: 'Donut (Chocolate)', category: 'Pastries', price: 20, initialStock: 30 },
    { name: 'Siopao (Asado)', category: 'Dimsum', price: 25, initialStock: 40 },
    { name: 'Siopao (Bola-Bola)', category: 'Dimsum', price: 30, initialStock: 40 },
    { name: 'Bottled Water', category: 'Beverages', price: 20, initialStock: 40 },
  ],
  'Grocery': [
    { name: 'Jasmine Rice 5kg', category: 'Rice & Grains', price: 280, initialStock: 30 },
    { name: 'Coca-Cola 1.5L', category: 'Beverages', price: 42, initialStock: 48 },
    { name: 'Pantene Shampoo 170ml', category: 'Personal Care', price: 135, initialStock: 20 },
    { name: 'Colgate Toothpaste 100ml', category: 'Personal Care', price: 89, initialStock: 25 },
    { name: 'Nestle Cream 250ml', category: 'Dairy', price: 52, initialStock: 30 },
    { name: 'Del Monte Ketchup 500ml', category: 'Condiments', price: 65, initialStock: 20 },
    { name: 'Bear Brand Powdered Milk', category: 'Dairy', price: 58, initialStock: 30 },
    { name: 'Lucky Me Pancit Canton', category: 'Noodles', price: 15, initialStock: 60 },
    { name: '555 Tuna Sardines', category: 'Canned Goods', price: 24, initialStock: 40 },
    { name: 'Gardenia Bread 400g', category: 'Bread', price: 62, initialStock: 20 },
    { name: 'Quickmelt Cheese 200g', category: 'Dairy', price: 142, initialStock: 15 },
    { name: 'Datu Puti Vinegar 500ml', category: 'Condiments', price: 38, initialStock: 30 },
    { name: 'Silver Swan Soy Sauce 500ml', category: 'Condiments', price: 36, initialStock: 30 },
    { name: 'Joy Dishwashing Liquid 500ml', category: 'Cleaning', price: 55, initialStock: 25 },
    { name: 'Tide Powder 1kg', category: 'Cleaning', price: 125, initialStock: 15 },
    { name: 'C2 Green Tea 500ml', category: 'Beverages', price: 25, initialStock: 40 },
    { name: 'Oishi Prawn Crackers', category: 'Snacks', price: 42, initialStock: 30 },
    { name: 'Jack n Jill Nova', category: 'Snacks', price: 20, initialStock: 50 },
    { name: 'Magnolia Ice Cream 1L', category: 'Frozen Goods', price: 185, initialStock: 10 },
    { name: 'Purefoods Hotdog 250g', category: 'Frozen Goods', price: 89, initialStock: 20 },
  ],
  'Pharmacy': [
    { name: 'Paracetamol 500mg (10 tabs)', category: 'Medicine', price: 25, initialStock: 50 },
    { name: 'Ibuprofen 400mg (10 tabs)', category: 'Medicine', price: 35, initialStock: 40 },
    { name: 'Biogesic 500mg (10 tabs)', category: 'Medicine', price: 30, initialStock: 50 },
    { name: 'Decolgen (10 tabs)', category: 'Medicine', price: 45, initialStock: 35 },
    { name: 'Buscopan (10 tabs)', category: 'Medicine', price: 65, initialStock: 25 },
    { name: 'Loperamide (10 tabs)', category: 'Medicine', price: 35, initialStock: 30 },
    { name: 'Mefenamic Acid (10 tabs)', category: 'Medicine', price: 40, initialStock: 35 },
    { name: 'Neozep (10 tabs)', category: 'Medicine', price: 55, initialStock: 40 },
    { name: 'Alaxan (10 tabs)', category: 'Medicine', price: 50, initialStock: 25 },
    { name: 'Salonpas Patch (3 pcs)', category: 'Topical', price: 65, initialStock: 20 },
    { name: 'Cetirizine 10mg (10 tabs)', category: 'Medicine', price: 30, initialStock: 35 },
    { name: 'Vitamin C 500mg (30 tabs)', category: 'Supplements', price: 120, initialStock: 20 },
    { name: 'Multivitamins (30 caps)', category: 'Supplements', price: 185, initialStock: 15 },
    { name: 'Alcohol 500ml', category: 'Hygiene', price: 65, initialStock: 30 },
    { name: 'Face Mask (10 pcs)', category: 'Hygiene', price: 55, initialStock: 40 },
    { name: 'Cotton Balls (100g)', category: 'Hygiene', price: 35, initialStock: 25 },
    { name: 'Thermometer', category: 'Medical Device', price: 250, initialStock: 10 },
    { name: 'Band-Aid (10 pcs)', category: 'First Aid', price: 45, initialStock: 30 },
    { name: 'Betadine 15ml', category: 'First Aid', price: 55, initialStock: 20 },
    { name: 'ORS Sachet (10 pcs)', category: 'Medicine', price: 85, initialStock: 20 },
  ],
  'Hardware': [
    { name: 'Portland Cement 40kg', category: 'Construction', price: 265, initialStock: 30 },
    { name: 'Hollow Blocks (per piece)', category: 'Construction', price: 12, initialStock: 200 },
    { name: 'Sand (per cubic meter)', category: 'Construction', price: 1200, initialStock: 5 },
    { name: 'Gravel (per cubic meter)', category: 'Construction', price: 1400, initialStock: 5 },
    { name: 'GI Sheet (10 ft)', category: 'Roofing', price: 320, initialStock: 15 },
    { name: 'Plywood 4x8', category: 'Lumber', price: 520, initialStock: 10 },
    { name: 'Coco Lumber (per piece)', category: 'Lumber', price: 85, initialStock: 30 },
    { name: 'Cylinder Nail 3"', category: 'Fasteners', price: 45, initialStock: 50 },
    { name: 'Concrete Nail 3"', category: 'Fasteners', price: 55, initialStock: 40 },
    { name: 'Paint (1 Liter - White)', category: 'Paint', price: 185, initialStock: 20 },
    { name: 'Paint (1 Liter - Blue)', category: 'Paint', price: 195, initialStock: 15 },
    { name: 'Paint Thinner 1L', category: 'Paint', price: 120, initialStock: 15 },
    { name: 'PVC Pipe 1/2" (10 ft)', category: 'Plumbing', price: 45, initialStock: 40 },
    { name: 'PVC Pipe 1" (10 ft)', category: 'Plumbing', price: 85, initialStock: 30 },
    { name: 'PVC Elbow 1/2"', category: 'Plumbing', price: 12, initialStock: 60 },
    { name: 'Electrical Wire 2.5mm (10m)', category: 'Electrical', price: 180, initialStock: 20 },
    { name: 'Outlet Receptacle', category: 'Electrical', price: 65, initialStock: 25 },
    { name: 'Light Switch', category: 'Electrical', price: 45, initialStock: 30 },
    { name: 'Bulb 10W LED', category: 'Electrical', price: 95, initialStock: 25 },
    { name: 'DO-14 Door Knob', category: 'Hardware', price: 185, initialStock: 15 },
  ],
  'Clothing': [
    { name: 'Plain T-Shirt (S)', category: 'Tops', price: 120, initialStock: 30 },
    { name: 'Plain T-Shirt (M)', category: 'Tops', price: 120, initialStock: 40 },
    { name: 'Plain T-Shirt (L)', category: 'Tops', price: 120, initialStock: 35 },
    { name: 'Plain T-Shirt (XL)', category: 'Tops', price: 130, initialStock: 25 },
    { name: 'Polo Shirt (M)', category: 'Tops', price: 185, initialStock: 20 },
    { name: 'Polo Shirt (L)', category: 'Tops', price: 185, initialStock: 20 },
    { name: 'Denim Jeans (28)', category: 'Bottoms', price: 295, initialStock: 15 },
    { name: 'Denim Jeans (30)', category: 'Bottoms', price: 295, initialStock: 20 },
    { name: 'Denim Jeans (32)', category: 'Bottoms', price: 295, initialStock: 20 },
    { name: 'Denim Jeans (34)', category: 'Bottoms', price: 310, initialStock: 15 },
    { name: 'Cargo Shorts', category: 'Bottoms', price: 195, initialStock: 20 },
    { name: 'Jersey Shorts', category: 'Bottoms', price: 150, initialStock: 25 },
    { name: 'Sando (3-pack)', category: 'Underwear', price: 99, initialStock: 30 },
    { name: 'Briefs (3-pack)', category: 'Underwear', price: 120, initialStock: 25 },
    { name: 'Cap / Hat', category: 'Accessories', price: 120, initialStock: 15 },
    { name: 'Belt (Leather)', category: 'Accessories', price: 150, initialStock: 12 },
    { name: 'Socks (3-pack)', category: 'Accessories', price: 75, initialStock: 25 },
    { name: 'Jacket (Light)', category: 'Outerwear', price: 350, initialStock: 10 },
    { name: 'Flip-Flops', category: 'Footwear', price: 99, initialStock: 20 },
    { name: 'Canvas Shoes', category: 'Footwear', price: 250, initialStock: 15 },
  ],
  'Electronics': [
    { name: 'USB Cable Type-C', category: 'Accessories', price: 99, initialStock: 30 },
    { name: 'USB Cable Lightning', category: 'Accessories', price: 120, initialStock: 20 },
    { name: 'Earphones (Wired)', category: 'Audio', price: 150, initialStock: 25 },
    { name: 'Bluetooth Earbuds', category: 'Audio', price: 350, initialStock: 15 },
    { name: 'Power Bank 10000mAh', category: 'Power', price: 450, initialStock: 12 },
    { name: 'Power Bank 20000mAh', category: 'Power', price: 750, initialStock: 8 },
    { name: 'Phone Case (Generic)', category: 'Accessories', price: 99, initialStock: 40 },
    { name: 'Tempered Glass', category: 'Accessories', price: 75, initialStock: 50 },
    { name: 'Wall Charger 20W', category: 'Power', price: 199, initialStock: 20 },
    { name: 'Car Charger', category: 'Power', price: 175, initialStock: 15 },
    { name: 'Mouse (Wired)', category: 'Peripherals', price: 250, initialStock: 10 },
    { name: 'Mousepad', category: 'Peripherals', price: 120, initialStock: 15 },
    { name: 'Keyboard (Membrane)', category: 'Peripherals', price: 350, initialStock: 10 },
    { name: 'USB Flash Drive 16GB', category: 'Storage', price: 180, initialStock: 15 },
    { name: 'USB Flash Drive 32GB', category: 'Storage', price: 250, initialStock: 12 },
    { name: 'HDMI Cable 1.5m', category: 'Cables', price: 120, initialStock: 20 },
    { name: 'Extension Cord (3-gang)', category: 'Power', price: 99, initialStock: 25 },
    { name: 'Electric Fan (Mini)', category: 'Appliances', price: 450, initialStock: 8 },
    { name: 'LED Desk Lamp', category: 'Lighting', price: 350, initialStock: 10 },
    { name: 'AA Batteries (4-pack)', category: 'Power', price: 55, initialStock: 30 },
  ],
  'Services': [
    { name: 'Basic Haircut', category: 'Grooming', price: 80, initialStock: 999 },
    { name: 'Haircut + Shave', category: 'Grooming', price: 120, initialStock: 999 },
    { name: 'Hair Color', category: 'Grooming', price: 250, initialStock: 999 },
    { name: 'Manicure', category: 'Grooming', price: 80, initialStock: 999 },
    { name: 'Pedicure', category: 'Grooming', price: 100, initialStock: 999 },
    { name: 'Foot Spa', category: 'Grooming', price: 150, initialStock: 999 },
    { name: 'laundry (per kilo)', category: 'Laundry', price: 45, initialStock: 999 },
    { name: 'Dry Cleaning (per piece)', category: 'Laundry', price: 80, initialStock: 999 },
    { name: 'Express Wash + Iron', category: 'Laundry', price: 60, initialStock: 999 },
    { name: 'Phone Screen Repair', category: 'Repair', price: 350, initialStock: 999 },
    { name: 'Phone Battery Replacement', category: 'Repair', price: 250, initialStock: 999 },
    { name: 'Computer Cleaning', category: 'Repair', price: 200, initialStock: 999 },
    { name: 'Photocopy (per page)', category: 'Printing', price: 2, initialStock: 999 },
    { name: 'Lamination (A4)', category: 'Printing', price: 25, initialStock: 999 },
    { name: 'Printing (per page B&W)', category: 'Printing', price: 5, initialStock: 999 },
    { name: 'Printing (per page Color)', category: 'Printing', price: 10, initialStock: 999 },
    { name: 'Notary Service', category: 'Legal', price: 200, initialStock: 999 },
    { name: 'ID Photo (Set of 8)', category: 'Photo', price: 80, initialStock: 999 },
    { name: 'E-Loading (any network)', category: 'Loading', price: 1, initialStock: 999 },
    { name: 'Bill Payment Service', category: 'Payment', price: 10, initialStock: 999 },
  ],
  'Others': [
    { name: 'Product A', category: 'General', price: 100, initialStock: 50 },
    { name: 'Product B', category: 'General', price: 150, initialStock: 40 },
    { name: 'Product C', category: 'General', price: 200, initialStock: 30 },
    { name: 'Product D', category: 'General', price: 75, initialStock: 60 },
    { name: 'Product E', category: 'General', price: 250, initialStock: 20 },
    { name: 'Product F', category: 'General', price: 50, initialStock: 80 },
    { name: 'Product G', category: 'General', price: 120, initialStock: 35 },
    { name: 'Product H', category: 'General', price: 180, initialStock: 25 },
    { name: 'Product I', category: 'General', price: 90, initialStock: 45 },
    { name: 'Product J', category: 'General', price: 300, initialStock: 15 },
    { name: 'Product K', category: 'General', price: 60, initialStock: 70 },
    { name: 'Product L', category: 'General', price: 110, initialStock: 40 },
    { name: 'Product M', category: 'General', price: 140, initialStock: 30 },
    { name: 'Product N', category: 'General', price: 160, initialStock: 25 },
    { name: 'Product O', category: 'General', price: 190, initialStock: 20 },
    { name: 'Product P', category: 'General', price: 220, initialStock: 18 },
    { name: 'Product Q', category: 'General', price: 85, initialStock: 55 },
    { name: 'Product R', category: 'General', price: 130, initialStock: 35 },
    { name: 'Product S', category: 'General', price: 170, initialStock: 28 },
    { name: 'Product T', category: 'General', price: 95, initialStock: 50 },
  ],
}

const CUSTOMER_NAMES = [
  'Maria Santos', 'Juan Dela Cruz', 'Ana Reyes', 'Jose Mendoza',
  'Rosario Garcia', 'Pedro Villanueva', 'Liza Bautista', 'Carlo Ramos',
  'Sofia Lim', 'Miguel Torres', 'Teresa Aquino', 'Ricardo Sy',
]

const EXPENSE_TEMPLATES = [
  { description: 'Electricity Bill', category: 'Utilities', min: 800, max: 2500 },
  { description: 'Water Bill', category: 'Utilities', min: 200, max: 600 },
  { description: 'Jeepney Fare', category: 'Transportation', min: 15, max: 60 },
  { description: 'Tricycle Fare', category: 'Transportation', min: 20, max: 100 },
  { description: 'Plastic Bags', category: 'Supplies', min: 50, max: 200 },
  { description: 'Receipt Paper', category: 'Supplies', min: 80, max: 150 },
  { description: 'Internet Bill', category: 'Utilities', min: 1000, max: 1500 },
  { description: 'Store Cleaning', category: 'Maintenance', min: 200, max: 500 },
  { description: 'Packaging Tape', category: 'Supplies', min: 30, max: 80 },
  { description: 'Wiping Rags', category: 'Supplies', min: 25, max: 60 },
  { description: 'Load for Store Phone', category: 'Miscellaneous', min: 50, max: 200 },
  { description: 'Fertilizer for Plants', category: 'Miscellaneous', min: 100, max: 300 },
  { description: 'Bulb Replacement', category: 'Maintenance', min: 50, max: 120 },
  { description: 'Ice Purchase', category: 'Inventory', min: 30, max: 80 },
  { description: 'Charcoal', category: 'Inventory', min: 20, max: 50 },
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomFloat(min: number, max: number): number {
  return Number((Math.random() * (max - min) + min).toFixed(2))
}

function randomDateWithinDays(days: number): Date {
  const now = Date.now()
  const msInDay = 86_400_000
  return new Date(now - Math.floor(Math.random() * days * msInDay))
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

interface PendingSale {
  ref: ReturnType<typeof doc>
  data: Record<string, unknown>
  movements: Record<string, unknown>[]
  productUpdates: { ref: ReturnType<typeof doc>; newStock: number }[]
}

export async function generateDemoData(ownerId: string): Promise<void> {
  // ── Step 1: Read store document ──────────────────────────────────
  const storeSnap = await getDoc(doc(db, 'stores', ownerId))
  const storeData = storeSnap.data()
  const businessType = (storeData?.businessType as BusinessType) || 'Others'

  const demoProducts = PRODUCT_CATALOG[businessType] || PRODUCT_CATALOG['Others']

  const productsCol = collection(db, 'products')
  const salesCol = collection(db, 'sales')
  const expensesCol = collection(db, 'expenses')
  const creditsCol = collection(db, 'credits')
  const creditPaymentsCol = collection(db, 'credit_payments')
  const inventoryCol = collection(db, 'inventory_movements')

  const productRefs = demoProducts.map(() => doc(productsCol))
  const productIds = productRefs.map((r) => r.id)
  const saleRefs = Array.from({ length: 60 }, () => doc(salesCol))
  const creditRefs = Array.from({ length: 8 }, () => doc(creditsCol))
  const paymentRefs = Array.from({ length: 8 }, () => doc(creditPaymentsCol))

  // ── Pass 1: Create products ──────────────────────────────────────
  const b1 = writeBatch(db)
  demoProducts.forEach((p, i) => {
    const ref = productRefs[i]
    b1.set(ref, {
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.initialStock,
      ownerId,
    })
  })
  try {
    await b1.commit()
  } catch (err) {
    console.error('[DEMO] Pass 1 FAILED:', err)
    throw err
  }

  // ── Build sale data ──────────────────────────────────────────────
  const runningStock = demoProducts.map((p) => p.initialStock)
  const pendingSales: PendingSale[] = []

  for (let i = 0; i < 60; i++) {
    const itemCount = randomInt(1, 4)
    const pickedIndices = shuffle(
      Array.from({ length: demoProducts.length }, (_, idx) => idx)
    ).slice(0, itemCount)

    const items = pickedIndices.map((pIdx) => {
      const qty = randomInt(1, 5)
      const price = demoProducts[pIdx].price
      return {
        productId: productIds[pIdx],
        productName: demoProducts[pIdx].name,
        quantity: qty,
        unitPrice: price,
        subtotal: qty * price,
      }
    })

    const rawTotal = items.reduce((s, it) => s + it.subtotal, 0)
    const hasDiscount = Math.random() < 0.2
    const discount = hasDiscount ? randomFloat(5, Math.min(rawTotal * 0.15, 50)) : 0
    const total = Number((rawTotal - discount).toFixed(2))
    const isCredit = Math.random() < 0.15
    const paid = isCredit ? randomFloat(0, total * 0.5) : total
    const saleDate = randomDateWithinDays(30)

    const movements: Record<string, unknown>[] = []
    const productUpdates: PendingSale['productUpdates'] = []

    pickedIndices.forEach((pIdx, j) => {
      const qty = items[j].quantity
      const prevStock = runningStock[pIdx]
      const newStock = Math.max(0, prevStock - qty)
      runningStock[pIdx] = newStock

      productUpdates.push({ ref: productRefs[pIdx], newStock })
      movements.push({
        ownerId,
        productId: productIds[pIdx],
        productName: demoProducts[pIdx].name,
        type: 'sale',
        quantity: qty,
        previousStock: prevStock,
        newStock,
        saleId: saleRefs[i].id,
        createdAt: Timestamp.fromDate(saleDate),
      })
    })

    pendingSales.push({
      ref: saleRefs[i],
      data: {
        ownerId,
        date: formatDate(saleDate),
        items,
        total,
        discount: discount || null,
        paid,
        change: 0,
        paymentMethod: isCredit ? 'credit' : 'cash',
      },
      movements,
      productUpdates,
    })
  }

  // ── Pass 2: Sales + product stock updates ────────────────────────
  const saleChunks = chunk(pendingSales, 100)
  for (let ci = 0; ci < saleChunks.length; ci++) {
    const batch = saleChunks[ci]
    const b = writeBatch(db)
    for (const sale of batch) {
      b.set(sale.ref, sale.data)
      for (const pu of sale.productUpdates) {
        b.update(pu.ref, { stock: pu.newStock })
      }
    }
    try {
      await b.commit()
    } catch (err) {
      console.error('[DEMO] Pass 2 chunk', ci, 'FAILED:', err)
      throw err
    }
  }

  // ── Pass 3: Inventory movements from sales ───────────────────────
  const allMovements = pendingSales.flatMap((s) => s.movements)
  const movementChunks = chunk(allMovements, 100)
  for (let ci = 0; ci < movementChunks.length; ci++) {
    const batch = movementChunks[ci]
    const b = writeBatch(db)
    for (const m of batch) {
      b.set(doc(inventoryCol), m)
    }
    try {
      await b.commit()
    } catch (err) {
      console.error('[DEMO] Pass 3 chunk', ci, 'FAILED:', err)
      throw err
    }
  }

  // ── Pass 4: Expenses ─────────────────────────────────────────────
  const b4 = writeBatch(db)
  for (let i = 0; i < 15; i++) {
    const t = EXPENSE_TEMPLATES[i % EXPENSE_TEMPLATES.length]
    const amount = randomInt(t.min, t.max)
    const d = randomDateWithinDays(30)
    b4.set(doc(expensesCol), {
      ownerId,
      description: t.description,
      category: t.category,
      amount,
      date: formatDate(d),
      notes: null,
      createdAt: Timestamp.fromDate(d),
    })
  }
  try {
    await b4.commit()
  } catch (err) {
    console.error('[DEMO] Pass 4 FAILED:', err)
    throw err
  }

  // ── Pass 5: Credits ──────────────────────────────────────────────
  const creditSaleIndices = shuffle(
    Array.from({ length: 60 }, (_, i) => i)
  ).slice(0, 8)

  const b5 = writeBatch(db)
  for (let i = 0; i < 8; i++) {
    const sale = pendingSales[creditSaleIndices[i]]
    const saleItems = sale.data.items as { productId: string; productName: string; quantity: number; unitPrice: number; subtotal: number }[]
    const totalAmount = sale.data.total as number

    const roll = Math.random()
    const status: 'Unpaid' | 'Partial' | 'Paid' = roll < 0.33 ? 'Unpaid' : roll < 0.66 ? 'Partial' : 'Paid'
    const amountPaid = status === 'Unpaid' ? 0 : status === 'Partial' ? randomFloat(totalAmount * 0.2, totalAmount * 0.7) : totalAmount
    const remainingBalance = Number((totalAmount - amountPaid).toFixed(2))
    const creditDate = randomDateWithinDays(30)

    b5.set(creditRefs[i], {
      ownerId,
      customerName: pick(CUSTOMER_NAMES),
      contactNumber: `09${randomInt(100_000_000, 999_999_999)}`,
      saleId: sale.ref.id,
      items: saleItems,
      totalAmount,
      amountPaid,
      remainingBalance,
      status,
      notes: null,
      createdAt: Timestamp.fromDate(creditDate),
      updatedAt: Timestamp.fromDate(creditDate),
    })

    if (status === 'Partial' && amountPaid > 0) {
      b5.set(paymentRefs[i], {
        ownerId,
        creditId: creditRefs[i].id,
        amount: amountPaid,
        date: formatDate(creditDate),
      })
    }
  }
  try {
    await b5.commit()
  } catch (err) {
    console.error('[DEMO] Pass 5 FAILED:', err)
    throw err
  }

  // ── Pass 6: Restock inventory movements ──────────────────────────
  const restockIndices = shuffle(
    Array.from({ length: demoProducts.length }, (_, i) => i)
  ).slice(0, randomInt(5, 10))

  const b6 = writeBatch(db)
  for (const pIdx of restockIndices) {
    const quantityAdded = randomInt(10, 50)
    const prevStock = runningStock[pIdx]
    const newStock = prevStock + quantityAdded
    runningStock[pIdx] = newStock

    b6.update(productRefs[pIdx], { stock: newStock })
    b6.set(doc(inventoryCol), {
      ownerId,
      productId: productIds[pIdx],
      productName: demoProducts[pIdx].name,
      type: 'restock',
      quantityAdded,
      previousStock: prevStock,
      newStock,
      supplier: pick(['Puregold', 'Robinsons Supermarket', 'Direct Supplier', 'Local Distributor']),
      notes: null,
      createdAt: Timestamp.fromDate(randomDateWithinDays(15)),
    })
  }
  try {
    await b6.commit()
  } catch (err) {
    console.error('[DEMO] Pass 6 FAILED:', err)
    throw err
  }
}

export async function loadDefaultProducts(ownerId: string): Promise<{ imported: number }> {
  const storeSnap = await getDoc(doc(db, 'stores', ownerId))
  const storeData = storeSnap.data()
  const businessType = (storeData?.businessType as BusinessType) || 'Others'
  const catalog = PRODUCT_CATALOG[businessType] || PRODUCT_CATALOG['Others']

  const productsCol = collection(db, 'products')
  const b = writeBatch(db)
  for (const p of catalog) {
    const ref = doc(productsCol)
    b.set(ref, {
      name: p.name,
      category: p.category,
      price: p.price,
      stock: p.initialStock,
      ownerId,
    })
  }
  await b.commit()
  return { imported: catalog.length }
}

const CLEAR_COLLECTIONS = [
  'products',
  'sales',
  'expenses',
  'credits',
  'credit_payments',
  'inventory_movements',
] as const

export async function clearDemoData(ownerId: string): Promise<void> {
  const BATCH_SIZE = 500

  for (const colName of CLEAR_COLLECTIONS) {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const colRef = collection(db, colName)
      const q = query(colRef, where('ownerId', '==', ownerId))
      const snapshot = await getDocs(q)
      if (snapshot.empty) break

      const docs = snapshot.docs.slice(0, BATCH_SIZE)

      const b = writeBatch(db)
      for (const d of docs) {
        b.delete(d.ref)
      }
      try {
        await b.commit()
      } catch (batchError) {
        console.error(`[CLEAR] ${colName}: batch delete FAILED:`, batchError)
        for (const d of docs) {
          try {
            await deleteDoc(d.ref)
          } catch {
            // skip unauthorized or orphaned documents
          }
        }
      }

      if (docs.length < BATCH_SIZE) break
    }
  }
}
