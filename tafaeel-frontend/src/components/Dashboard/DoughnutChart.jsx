import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { arrow_down } from "../Icons";
import axios from 'axios';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DoughnutChart({ user }) {
  const { t } = useTranslation();
  const activity = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [select, setSelect] = useState(activity[0]);
  const [listShow, setListShow] = useState(false);
  const [cutoutSize, setCutoutSize] = useState(90);
  const [chartData, setChartData] = useState({
    daily: { big: { percentage: 0 }, small: { percentage: 0 }, total: { revenue: 0 } },
    weekly: { big: { percentage: 0 }, small: { percentage: 0 }, total: { revenue: 0 } },
    monthly: { big: { percentage: 0 }, small: { percentage: 0 }, total: { revenue: 0 } },
    yearly: { big: { percentage: 0 }, small: { percentage: 0 }, total: { revenue: 0 } }
  });
  const [loading, setLoading] = useState(true);

  const dummyData = {
    daily: {
      big: { percentage: 60, revenue: "1500.00" },
      small: { percentage: 40, revenue: "1000.00" },
      total: { revenue: "2500.00" }
    },
    weekly: {
      big: { percentage: 65, revenue: "6500.00" },
      small: { percentage: 35, revenue: "3500.00" },
      total: { revenue: "10000.00" }
    },
    monthly: {
      big: { percentage: 70, revenue: "21000.00" },
      small: { percentage: 30, revenue: "9000.00" },
      total: { revenue: "30000.00" }
    },
    yearly: {
      big: { percentage: 55, revenue: "165000.00" },
      small: { percentage: 45, revenue: "135000.00" },
      total: { revenue: "300000.00" }
    }
  };

  const getTimeframeData = () => {
    const timeframeMap = {
      'Daily': 'daily',
      'Weekly': 'weekly',
      'Monthly': 'monthly',
      'Yearly': 'yearly'
    };
    
    const timeframe = timeframeMap[select] || 'monthly';
    const realData = chartData[timeframe.toLowerCase()];
    
    const isEmptyData = !realData || 
      (parseFloat(realData.big.percentage) === 0 && 
       parseFloat(realData.small.percentage) === 0 && 
       parseFloat(realData.total.revenue) === 0);

    return isEmptyData ? dummyData[timeframe.toLowerCase()] : realData;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stats/revenue-by-type?shop_id=${user.shop_id}`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (response.data.status === 'success') {
          const allTimeframesEmpty = Object.values(response.data.data).every(
            timeframe => 
              parseFloat(timeframe.big.percentage) === 0 && 
              parseFloat(timeframe.small.percentage) === 0 && 
              parseFloat(timeframe.total.revenue) === 0
          );

          setChartData(allTimeframesEmpty ? dummyData : response.data.data);
        }
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setChartData(dummyData);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setSelect(e);
    setListShow(false);
  }

  const currentData = getTimeframeData();

  const data = {
    labels: ['Big', 'Small'],
    datasets: [
      {
        label: 'Revenue Distribution',
        data: [
          parseFloat(currentData.big.percentage),
          parseFloat(currentData.small.percentage)
        ],
        backgroundColor: ['#1F547C', '#C3C6CB'],
        borderColor: '#CDEEFF',
        borderWidth: 0,
        hoverOffset: 0,
        borderRadius: 6,
        cutout: cutoutSize,
      },
    ],
  };

  const getCutOutSize = () => {
    if (window.innerWidth <= 390) return 80;
    if (window.innerWidth <= 768) return 100;
    if (window.innerWidth <= 992) return 60;
    if (window.innerWidth <= 1280) return 100;
    if (window.innerWidth <= 1440) return 60;
    return 90;
  }

  useEffect(() => {
    setCutoutSize(getCutOutSize());
    const handleResize = () => setCutoutSize(getCutOutSize());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const options = {
    offset: 5,
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        displayColors: false,
      }
    },
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <h3 className='text-xl font-roboto font-semibold text-[#03070A] leading-normal'>{t("Revenue by Type")}</h3>
        <div className="relative">
          <button 
            onClick={() => setListShow(!listShow)} 
            className="bg-white flex py-1 px-4 justify-between items-center gap-1 text-sm font-normal text-[#06090B] rounded-full border border-solid border-[#D5D6D9] min-w-[103px]"
          >
            {t(select)}
            <span 
              className={`text-[#06090B] ${listShow ? '-scale-y-100' : 'scale-y-100'}`} 
              dangerouslySetInnerHTML={{ __html: arrow_down }}
            ></span>
          </button>
          {listShow && (
            <div className="absolute z-10 top-full w-full left-0 bg-white py-2 px-3 rounded-[0px_0px_4px_4px] shadow-md">
              {activity.map((item, index) => (
                <button 
                  onClick={() => handleChange(item)} 
                  key={index} 
                  className={`py-1 bg-transparent px-0 text-sm hover:text-[#1F547C] w-full text-left border-0 ${
                    item === select ? 'text-[#1F547C]' : 'text-[#06080B]'
                  }`}
                >
                  {t(item)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="doughnut-chart w-[80%] md:w-[76%] lg:w-[50%] xl:w-[60%] 2xl:w-10/12 mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#06090B] text-opacity-80 text-2xl md:text-[18px] font-roboto font-semibold">
          $ {currentData.total.revenue}
        </div>
        <Doughnut data={data} options={options} />
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#06090B] bg-white shadow-[0px_0px_12px_0px_rgba(0,0,0,0.15)] absolute text-sm font-roboto font-normal doughnut-value-1">
          {currentData.big.percentage}%
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#06090B] bg-white shadow-[0px_0px_12px_0px_rgba(0,0,0,0.15)] absolute text-sm font-roboto font-normal doughnut-value-2">
          {currentData.small.percentage}%
        </div>
      </div>
      <div className="mt-6 md:mt-8 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-[6px]">
          <span 
            className="flex-[0_0_auto] w-3 h-3 rounded-full"
            style={{ backgroundColor: '#1F547C' }}
          ></span>
          <span className="text-sm text-[#141414] text-opacity-60 opacity-80">
            {t('Big Cars')}
          </span>
        </div>
        <div className="flex items-center gap-[6px]">
          <span 
            className="flex-[0_0_auto] w-3 h-3 rounded-full"
            style={{ backgroundColor: '#C3C6CB' }}
          ></span>
          <span className="text-sm text-[#141414] text-opacity-60 opacity-80">
            {t('Small Cars')}
          </span>
        </div>
      </div>
    </>
  );
}
