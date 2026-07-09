import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { seedProducts } from "../data/seedProducts";

export async function seedFirestore() {
  try {
    for (const product of seedProducts) {
      await addDoc(collection(db, "products"), {
        ...product,
        createdAt: new Date(),
      });
    }

    alert("✅ Products successfully added to Firestore!");
  } catch (error) {
    console.error(error);
    alert("❌ Failed to seed database.");
  }
}