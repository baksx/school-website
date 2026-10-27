import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // При кожній зміні маршруту прокручуємо вікно в самий верх
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;