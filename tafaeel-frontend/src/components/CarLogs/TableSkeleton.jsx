import React from 'react';

function TableSkeleton({ rowsCount = 5 }) {
    return (
        <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-6 gap-4 px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                    <div className="h-4 bg-gray-200 rounded col-span-1"></div>
                </div>
            </div>

            {/* Rows Skeleton */}
            {Array(rowsCount).fill(null).map((_, index) => (
                <div 
                    key={index}
                    className={`border-b border-gray-200 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                >
                    <div className="grid grid-cols-6 gap-4 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                            <div className="h-4 w-20 bg-gray-200 rounded"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                            <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default TableSkeleton;