import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from 'src/pages/main/MainPage';

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
