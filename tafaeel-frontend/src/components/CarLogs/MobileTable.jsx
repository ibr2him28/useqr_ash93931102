import { useState } from "react";
import { IoEyeOutline } from "react-icons/io5";
import { useTranslation } from 'react-i18next'


export default function MobileTable({ items }) {
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleShow = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
    const { t } = useTranslation();

    return (
        <>
            {items.map((item, index) => (
                <div className="border-b p-3 lg:hidden" key={index}>
                    {activeIndex != index && (
                        <div onClick={() => toggleShow(index)} className="flex items-center justify-between">
                            <div className="flex items-center gap-[14px]">
                                <input type="checkbox" name="" className="cursor-pointer" id="" />
                                <h4 className="font-medium">{item.shop_id}</h4>
                            </div>
                            <span className="text-[12px] font-roboto font-medium text-[#4BB549] leading-normal rounded-[60px] bg-[#EDF8ED] p-[4px_12px]">
                                {!item.service ? t("F wash") : item.service}
                            </span>
                            <button className="p-0 border-0 ml-6 lg:ml-0">
                                <IoEyeOutline />
                            </button>
                        </div>
                    )}
                    {activeIndex === index && (
                        <div onClick={() => toggleShow(index)} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div>
                                    <input type="checkbox" name="" className="cursor-pointer" id="" />
                                </div>
                                <ul>
                                    <li className="pb-3">
                                        <p className="text-start text-[12px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-[2px]">{t("Car ID")}</p>
                                        <h4 className="font-medium">{item.shop_id}</h4>
                                    </li>
                                    <li className="pb-3">
                                        <p className="text-start text-[12px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-[2px]">{t("Entry")}</p>
                                        <h4 className="font-medium">
                                            {(() => {
                                                const date = new Date(item.det_time);
                                                const year = date.getFullYear();
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                return `${year}-${month}-${day}`;
                                            })()}
                                        </h4>
                                    </li>
                                    <li>
                                        <p className="text-start text-[12px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-[2px]">{t("Service Type")}</p>
                                        <span className="text-[12px] font-roboto font-medium text-[#4BB549] leading-normal rounded-[60px] bg-[#EDF8ED] p-[4px_12px]">
                                            {!item.service ? t("F wash") : item.service}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                            <div className="flex items-center gap-3">
                                <ul>
                                    <li className="pb-3">
                                        <p className="text-start text-[12px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-[2px]">{t("Car N.P")}</p>
                                        <img src={item.plateFrameURL} className="max-w-[60px] xl:max-w-[90px]" alt="" />
                                    </li>
                                    <li className="pb-3">
                                        <p className="text-start text-[12px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-[2px]">{t("Type")}</p>
                                        <h4 className="font-medium">{t(item.car_type)}</h4>
                                    </li>
                                    <li className="pb-3">
                                        <p className="text-start text-[12px] font-roboto font-normal text-[#9B9DA0] leading-normal mb-[2px]">{t("Ect Price")}</p>
                                        <h4 className="text-[16px] font-roboto font-medium">${item.confidence}</h4>
                                    </li>
                                </ul>
                                <button className="p-0 border-0 ml-6 lg:ml-0">
                                    <IoEyeOutline />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </>
    );
}
