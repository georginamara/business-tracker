import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BusinessProvider } from './hooks/useBusiness'
import MainLayout from './layouts/MainLayout'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Sales from './pages/Sales'
import Expenses from './pages/Expenses'

function App() {
  return (
    <BrowserRouter>
      <BusinessProvider>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="sales" element={<Sales />} />
            <Route path="expenses" element={<Expenses />} />
          </Route>
        </Routes>
      </BusinessProvider>
    </BrowserRouter>
  )
}

export default App
