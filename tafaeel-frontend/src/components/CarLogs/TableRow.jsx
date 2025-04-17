import React from 'react';
import { IoEyeOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next';

const TableRow = ({ item, selected, onSelect, onViewDetails }) => {
    const { t } = useTranslation();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getCarTypeTranslation = (type) => {
        switch(type.toLowerCase()) {
            case 'big':
                return t('Big');
            case 'small':
                return t('Small');
            default:
                return type;
        }
    };

    return (
        <tr className='border-b'>
            <td className='p-4 text-start flex items-center'>
                <div className="flex items-center gap-4">
                    <div className='p-[8px_0] pl-[14px]'>
                        <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => onSelect(item.id)}
                            className='cursor-pointer'
                        />
                    </div>
                    <p>{item.wash_detail_id}</p>
                </div>
            </td>
            <td className='p-4 text-start'>
                <img 
                    src={item.plate_picture_url} 
                    className='max-w-[60px] xl:max-w-[90px] h-11 rounded' 
                    alt="Car plate" 
                />
            </td>
            <td className='p-4 capitalize'>{getCarTypeTranslation(item.car_type)}</td>
            <td className='p-4'>{formatDate(item.detected_datetime)}</td>
            <td className='p-4'>
                <span className='text-[16px] font-roboto font-medium text-[#4BB549] leading-normal rounded-[60px] bg-[#EDF8ED] p-[8px_16px]'>
                    {item.service_type} 
                </span>
            </td>
            <td className='p-4'>
                <div className="flex justify-between items-center">
                    {item.estimated_price} {t('R.O')}
                    <button 
                        className='p-0 border-0 mx-6 lg:ml-0'
                        onClick={() => onViewDetails(item)}
                    >
                        <IoEyeOutline />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default TableRow;