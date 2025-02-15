import { BrowserRouter, Route, Routes } from 'react-router';

import Home from '../Pages/Home';
import Orders from '../Pages/Orders';
import Clients from '../Pages/Clients';
import Recipes from '../Pages/Recipes';
import Products from '../Pages/Products';
import Ingredients from '../Pages/Ingredients';
import MainLayout from '../Components/MainLayout';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="client" element={<Clients />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="ingredients" element={<Ingredients />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
