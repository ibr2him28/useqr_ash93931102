import { Link, NavLink } from "react-router-dom";
import logo from '../../assets/img/logo.png'
import { dashboard_icon, car_icon, setting, close } from "../Icons";
import { useTranslation } from "react-i18next";

export default function Left({ className, onClick }) {
  const {t} = useTranslation();
  const menu = [
    {
      icon: dashboard_icon,
      name: 'Dashboard',
      url: '/dashboard'
    },
    {
      icon: car_icon,
      name: 'Car Logs',
      url: '/car-logs'
    },
    {
      icon: setting,
      name: 'Settings',
      url: '/setting'
    },
  ]
  return (
    <div className={`bg-white h-screen w-[var(--layout-left)] pb-6 ${className}`}>
      <div className="py-6 md:py-0 mb-6 md:mb-9 lg:mb-10 xl:mb-12 min-h-[var(--layout-top)] flex items-center justify-between px-5">
        <Link to="/">
          <img src={logo} className="w-20" alt="" />
        </Link>
        <button onClick={onClick} className="md:hidden bg-transparent p-0 border-none text-[#9B9DA0] hover:text-[#21547E]" dangerouslySetInnerHTML={{ __html: close }}></button>
      </div>
      <div className="overflow-auto max-h-[calc(100vh-var(--layout-top)-var(--layout-logo))] px-4 lg:px-5 pb-6">
        <div className="layout-menu">
          {menu.map((item, index) => (
            <NavLink onClick={onClick}  to={item.url} className={`flex items-center gap-3 font-roboto font-normal text-base capitalize text-[#9B9DA0] px-3 py-[10px] bg-transparent rounded-full ${index != menu.length - 1 ? 'mb-3' : 'mb-0'}`} key={index}>
              <span className="icon w-6 h-6 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: item.icon }}></span>
              <span className="text">{t(item.name)}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  )
}
