import React, { useState, useCallback } from 'react';
import DatePicker from 'react-datepicker';
import { filter } from '../../components/Icons';
import { useTranslation } from 'react-i18next';
import "react-datepicker/dist/react-datepicker.css";

// Define calendar SVG locally if not available in Icons
const calendarSvg = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-5 h-5">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
</svg>`;

const FilterSection = ({ filters, onFilterChange, activeFilters, removeFilter }) => {
    const { t } = useTranslation();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const carTypes = ['all', 'Big', 'Small'];

    const handleTypeSelect = useCallback((type) => {
        onFilterChange('filterType', type);
        setIsDropdownOpen(false);
    }, [onFilterChange]);

    const handleDateChange = useCallback((dates) => {
        const [start, end] = dates;
        onFilterChange('dateRange', {
            start: start ? start.toISOString().split('T')[0] : '',
            end: end ? end.toISOString().split('T')[0] : ''
        });

        if (start && end) {
            setShowDatePicker(false);
        }
    }, [onFilterChange]);

    // Convert string dates to Date objects for DatePicker
    const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null;
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Filter by Type Button */}
            <div className="relative inline-block">
                <button 
                    className='flex items-center gap-2 p-[6px_6px] lg:p-[6px_16px] rounded-full lg:rounded-[50px] border-[1px] border-[#D5D6D9] hover:bg-[#1F547C] hover:text-[#fff]'
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                    <span dangerouslySetInnerHTML={{ __html: filter }}></span> 
                    <span className='hidden lg:inline-block'>{t("Filter by Type")}</span>
                </button>
                
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
                        {carTypes.map((type) => (
                            <button
                                key={type}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                    filters.filterType === type ? 'bg-gray-50 text-[#1F547C]' : 'text-gray-700'
                                }`}
                                onClick={() => handleTypeSelect(type)}
                            >
                                {t(type.charAt(0).toUpperCase() + type.slice(1))}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Date Filter */}
            <div className="relative inline-block date-filter-container">
                <button
                    className='flex items-center gap-2 p-[6px_6px] lg:p-[6px_16px] rounded-full lg:rounded-[50px] border-[1px] border-[#D5D6D9] hover:bg-[#1F547C] hover:text-[#fff]'
                    onClick={() => setShowDatePicker(!showDatePicker)}
                >
                    <span dangerouslySetInnerHTML={{ __html: calendarSvg }}></span>
                    <span className='hidden lg:inline-block'>{t("Filter by Date")}</span>
                </button>
                
                {showDatePicker && (
                    <div className="absolute z-20 mt-2 bg-white rounded-md shadow-lg">
                        <DatePicker
                            selected={startDate}
                            onChange={handleDateChange}
                            startDate={startDate}
                            endDate={endDate}
                            selectsRange
                            inline
                            monthsShown={2}
                            maxDate={new Date()}
                            dateFormat="yyyy-MM-dd"
                            showMonthDropdown
                            showYearDropdown
                            dropdownMode="select"
                            placeholderText={t("Select date range")}
                            className="border rounded p-2"
                            calendarClassName="border-none shadow-none"
                            popperClassName="react-datepicker-left"
                            popperPlacement="bottom-start"
                            popperModifiers={[
                                {
                                    name: 'offset',
                                    options: {
                                        offset: [0, 8]
                                    }
                                }
                            ]}
                        />
                    </div>
                )}
            </div>

            {/* Active Filters */}
            {activeFilters.map((filter, index) => (
                <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-[#EDF8ED] text-[#4BB549] rounded-full text-sm"
                >
                    <span className="capitalize">
                        {filter.type === 'date' 
                            ? `${new Date(filter.startDate).toLocaleDateString()} - ${new Date(filter.endDate).toLocaleDateString()}`
                            : filter.value
                        }
                    </span>
                    <span
                        onClick={() => removeFilter(filter.type)}
                        className="hover:text-red-500 font-bold cursor-pointer text-xl"
                    >
                        ×
                    </span>
                </div>
            ))}
        </div>
    );
};

export default FilterSection;