import React, { useEffect, useState } from 'react';
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

const api = `${import.meta.env.VITE_BACKEND_URL}/cars/confirmed_cars`;

export default function CarLogs() {
  const { t } = useTranslation();
  const [table, setTable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState(null);
  const [filteredTable, setFilteredTable] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 390)
  const updateIsMobile = () => {
    setIsMobile(window.innerWidth <= 992);
  };
  useEffect(() => {
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  const [isPreloader, setIsPreloader] = useState(false)
  useEffect(() => {
    setIsPreloader(true)
    axios.get(api, {
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
      .then(res => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setTable(data);
        setFilteredTable(data);
        setIsPreloader(false)
        
      })
      .catch(err => {
        console.error("Error fetching car metadata:", err);
        setError(err.message);
        setTable([]);
        setFilteredTable([]);
        setIsPreloader(false)
      });
  }, [api]);

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

  const handleFilter = (type) => {
    setFilterType(type);
    
    let filtered = table;
    
    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.wash_detail_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(item => 
        item.car_type.toLowerCase() === type.toLowerCase()
      );
    }
    
    setFilteredTable(filtered);
    
    if (type === 'all') {
      setActiveFilters(activeFilters.filter(f => f.type !=='car_type'));
    } else {
      if (!activeFilters.find(filter => filter.type === 'car_type')) {
        setActiveFilters([...activeFilters, { type: 'car_type', value: type }]);
      } else {
        setActiveFilters(activeFilters.map(filter => 
          filter.type === 'car_type' ? { ...filter, value: type } : filter
        ));
      }
    }
    document.getElementById('filterDropdown').classList.add('hidden');
  };

  const handleDateFilter = () => {
    if (!dateRange.start || !dateRange.end) return;

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    endDate.setHours(23, 59, 59);
    
    let filtered = table;
    
    // Apply search filter if there's a search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(item =>
        item.wash_detail_id.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter if active
    if (filterType !== 'all') {
      filtered = filtered.filter(item => 
        item.car_type.toLowerCase() === filterType.toLowerCase()
      );
    }
    
    // Apply date filter
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.detected_datetime);
      return itemDate >= startDate && itemDate <= endDate;
    });
    
    setFilteredTable(filtered);
    
    // Update active filters
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

  const removeFilter = (filterType) => {
    setActiveFilters(activeFilters.filter(filter => filter.type !== filterType));
    if (filterType === 'car_type') {
      setFilterType('all');
      setFilteredTable(table);
    } else if (filterType === 'date') {
      setDateRange({ start: '', end: '' });
      setFilteredTable(table);
    }
  };

  const handleViewDetails = (car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      if (filterType !== 'all') {
        handleFilter(filterType);
      } else {
        setFilteredTable(table);
      }
      return;
    }

    const searchResults = table.filter(item => {
      const matchesSearch = item.wash_detail_id.toString().toLowerCase().includes(query.toLowerCase());
      
      if (filterType === 'all') {
        return matchesSearch;
      } else {
        return matchesSearch && item.car_type.toLowerCase() === filterType.toLowerCase();
      }
    });

    setFilteredTable(searchResults);
  };

  return (
    <div className='cars'>
      <div className={`${card20}`}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center justify-between lg:justify-start w-full lg:justify-st rtl:ml-4 ltart ltr:mr-4 :rtl:ml-0 ltr:lg:mr-0 gap-2">
            <div className='relative z-[1]'>
              <input 
                type="search" 
                className='w-[95%] lg:w-full rounded-[50px] border-[1px] ltr:pl-10 rtl:pr-10 p-[6px_16px] border-[#D5D6D9]' 
                placeholder={t("Search by car number")}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <button 
                className='absolute top-1/2 ltr:left-3 rtl:right-3 rtl:-scale-x-100 p-0 border-0 -translate-y-1/2 hover:text-[#1F547C]'
                onClick={() => handleSearch(searchQuery)}
              >
                <span dangerouslySetInnerHTML={{ __html: search }}></span>
              </button>
            </div>
            <FilterSection 
              filterType={filterType}
              handleFilter={handleFilter}
              dateRange={dateRange}
              setDateRange={setDateRange}
              showDatePicker={showDatePicker}
              setShowDatePicker={setShowDatePicker}
              handleDateFilter={handleDateFilter}
              activeFilters={activeFilters}
              removeFilter={removeFilter}
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
          {isPreloader && <Preloader />}
          {error && (
            <div className="text-red-500 p-4 text-center">
              Error loading data: {error}
            </div>
          )}
          {isMobile ? (
            <MobileTable items={filteredTable} />
          ) : (
            <table className='w-max lg:inline-table lg:w-full'>
              <TableHeader 
                onSelectAll={handleSelectAll}
                isAllChecked={isAllChecked}
              />
              <tbody>
                {!filteredTable || filteredTable.length === 0 ? (
                  !isPreloader && (
                    <tr>
                      <td colSpan={6} className='text-center'>
                        <p className='text-base py-3 text-black opacity-60 font-normal'>
                          No data found
                        </p>
                      </td>
                    </tr>
                  )
                ) : (
                  filteredTable.map((item, index) => (
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
      </div>
      <CarDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        carData={selectedCar}
      />
    </div>
  );
}
