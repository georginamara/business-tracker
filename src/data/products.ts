export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

export const initialProducts: Product[] = [
  { id: '1', name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 45 },
  { id: '2', name: 'Mechanical Keyboard', category: 'Electronics', price: 89.99, stock: 30 },
  { id: '3', name: 'USB-C Hub', category: 'Accessories', price: 45.00, stock: 22 },
  { id: '4', name: 'Monitor Stand', category: 'Furniture', price: 59.99, stock: 15 },
  { id: '5', name: 'Webcam HD', category: 'Electronics', price: 79.99, stock: 18 },
  { id: '6', name: 'USB-C Cable', category: 'Accessories', price: 12.99, stock: 60 },
  { id: '7', name: 'Laptop Sleeve', category: 'Accessories', price: 24.99, stock: 35 },
  { id: '8', name: 'Desk Lamp', category: 'Furniture', price: 39.99, stock: 12 },
]
