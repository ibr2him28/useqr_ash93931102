import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { card20, exportIcon, search } from '../components/Icons';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import Preloader from '../components/Preloader';
import * as XLSX from 'xlsx';
import TableHeader from '../components/CarLogs/TableHeader';
import TableRow from '../components/CarLogs/TableRow';
import FilterSection from '../components/CarLogs/FilterSection';
import CarDetailsModal from '../components/CarLogs/CardDetailsModal';
import MobileTable from '../components/CarLogs/MobileTable';
import Pagination from '../components/Pagination';
import { useTableFilters } from '../hooks/useTableFilters';
import '../index.css';
import TableSkeleton from '../components/CarLogs/TableSkeleton';
import { useAuth } from '../context/AuthContext';


const api = `${import.meta.env.VITE_BACKEND_URL}/cars/confirmed_cars`;

export default function CarLogs() {
  const { user } = useAuth();
  console.log('User:', user.shop_id);
  const { t } = useTranslation();
  const [table, setTable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPreloader, setIsPreloader] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 390);


  const {
    filters,
    activeFilters,
    filteredData,
    updateFilter,
    removeFilter
  } = useTableFilters(table);

  const handleSelectAll = () => {
    if (selected.length === table.length) {
      setSelected([]);
    } else {
      setSelected(table.map(item => item.id));
    }
  };
  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };
  const isAllChecked = selected.length === table.length;

  const updateIsMobile = () => {
    setIsMobile(window.innerWidth <= 992);
  };
  useEffect(() => {
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsPreloader(true);

    if (!user?.shop_id) {
        setError(t('Shop ID is missing. Unable to fetch data.'));
        setIsPreloader(false);
        return;
    }

    axios
        .get(`${api}?page=${currentPage}&limit=${itemsPerPage}&shop_id=${user.shop_id}`, {
            withCredentials: true,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        })
        .then((res) => {
            if (!isMounted) return;

            if (res.data && res.data.status === 'success' && res.data.data) {
                const data = Array.isArray(res.data.data) ? res.data.data : [];
                setTable(data);
                console.log(data);

                const pagination = res.data.pagination || {};
                setTotalPages(pagination.totalPages || 1);
                setTotalItems(pagination.totalItems || 0);
                setItemsPerPage(pagination.itemsPerPage || 10);
                setError(null);
            } else {
                throw new Error(t('Invalid response format or no data available.'));
            }
            setIsPreloader(false);
        })
        .catch((err) => {
            if (!isMounted) return;

            console.error("Error fetching car metadata:", err);

            let errorMessage;
            if (err.response) {
                switch (err.response.status) {
                    case 401:
                        errorMessage = t('Please log in to access this data');
                        break;
                    case 403:
                        errorMessage = t('You do not have permission to access this data');
                        break;
                    case 404:
                        errorMessage = t('No car data found for this shop');
                        break;
                    case 500:
                        errorMessage = t('Server error. Please try again later');
                        break;
                    default:
                        errorMessage = t('An error occurred while fetching data');
                }
            } else if (err.request) {
                errorMessage = t('Unable to connect to the server. Please check your internet connection');
            } else {
                errorMessage = t('An error occurred while preparing the request');
            }

            setError(errorMessage);
            setTable([]);
            setTotalPages(1);
            setTotalItems(0);
            setIsPreloader(false);
        });

    return () => {
        isMounted = false;
    };
}, [currentPage, itemsPerPage, user.shop_id]);


  const handleExport = () => {
    const exportData = table.map(item => ({
      'Car ID': item.wash_detail_id,
      'Type': item.car_type,
      'Entry Date': new Date(item.detected_datetime).toLocaleDateString(),
      'Service Type': item.service_type,
      'Estimated Price': item.estimated_price
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Car Logs");
    
    XLSX.writeFile(wb, "car_logs.xlsx");
  };

  const handleSearch = useCallback((value) => {
    updateFilter('searchQuery', value);
  }, [updateFilter]);

  const handleDateFilter = () => {
    if (!dateRange.start || !dateRange.end) return;

    if (!activeFilters.find(filter => filter.type === 'date')) {
      setActiveFilters([...activeFilters, { 
        type: 'date', 
        value: `${dateRange.start} - ${dateRange.end}`,
        startDate: dateRange.start,
        endDate: dateRange.end
      }]);
    } else {
      setActiveFilters(activeFilters.map(filter => 
        filter.type === 'date' ? { 
          ...filter, 
          value: `${dateRange.start} - ${dateRange.end}`,
          startDate: dateRange.start,
          endDate: dateRange.end
        } : filter
      ));
    }
    
    setShowDatePicker(false);
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const selectionState = useMemo(() => ({
    isAllChecked: selected.length === table.length && table.length > 0,
    hasSelection: selected.length > 0,
  }), [selected, table]);

  return (
    <div className='cars'>
      <div className={`${card20}`}>
        <div className="flex items-end justify-between mb-5">
          <div className="flex items-start lg:items-center flex-col-reverse lg:flex-row justify-between lg:justify-start w-full lg:justify-st rtl:ml-4 ltart ltr:mr-4 :rtl:ml-0 ltr:lg:mr-0 gap-2">
            <div className='relative z-[1]'>
              <input 
                type="search" 
                className='w-[95%] lg:w-full rounded-[50px] border-[1px] ltr:pl-10 rtl:pr-10 p-[6px_16px] border-[#D5D6D9]' 
                placeholder={t("Search by car number")}
                value={filters.searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button 
                className='absolute top-1/2 ltr:left-3 rtl:right-3 rtl:-scale-x-100 p-0 border-0 -translate-y-1/2 hover:text-[#1F547C] transition-colors duration-200'
                onClick={() => handleSearch(filters.searchQuery)}
              >
                <span dangerouslySetInnerHTML={{ __html: search }}></span>
              </button>
            </div>
            <FilterSection 
              filters={filters}
              onFilterChange={updateFilter}
              activeFilters={activeFilters}
              removeFilter={removeFilter}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
            />
          </div>
          <button 
            onClick={handleExport}
            className='flex items-center gap-2 p-[6px_16px] rounded-[50px] border-[1px] border-[#D5D6D9] hover:bg-[#1F547C] hover:text-[#fff]'
          >
            <span dangerouslySetInnerHTML={{ __html: exportIcon }}></span> {t("Export")}
          </button>
        </div>

        <div className="border rounded-lg border-[#D5D6D9] overflow-auto relative">
          {isPreloader ? (
            <TableSkeleton rowsCount={itemsPerPage} />
          ) : error ? (
            <div className="text-red-500 p-4 text-center bg-red-50 rounded-lg m-4 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          ) : (
            <table className='w-max lg:inline-table lg:w-full'>
              <TableHeader 
                onSelectAll={handleSelectAll}
                isAllChecked={selectionState.isAllChecked}
              />
              <tbody>
                {!filteredData.length ? (
                  <tr>
                    <td colSpan={6} className='text-center'>
                      <p className='text-base py-3 text-black opacity-60 font-normal'>
                        {t("No data found")}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <TableRow 
                      key={index}
                      item={item}
                      selected={selected.includes(item.id)}
                      onSelect={handleSelect}
                      onViewDetails={handleViewDetails}
                    />
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {!error && !isPreloader && (
            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
            />
        )}
        <CarDetailsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          carData={selectedCar}
        />
      </div>
    </div>
  );
}
