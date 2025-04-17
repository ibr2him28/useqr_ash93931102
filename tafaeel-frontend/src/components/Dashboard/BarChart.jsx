import { useState, useEffect } from "react";
import { arrow_down } from "../Icons";
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function BarChart({ user }) {
  const activity = ["Daily", "Weekly", "Monthly", "Yearly"];
  const [select, setSelect] = useState(activity[0]);
  const [listShow, setListShow] = useState(false);
  const { t } = useTranslation();
  const [chartData, setChartData] = useState({
    daily: { labels: [], data: [] },
    weekly: { labels: [], data: [] },
    monthly: { labels: [], data: [] },
    yearly: { labels: [], data: [] }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/stats/confirmed-cars-count?shop_id=${user.shop_id}`, {
          withCredentials: true,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        if (response.data.status === 'success') {
          console.log('Chart API Response:', response.data.data);
          setChartData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
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

  const getCurrentData = () => {
    const timeframeMap = {
      'Daily': 'daily',
      'Weekly': 'weekly',
      'Monthly': 'monthly',
      'Yearly': 'yearly'
    };
    
    const currentTimeframe = timeframeMap[select] || 'daily';
    return {
      labels: chartData[currentTimeframe]?.labels || [],
      data: chartData[currentTimeframe]?.data || []
    };
  }

  const currentData = getCurrentData();

  const data = {
    labels: currentData.labels,
    datasets: [
      {
        label: 'Cars Count',
        data: currentData.data,
        backgroundColor: "#1F547C",
        borderWidth: 0,
        borderRadius: 6,
        fill: false,
      },
    ],
  };

  const formatTimeLabel = (label) => {
    if (select === 'Daily') {
      const [hours] = label.split(':');
      const hour = parseInt(hours);
      if (hour === 0) return '12 AM';
      if (hour === 12) return '12 PM';
      return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
    }
    return t(label); // For weekly, monthly, and yearly labels
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 1.6 / 1,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          title: (tooltipItems) => {
            const label = tooltipItems[0].label;
            if (select === 'Daily') {
              return formatTimeLabel(label);
            }
            return t(label);
          },
          label: (context) => {
            const value = context.parsed.y;
            return `${t('Cars')}: ${value}`;
          }
        }
      },
    },
    layout: {
      padding: 0,
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          display: false,
        },
        grid: {
          color: '#EAEAEC',
          lineWidth: .5,
          borderDash: [100, 100],
        },
        border: {
          display: false,
        }
      },
      x: {
        ticks: {
          font: { size: 12, weight: 400, family: 'Roboto' },
          color: '#9B9DA0',
          callback: (value, index) => {
            const label = data.labels[index];
            if (select === 'Daily' && index % 3 !== 0) {
              return ''; // Show every third hour for daily view
            }
            return formatTimeLabel(label);
          }
        },
        grid: {
          display: false,
        },
        border: {
          display: false,
        }
      }
    },
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

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
        <h3 className='text-xl font-roboto font-semibold text-[#03070A] leading-normal'>{t('Activity Chart')} </h3>
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
      <div className="pt-3">
        <Bar data={data} options={options} />
      </div>
    </>
  );
}
