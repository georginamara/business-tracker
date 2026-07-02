import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyB-M5-0RZDAqVh-VFQMeNxvooxGNr3C0dk',
  authDomain: 'business-tracker-cb773.firebaseapp.com',
  projectId: 'business-tracker-cb773',
  storageBucket: 'business-tracker-cb773.firebasestorage.app',
  messagingSenderId: '673308886467',
  appId: '1:673308886467:web:4e40ee6f5554435552e976',
  measurementId: 'G-C5DHLZTK2Z',
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
