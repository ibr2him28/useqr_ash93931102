import React from 'react';
import { useTranslation } from 'react-i18next';

const TableHeader = ({ onSelectAll, isAllChecked }) => {
    const { t } = useTranslation();
    
    return (
        <thead className='border-b border-[#D5D6D9]'>
            <tr>
                <th className='p-[11px_16px] text-start flex items-center gap-4 text-[14px] font-roboto font-normal text-[#9B9DA0] leading-normal'>
                    <div className='pl-[14px]'>
                        <input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={onSelectAll}
                            className='cursor-pointer'
                        />
                    </div>
                    Car ID
                </th>
                {["Car N.P", "Type", "Entry", "Service Type", "Est Price"].map((item, index) => (
                    <th 
                        key={index} 
                        className='text-start text-[14px] font-roboto font-normal text-[#9B9DA0] leading-normal p-[11px_16px]'
                    >
                        {t(item)}
                    </th>
                ))}
            </tr>
        </thead>
    );
};

export default TableHeader;