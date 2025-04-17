import { Row, Col } from '../components/Grid'
import { card16, card20 } from '../components/Icons'
import LineChart from '../components/Dashboard/LineChart'
import BarChart from '../components/Dashboard/BarChart'
import DoughnutChart from '../components/Dashboard/DoughnutChart'
import { useTranslation } from 'react-i18next'
import { BsThreeDots } from "react-icons/bs";
import Preloader from '../components/Preloader'
import '../index.css';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react'
import axios from 'axios'


// Add this CSS to your styles file or use inline styles
const skeletonStyle = {
  animation: 'shimmerDashboardCars 1.5s infinite linear',
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%',
};

// Create a skeleton component for the car card
const CarCardSkeleton = () => (
  <div className="flex lg:flex-col xl:flex-row justify-between rounded-[16px] bg-[#F0F1F4] p-4 w-full">
    <div className='flex flex-col gap-[60px] lg:gap-[16px] lg:mb-2 xl:mb-0 xl:gap-[60px]'>
      <div 
        className="w-24 h-6 rounded-[40px]" 
        style={skeletonStyle}
      ></div>
      <div className="">
        <div 
          className='w-32 h-4 rounded mb-2' 
          style={skeletonStyle}
        ></div>
        <div 
          className='w-24 h-5 rounded' 
          style={skeletonStyle}
        ></div>
      </div>
    </div>
    <div>
      <div className="car mb-1 max-w-[161px] lg:max-w-[130px] 2xl:max-w-[161px] 2xl:mr-[10px]">
        <div 
          className="w-[161px] h-24 rounded" 
          style={skeletonStyle}
        ></div>
      </div>
      <div className="flex items-center justify-end gap-1">
        <div 
          className='w-20 h-5 rounded' 
          style={skeletonStyle}
        ></div>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [latestCars, setLatestCars] = useState([]);
  const [preloader, setPreloader] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState({
    today: { count: 0, revenue: 0 },
    thisWeek: { count: 0, revenue: 0 }
  });
  const [activeTimeframe, setActiveTimeframe] = useState('today');
  const [carTimeframe, setCarTimeframe] = useState('today');
  const [revenueTimeframe, setRevenueTimeframe] = useState('today');

  useEffect(() => {
    const loadData = async () => {
      setPreloader(true);
      try {
        // Fetch latest cars
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cars/latest_cars?shop_id=${user.shop_id}`,{
          withCredentials: true,
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }
      });
        if (response.data.status === 'success') {
          setLatestCars(response.data.data);
        }

        // Add new fetch for summary data
        const summaryResponse = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/cars/confirmed_cars_summary?shop_id=${user.shop_id}`,{
          withCredentials: true,
          headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
          }
      });
        if (summaryResponse.data.status === 'success') {
          setSummaryData(summaryResponse.data.data);
          
        }

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setPreloader(false);
      }
    };

    loadData();
  }, []);

  const LoadingSpinner = () => (
    <div className="flex justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#20547C]"></div>
    </div>
  );

  const topCard = [
    {
      icon: `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.4974 14.9999C7.4974 15.9204 6.7512 16.6666 5.83073 16.6666C4.91025 16.6666 4.16406 15.9204 4.16406 14.9999C4.16406 14.0794 4.91025 13.3333 5.83073 13.3333C6.7512 13.3333 7.4974 14.0794 7.4974 14.9999Z" stroke="#20547C" stroke-width="1.5"/>
            <path d="M15.8333 14.9999C15.8333 15.9204 15.0871 16.6666 14.1667 16.6666C13.2462 16.6666 12.5 15.9204 12.5 14.9999C12.5 14.0794 13.2462 13.3333 14.1667 13.3333C15.0871 13.3333 15.8333 14.0794 15.8333 14.9999Z" stroke="#20547C" stroke-width="1.5"/>
            <path d="M1.66406 9.16675H14.9974" stroke="#20547C" stroke-width="1.5" stroke-linecap="round"/>
            <path d="M15.8307 14.25C15.4165 14.25 15.0807 14.5858 15.0807 15C15.0807 15.4142 15.4165 15.75 15.8307 15.75V14.25ZM1.66406 4.25C1.24985 4.25 0.914062 4.58579 0.914062 5C0.914062 5.41421 1.24985 5.75 1.66406 5.75V4.25ZM11.9336 5.28255L11.5873 5.94779L11.5873 5.94779L11.9336 5.28255ZM18.1925 11.1143L17.4923 11.3829L17.4923 11.3829L18.1925 11.1143ZM18.0867 14.7559L18.617 15.2863L18.617 15.2863L18.0867 14.7559ZM14.8457 8.87819L14.3191 9.41224L14.3191 9.41224L14.8457 8.87819ZM3.86106 5.53033C4.15395 5.23744 4.15395 4.76256 3.86106 4.46967C3.56817 4.17678 3.09329 4.17678 2.8004 4.46967L3.86106 5.53033ZM1.78852 14.0897L2.42651 13.6954L2.42651 13.6954L1.78852 14.0897ZM3.99175 15.7299C4.39488 15.8251 4.79883 15.5754 4.894 15.1723C4.98917 14.7692 4.73951 14.3652 4.33638 14.2701L3.99175 15.7299ZM7.4974 14.25C7.08318 14.25 6.7474 14.5858 6.7474 15C6.7474 15.4142 7.08318 15.75 7.4974 15.75L7.4974 14.25ZM12.4974 15.75C12.9116 15.75 13.2474 15.4142 13.2474 15C13.2474 14.5858 12.9116 14.25 12.4974 14.25L12.4974 15.75ZM15.8307 15.75H16.6641V14.25H15.8307V15.75ZM19.0807 13.3333V12.733H17.5807V13.3333H19.0807ZM9.47745 4.25H1.66406V5.75H9.47745V4.25ZM9.47745 5.75C10.1287 5.75 10.5673 5.75072 10.9122 5.78221C11.2419 5.81232 11.4322 5.86704 11.5873 5.94779L12.28 4.61732C11.8924 4.41552 11.4924 4.32895 11.0486 4.28843C10.62 4.24928 10.1019 4.25 9.47745 4.25V5.75ZM19.0807 12.733C19.0807 11.9559 19.0927 11.3669 18.8928 10.8457L17.4923 11.3829C17.5687 11.5822 17.5807 11.8322 17.5807 12.733H19.0807ZM16.6641 15.75C17.0357 15.75 17.3899 15.7516 17.6784 15.7128C17.9885 15.6711 18.3324 15.5709 18.617 15.2863L17.5563 14.2256C17.5969 14.1851 17.6223 14.2069 17.4785 14.2262C17.3132 14.2484 17.0781 14.25 16.6641 14.25V15.75ZM17.5807 13.3333C17.5807 13.7474 17.5791 13.9825 17.5569 14.1478C17.5376 14.2916 17.5158 14.2661 17.5563 14.2256L18.617 15.2863C18.9016 15.0016 19.0018 14.6578 19.0435 14.3477C19.0823 14.0591 19.0807 13.705 19.0807 13.3333H17.5807ZM15.3723 8.34413C14.9237 7.90185 14.6064 7.30319 14.1403 6.55727C13.712 5.87191 13.159 5.07499 12.28 4.61732L11.5873 5.94779C12.0758 6.20216 12.4479 6.67952 12.8683 7.35219C13.2508 7.96431 13.7057 8.80744 14.3191 9.41224L15.3723 8.34413ZM18.8928 10.8457C18.494 9.80617 17.6349 9.38789 16.956 9.11788C16.5773 8.96728 16.3145 8.88324 16.0114 8.74766C15.7356 8.62422 15.5285 8.49814 15.3723 8.34413L14.3191 9.41224C14.6546 9.74305 15.042 9.9572 15.3988 10.1168C15.7284 10.2643 16.1363 10.4062 16.4017 10.5117C17.0109 10.754 17.3335 10.9689 17.4923 11.3829L18.8928 10.8457ZM2.8004 4.46967C2.26077 5.0093 1.79859 5.97748 1.48265 6.81999C1.31743 7.26057 1.17841 7.70446 1.07968 8.09935C0.984746 8.4791 0.914062 8.86386 0.914062 9.16667H2.41406C2.41406 9.05281 2.44755 8.81256 2.5349 8.46315C2.61847 8.12887 2.73986 7.73943 2.88714 7.34668C3.1962 6.52252 3.56736 5.82403 3.86106 5.53033L2.8004 4.46967ZM0.914062 9.16667V13.1366H2.41406V9.16667H0.914062ZM0.914062 13.1366C0.914062 13.3718 0.913138 13.6049 0.933597 13.8027C0.955843 14.0179 1.00788 14.2532 1.15053 14.484L2.42651 13.6954C2.4447 13.7249 2.43451 13.7342 2.42564 13.6485C2.41499 13.5454 2.41406 13.4026 2.41406 13.1366H0.914062ZM4.33638 14.2701C4.13679 14.2229 3.89731 14.1832 3.69161 14.1465C3.4718 14.1073 3.26298 14.0673 3.06881 14.0153C2.63859 13.9001 2.47487 13.7737 2.42651 13.6954L1.15053 14.484C1.52444 15.089 2.20202 15.336 2.68078 15.4642C2.9411 15.5339 3.20367 15.5831 3.42826 15.6232C3.66696 15.6658 3.84487 15.6953 3.99175 15.7299L4.33638 14.2701ZM7.4974 15.75L12.4974 15.75L12.4974 14.25L7.4974 14.25L7.4974 15.75Z" fill="#20547C"/>
            <path d="M7.5 9.16667V5" stroke="#20547C" stroke-width="1.5" stroke-linecap="round"/>
            </svg>`,
      title: 'Total Car Washed',
      value: preloader ? (
        <div className="animate-pulse w-full">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-xl font-medium">
            {carTimeframe === 'today' ? summaryData.today.count : summaryData.thisWeek.count}
          </div>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setCarTimeframe('today')}
              className={`px-2 py-1 rounded-md transition-all ${
                carTimeframe === 'today' ? 'bg-[#20547C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('today')}
            </button>
            <button
              onClick={() => setCarTimeframe('week')}
              className={`px-2 py-1 rounded-md transition-all ${
                carTimeframe === 'week' ? 'bg-[#20547C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('this Week')}
            </button>
          </div>
        </div>
      )
    },
    {
      icon: `<svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.6667 10.0001C18.6667 14.6025 14.9357 18.3334 10.3333 18.3334C5.73096 18.3334 2 14.6025 2 10.0001C2 5.39771 5.73096 1.66675 10.3333 1.66675C14.9357 1.66675 18.6667 5.39771 18.6667 10.0001Z" stroke="#20547C" stroke-width="1.5"/>
            <path d="M11.8776 8.43999C11.8776 8.8542 12.2134 9.18999 12.6276 9.18999C13.0418 9.18999 13.3776 8.8542 13.3776 8.43999H11.8776ZM8.58594 11.5607C8.58594 11.1465 8.25015 10.8107 7.83594 10.8107C7.42172 10.8107 7.08594 11.1465 7.08594 11.5607H8.58594ZM11.0859 5.8335C11.0859 5.41928 10.7502 5.0835 10.3359 5.0835C9.92172 5.0835 9.58594 5.41928 9.58594 5.8335L11.0859 5.8335ZM9.58594 14.1668C9.58594 14.581 9.92172 14.9168 10.3359 14.9168C10.7502 14.9168 11.0859 14.581 11.0859 14.1668H9.58594ZM10.3359 9.13032C9.55042 9.13032 9.16024 9.00404 8.98234 8.88494C8.86866 8.80883 8.79427 8.71029 8.79427 8.43999H7.29427C7.29427 9.09774 7.53239 9.71935 8.14787 10.1314C8.69913 10.5005 9.45479 10.6303 10.3359 10.6303V9.13032ZM8.79427 8.43999C8.79427 8.27233 8.88539 8.05722 9.15898 7.8566C9.43212 7.65632 9.8458 7.5096 10.3359 7.5096V6.0096C9.56042 6.0096 8.82827 6.23906 8.27199 6.64695C7.71616 7.05452 7.29427 7.6796 7.29427 8.43999H8.79427ZM10.3359 7.5096C10.8261 7.5096 11.2398 7.65632 11.5129 7.8566C11.7865 8.05722 11.8776 8.27233 11.8776 8.43999H13.3776C13.3776 7.6796 12.9557 7.05452 12.3999 6.64695C11.8436 6.23906 11.1114 6.0096 10.3359 6.0096V7.5096ZM12.0859 11.5607C12.0859 11.8764 11.963 12.0615 11.7193 12.207C11.43 12.3797 10.9587 12.4911 10.3359 12.4911V13.9911C11.0939 13.9911 11.8726 13.8624 12.4881 13.495C13.1492 13.1003 13.5859 12.4452 13.5859 11.5607H12.0859ZM10.3359 12.4911C9.77424 12.4911 9.29938 12.3367 8.98656 12.1265C8.66904 11.913 8.58594 11.6988 8.58594 11.5607H7.08594C7.08594 12.3506 7.56248 12.9766 8.14978 13.3714C8.74178 13.7693 9.51692 13.9911 10.3359 13.9911V12.4911ZM10.3359 10.6303C11.1274 10.6303 11.5722 10.7502 11.803 10.8998C11.9656 11.0052 12.0859 11.1621 12.0859 11.5607H13.5859C13.5859 10.7591 13.2896 10.0758 12.6189 9.64104C12.0163 9.25051 11.2111 9.13032 10.3359 9.13032V10.6303ZM11.0859 6.7596L11.0859 5.8335L9.58594 5.8335L9.58594 6.7596L11.0859 6.7596ZM9.58594 13.2411V14.1668H11.0859V13.2411H9.58594Z" fill="#20547C"/>
            </svg>`,
      title: 'Total Revenue',
      value: preloader ? (
        <div className="animate-pulse w-full">
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="text-xl font-medium">
            {t('R.O')} {revenueTimeframe === 'today' ? summaryData.today.revenue : summaryData.thisWeek.revenue}
          </div>
          <div className="flex gap-2 text-sm">
            <button
              onClick={() => setRevenueTimeframe('today')}
              className={`px-2 py-1 rounded-md transition-all ${
                revenueTimeframe === 'today' ? 'bg-[#20547C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('today')}
            </button>
            <button
              onClick={() => setRevenueTimeframe('week')}
              className={`px-2 py-1 rounded-md transition-all ${
                revenueTimeframe === 'week' ? 'bg-[#20547C] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t('this Week')}
            </button>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className='dashboard'>
      {error && (
        <div className="text-red-500 p-4 mb-4">
          Error loading data: {error}
        </div>
      )}
      <Row>
        <Col xs={12} lg={8}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-2">
            {topCard.map((item, index) => (
              <div className={`${card16}`} key={index}>
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <div className="icon rounded-[35px] bg-[#E9EEF2] h-10 w-10 flex items-center justify-center " dangerouslySetInnerHTML={{ __html: item.icon }}>
                  </div>
                  <h5 className='text-[16px] font-roboto font-normal text-[#9B9DA0] leading-normal'>{t(item.title)}</h5>
                </div>
                {item.value}
              </div>
            ))}
          </div>
          <div className={`mt-5 ${card20}`}>
            <LineChart user={user} />
          </div>
          <div className="flex flex-wrap mt-5 gap-5">
            <div className={`${card20} flex-[0_0_auto] w-full 2xl:w-[calc(60%-10px)]`}>
              <BarChart user={user} />
            </div>
            <div className={`${card20} flex-[0_0_auto] w-full 2xl:w-[calc(40%-10px)]`}>
              <DoughnutChart user={user} />
            </div>
          </div>
        </Col>
        <Col xs={12} lg={4} className='mt-6 lg:mt-0'>
          <div className={`${card20}`}>
            <div className="flex justify-between items-center mb-5">
              <h3 className='text-xl font-roboto font-semibold text-[#03070A] leading-normal'>{t("Latest Car")}</h3>
            </div>
            <div className="flex items-center flex-col gap-4 relative">
              {preloader ? (
                <>
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                  <CarCardSkeleton />
                </>
              ) : !latestCars.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className='text-base text-gray-500 font-normal'>
                    No cars found
                  </p>
                </div>
              ) : (
                latestCars.map((item, index) => (
                  <div 
                    key={index}
                    className="flex lg:flex-col xl:flex-row justify-between rounded-[16px] bg-[#F0F1F4] p-4 w-full hover:shadow-lg transition-all duration-300"
                  >
                    <div className='flex flex-col gap-[60px] lg:gap-[16px] lg:mb-2 xl:mb-0 xl:gap-[60px]'>
                      <div className="text-[12px] font-roboto font-normal text-[#4BB549] leading-normal p-[4px_8px] rounded-[40px] bg-[#E0EBE3] max-w-max capitalize">
                        {t(item.service_type)}
                      </div>
                      <div className="">
                        <p className='text-[12px] mb-1 font-roboto font-normal text-[#9B9DA0] leading-normal'>
                          {new Date(item.detected_datetime).toLocaleDateString()}
                        </p>
                        <h4 className='text-[14px] font-roboto font-medium text-[#03070A] leading-normal'>
                          {new Date(item.detected_datetime).toLocaleTimeString()}
                        </h4>
                      </div>
                    </div>
                    <div>
                      <div className="car mb-1 max-w-[161px] lg:max-w-[130px] 2xl:max-w-[161px] 2xl:mr-[10px]">
                        <img 
                          src={item.car_picture_url} 
                          className='mix-blend-darken rtl:scale-x-[-1] h-24 rounded-lg object-cover w-full transition-transform duration-300 hover:scale-105' 
                          alt="Car" 
                          onError={(e) => {
                            e.target.src = '/fallback-car-image.jpg';
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <h5 className='text-[14px] font-roboto font-medium text-[#03070A] leading-normal'>
                         {item.estimated_price} 
                          <span className='text-[12px] px-1 font-roboto font-normal text-[#1F547C] leading-normal'>
                            {t('R.O')}
                          </span>
                        </h5>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}
