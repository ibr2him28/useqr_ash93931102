import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Top from '../components/Layout/Top'
import Left from '../components/Layout/Left'
import { useEffect, useState } from 'react';
import LoginCheck from '../components/LoginCheck';

export default function Layout() {
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const main = document.querySelector('.layout-main');
    main.scrollTo(0, 0)
  }, [location])

  const [mobileMenu, setMobileMenu] = useState(false);
  const handleChanged = () => {
    setMobileMenu(!mobileMenu)
  }


  return (
    <div className="layout flex flex-wrap">
      {/* <LoginCheck /> */}
      <Left onClick={() => handleChanged()} className={`${mobileMenu ? 'menu-show' : ''} layout-left flex-[0_0_auto]`} />
      <div className="layout-right flex-[0_0_auto] w-[calc(100%-var(--layout-left))]">
        <Top onClick={() => handleChanged()} className="layout-top" />
        <div className="layout-main max-h-[calc(100vh-var(--layout-top))] p-4 md:p-5 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
