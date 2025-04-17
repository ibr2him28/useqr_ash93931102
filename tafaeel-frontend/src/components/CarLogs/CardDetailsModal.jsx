import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IoClose } from "react-icons/io5";

const CarDetailsModal = ({ isOpen, onClose, carData }) => {
  const { t } = useTranslation();
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !carData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div ref={modalRef} className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-[#D5D6D9] pb-4">
            <h2 className="text-xl font-roboto font-semibold text-[#03070A] leading-normal">
              {t("Car Details")}
            </h2>
            <button 
              onClick={onClose}
              className="text-[#9B9DA0] border-0 p-0 hover:text-[#03070A] text-3xl transition-colors"
            >
              <IoClose />
            </button>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="space-y-6">
              <div className="bg-[#F0F1F4] rounded-2xl p-4">
                <h3 className="text-[16px] font-roboto font-medium text-[#03070A] mb-3">
                  {t("Car Picture")}
                </h3>
                <img 
                  src={carData.car_picture_url} 
                  alt={t("Car")} 
                  className="w-full h-48 object-contain rounded-xl "
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#F0F1F4] rounded-2xl p-4">
                  <h3 className="text-[16px] font-roboto font-medium text-[#03070A] mb-3">
                    {t("Plate Picture")}
                  </h3>
                  <img 
                    src={carData.plate_picture_url} 
                    alt={t("Plate")} 
                    className="w-full h-32 object-contain rounded-xl"
                  />
                </div>
                <div className="bg-[#F0F1F4] rounded-2xl p-4">
                  <h3 className="text-[16px] font-roboto font-medium text-[#03070A] mb-3">
                    {t("Size Picture")}
                  </h3>
                  <img 
                    src={carData.car_size_url} 
                    alt={t("Size")} 
                    className="w-full h-32 object-contain rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="bg-[#F0F1F4] rounded-2xl p-6">
              <h3 className="text-[18px] font-roboto font-medium text-[#03070A] mb-6">
                {t("Vehicle Information")}
              </h3>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Car ID")}</p>
                    <p className="text-[16px] font-roboto font-medium text-[#03070A]">
                      {carData.wash_detail_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Registration Number")}</p>
                    <p className="text-[16px] font-roboto font-medium text-[#03070A]">
                      {carData.car_registration_number}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Car Type")}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[16px] font-roboto font-medium text-[#03070A] capitalize">
                        {t(carData.car_type)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Service Type")}</p>
                    <div className="text-[12px] font-roboto font-normal text-[#4BB549] leading-normal p-[4px_12px] rounded-[40px] bg-[#E0EBE3] max-w-max capitalize">
                      {t(carData.service_type)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Estimated Price")}</p>
                    <p className="text-[16px] font-roboto font-medium text-[#03070A]">
                      ${carData.estimated_price}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Status")}</p>
                    <div className={`text-[12px] font-roboto font-normal leading-normal p-[4px_12px] rounded-[40px] max-w-max capitalize
                      ${carData.car_washed 
                        ? 'text-[#4BB549] bg-[#E0EBE3]' 
                        : 'text-[#F59E0B] bg-[#FEF3C7]'}`}>
                      {carData.car_washed ? t('Washed') : t('Pending')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Detection Date")}</p>
                    <p className="text-[14px] font-roboto font-medium text-[#03070A]">
                      {new Date(carData.detected_datetime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[14px] font-roboto text-[#9B9DA0] mb-1">{t("Shop ID")}</p>
                    <p className="text-[16px] font-roboto font-medium text-[#03070A]">
                      {carData.shop_id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsModal;