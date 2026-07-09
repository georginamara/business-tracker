import { addDoc, collection } from 'firebase/firestore'
import { db } from './firebase'
import seedProducts from '../data/seedProducts'

export async function seedDatabase(ownerId: string) {
  const productsRef = collection(db, 'products')

  const batchSize = 20
  const results: string[] = []

  for (let i = 0; i < seedProducts.length; i += batchSize) {
    const chunk = seedProducts.slice(i, i + batchSize)
    const promises = chunk.map((product) =>
      addDoc(productsRef, {
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        supplier: product.supplier,
        ownerId,
      })
    )
    const refs = await Promise.all(promises)
    results.push(...refs.map((r) => r.id))
  }

  return { count: results.length }
}
