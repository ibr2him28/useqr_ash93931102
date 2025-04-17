import { Row, Col } from '../components/Grid'
import { BiLogOut } from "react-icons/bi";
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { card20 } from '../components/Icons';

export default function Setting() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const activeCard = [
    {
      p: 'Monthly plan',
      title: '50 OMR/monthly',
    },
    {
      p: 'Renew at',
      title: 'Oct 25, 2024',
    },
  ]

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className='setting'>
      <Row>
        <Col xs={12} lg={8}>
          {/* Subscription & Payment Section */}
          <div className={`mb-5 ${card20}`}>
            <h3 className='text-xl font-roboto font-semibold text-[#03070A] leading-normal pb-[11px] border-b border-[#D5D6D9] w-[calc(100%+32px)] md:w-[calc(100%+40px)] ltr:-ml-4 rtl:-mr-4  ltr:md:-ml-5 rtl:md:-mr-5 ltr:pl-4 rtl:pr-4 ltr:md:pl-5 rtl:md:pr-5'>
              {t("Subscription & Payment")}
            </h3>
            <div className="flex justify-between items-center py-4">
              <h5 className='text-[16px] font-roboto font-medium text-[#03070A] leading-normal'>{t("Current Plan")}</h5>
              {/* <button className="btn">{t("Change Plan")}</button> */}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
              {activeCard.map((item, index) => (
                <div className="flex p-5 rounded-[20px] border-[1px] border-[#F0F1F4] bg-[#F0F1F4] relative" key={index}>
                  <div className='w-full'>
                    <div className="flex items-center justify-between w-full">
                      <p className='text-[16px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-2'>{t(item.p)} </p>
                      <div className={`hidden ${index === 0 ? '!block' : ''}`}>
                        <p className='text-[16px] font-roboto font-normal text-[#4BB549] leading-normal p-[2px_8px] rounded-[40px] bg-[#E0EBE3] rtl:flex-row-reverse flex items-center gap-1'>
                          <span className='bg-[#4BB549] w-[10px] h-[10px] rounded-full'></span> {t("Active")}
                        </p>
                      </div>
                    </div>
                    <h4 className='text-[18px] font-roboto font-medium text-[#03070A] leading-normal'>{t(item.title)} </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Settings Section */}
          <div className={`mb-5 ${card20}`}>
            <h3 className='text-xl font-roboto font-semibold text-[#03070A] leading-normal mb-4'>
              {t("Account Settings")}
            </h3>
            <div className="flex items-center justify-between p-4 border-t border-[#D5D6D9]">
              <div>
                <h5 className='text-[16px] font-roboto font-medium text-[#03070A] leading-normal'>
                  {t("Logout")}
                </h5>
                <p className='text-[14px] font-roboto font-normal text-[#9B9DA0] leading-normal'>
                  {t("Sign out of your account")}
                </p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <BiLogOut className="text-xl" />
                <span>{t("Logout")}</span>
              </button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
