import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = ( { children}) => {
  const location  = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return  children || null;
};

export default ScrollToTop;