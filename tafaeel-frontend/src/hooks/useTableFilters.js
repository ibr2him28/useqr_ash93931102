import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useTableFilters = (initialData = []) => {
    const { t } = useTranslation();
    const [filters, setFilters] = useState({
        searchQuery: '',
        filterType: 'all',
        dateRange: { start: '', end: '' }
    });
    const [activeFilters, setActiveFilters] = useState([]);

    // Update filters
    const updateFilter = useCallback((type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));

        // Handle active filters UI updates
        switch(type) {
            case 'searchQuery':
                if (value.trim()) {
                    setActiveFilters(prev => {
                        const existing = prev.find(f => f.type === 'search');
                        if (!existing) {
                            return [...prev, { type: 'search', value }];
                        }
                        return prev.map(f => f.type === 'search' ? { ...f, value } : f);
                    });
                } else {
                    setActiveFilters(prev => prev.filter(f => f.type !== 'search'));
                }
                break;
            case 'filterType':
                if (value === 'all') {
                    setActiveFilters(prev => prev.filter(f => f.type !== 'car_type'));
                } else {
                    setActiveFilters(prev => {
                        const existing = prev.find(f => f.type === 'car_type');
                        if (!existing) {
                            return [...prev, { type: 'car_type', value }];
                        }
                        return prev.map(f => f.type === 'car_type' ? { ...f, value } : f);
                    });
                }
                break;

            case 'dateRange':
                if (!value.start || !value.end) return;
                setActiveFilters(prev => {
                    const existing = prev.find(f => f.type === 'date');
                    const newFilter = {
                        type: 'date',
                        value: `${value.start} - ${value.end}`,
                        startDate: value.start,
                        endDate: value.end
                    };
                    if (!existing) {
                        return [...prev, newFilter];
                    }
                    return prev.map(f => f.type === 'date' ? newFilter : f);
                });
                break;
        }
    }, []);

    // Remove filter
    const removeFilter = useCallback((filterType) => {
        setActiveFilters(prev => prev.filter(f => f.type !== filterType));
        switch(filterType) {
            case 'car_type':
                updateFilter('filterType', 'all');
                break;
            case 'date':
                updateFilter('dateRange', { start: '', end: '' });
                break;
        }
    }, [updateFilter]);

    // Apply filters
    const filteredData = useMemo(() => {
        const { searchQuery, filterType, dateRange } = filters;
        let filtered = initialData;

        // Apply search filter
        if (searchQuery.trim()) {
            filtered = filtered.filter(item =>
                item.car_registration_number?.toString().toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(item => 
                item.car_type?.toLowerCase() === filterType.toLowerCase()
            );
        }

        // Apply date filter
        if (dateRange.start && dateRange.end) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59);

            filtered = filtered.filter(item => {
                const itemDate = new Date(item.detected_datetime);
                return itemDate >= startDate && itemDate <= endDate;
            });
        }

        return filtered;
    }, [initialData, filters]);

    return {
        filters,
        activeFilters,
        filteredData,
        updateFilter,
        removeFilter
    };
};