import { Link, useNavigate } from "react-router-dom";
import logo from '../../assets/img/logo.png'
import profile from '../../assets/img/avatar.png'
import { arrow_down, menuIcon, notifications, search } from "../Icons";
import Lang from "../Dashboard/Lang";
import { useTranslation } from "react-i18next";
import { useAuth } from '../../context/AuthContext';

export default function Top({ className, onClick }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/setting');
  };
  
  return (
    <div className={`h-[var(--layout-top)] bg-white px-5 flex items-center justify-between w-full ${className}`}>
      <div className="flex items-center">
        <Link to="/" className="md:hidden block"><img src={logo} className="w-[60px]" alt="" /></Link>
      </div>
      <div className="flex items-center gap-4 md:gap-5">
        <Lang />
        <div 
          className="flex items-center gap-2 relative cursor-pointer"
          onClick={handleProfileClick}
        >
          <div className="img w-10 h-10 rounded-full relative bg-[#F0F1F4]">
            <img 
              src={user?.img || profile} 
              className="w-full h-auto min-h-full absolute top-0 left-0 object-cover rounded-full" 
              alt={user?.first_name || "Profile"} 
            />
          </div>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-[#03070A] text-base capitalize font-normal font-roboto">
              {user ? `${user.first_name} ${user.last_name}` : 'Loading...'}
            </span>
          </div>
          <button onClick={(e) => {
            e.stopPropagation();
            onClick();
          }} className="md:hidden p-0 border-0" dangerouslySetInnerHTML={{ __html: menuIcon }}></button>
        </div>
      </div>
    </div>
  )
}
