import { useState, useEffect } from "react";
import { arrow_down } from "../Icons";
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { useTranslation } from "react-i18next";

// Register ChartJS components
ChartJS.register(
    LineElement,
    CategoryScale,
    LinearScale,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler
);



export default function LineChart({ user }) {
    const { t } = useTranslation();
    const activity = ["Daily", 'Weekly', "Monthly", "Yearly"];
    const [select, setSelect] = useState(activity[1]);
    const [listShow, setListShow] = useState(false);
    const [chartData, setChartData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchChartData();
    }, [select]);

    const fetchChartData = async () => {
        try {
            setIsLoading(true);
            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/stats/revenue`,
                {
                    params: { 
                        period: select.toLowerCase(),
                        shop_id: user.shop_id 
                    },
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                }
            );
            setChartData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching chart data:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (item) => {
        setSelect(item);
        setListShow(false);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#20547C]"></div>
        </div>;
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">Error loading chart data: {error}</div>;
    }

    const data = {
        labels: chartData?.labels || [],
        datasets: [
            {
                label: t('Big Cars'),
                data: chartData?.datasets?.big || [],
                borderColor: '#1F547C',
                backgroundColor: 'rgba(31, 84, 124, 0.1)',
                fill: true,
                tension: 0.4,
                pointStyle: 'circle',
                pointRadius: 1,
                pointHoverRadius: 8,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#1F547C',
                pointBorderWidth: 2,
                pointHoverBorderWidth: 2,
            },
            {
                label: t('Small Cars'),
                data: chartData?.datasets?.small || [],
                borderColor: '#E91E1F',
                backgroundColor: 'rgba(233, 30, 31, 0.1)',
                fill: true,
                tension: 0.4,
                pointStyle: 'circle',
                pointRadius: 1,
                pointHoverRadius: 8,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#E91E1F',
                pointBorderWidth: 2,
                pointHoverBorderWidth: 2,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                        family: 'Roboto'
                    }
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'white',
                titleColor: '#06090B',
                bodyColor: '#06090B',
                borderColor: '#E8E9EB',
                borderWidth: 1,
                padding: 12,
                bodyFont: {
                    size: 12,
                    family: 'Roboto'
                },
                titleFont: {
                    size: 12,
                    family: 'Roboto',
                    weight: 'normal'
                },
                callbacks: {
                    title: (context) => {
                        const label = context[0].label;
                        return t(label);
                    },
                    label: (context) => {
                        return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                    },
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 12,
                grid: {
                    color: '#EAEAEC',
                    drawBorder: false,
                },
                ticks: {
                    font: {
                        size: 12,
                        family: 'Roboto'
                    },
                    color: '#9B9DA0',
                    callback: (value) => `$${value}`,
                    stepSize: 1,
                },
                min: 0,
                max: 12,
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    font: {
                        size: 12,
                        family: 'Roboto'
                    },
                    color: '#9B9DA0',
                    maxRotation: 0,
                    minRotation: 0,
                    callback: (value, index) => {
                        return t(data.labels[index]);
                    }
                }
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        },
        layout: {
            padding: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 20
            }
        }
    };

    const calculateMaxValue = (chartData) => {
        if (!chartData?.datasets) return 12;
        
        const allValues = [
            ...(chartData.datasets.big || []),
            ...(chartData.datasets.small || [])
        ];
        
        const maxValue = Math.max(...allValues, 0);
        return Math.ceil(maxValue / 12) * 12 || 12;
    };

    if (chartData) {
        const maxValue = calculateMaxValue(chartData);
        options.scales.y.max = maxValue;
        options.scales.y.suggestedMax = maxValue;
        options.scales.y.ticks.stepSize = maxValue / 12;
    }

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-5">
                <h3 className='text-xl font-roboto font-semibold text-[#03070A] leading-normal'>
                    {t("Revenue")}
                </h3>
                <div className="relative">
                    <button 
                        onClick={() => setListShow(!listShow)} 
                        className="bg-white flex py-1 px-4 justify-between items-center gap-1 text-sm font-normal text-[#06090B] rounded-full border border-solid border-[#D5D6D9] min-w-[103px]"
                    >
                        {t(select)}
                        <span 
                            className={`text-[#06090B] transition-transform duration-200 ${
                                listShow ? 'rotate-180' : ''
                            }`} 
                            dangerouslySetInnerHTML={{ __html: arrow_down }}
                        />
                    </button>
                    {listShow && (
                        <div className="absolute z-10 top-full right-0 mt-1 bg-white py-2 rounded-lg shadow-lg border border-gray-100 min-w-[103px]">
                            {activity.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => handleChange(item)}
                                    className={`w-full border-0 px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                        item === select ? 'text-[#1F547C] font-medium' : 'text-[#06080B]'
                                    }`}
                                >
                                    {t(item)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <div className="h-[500px] relative bg-white rounded-lg p-4 shadow-sm">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#20547C]"></div>
                    </div>
                )}
                {error && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                        <div className="text-red-500 text-center p-4">
                            Error loading chart data: {error}
                        </div>
                    </div>
                )}
                {!isLoading && !error && chartData && (
                    <Line 
                        data={data} 
                        options={options}
                        className="max-h-[600px]"
                    />
                )}
            </div>
        </div>
    );
}
