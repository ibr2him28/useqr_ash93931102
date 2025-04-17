import { useEffect, useState } from 'react'
import flag_1 from '../../assets/img/flag/1.png'
import flag_2 from '../../assets/img/flag/2.png'
import { useTranslation } from 'react-i18next';

export default function Lang() {
    const { i18n } = useTranslation();

    const flag = [
        {
            icon: flag_1,
            name: 'en',
            title: "English"
        },
        {
            icon: flag_2,
            name: 'ar',
            title: "Arabic"
        },
    ]
    const [select, setSelect] = useState(flag[0])
    const [isShow, setIsShow] = useState(false);

    const handleChange = (e) => {
        setSelect(e);
        setIsShow(false);
        window.localStorage.setItem('language', JSON.stringify(e));
        i18n.changeLanguage(e.name);
        updateHtmlAttributes(e.name);
    }


    const updateHtmlAttributes = (language) => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

        if (language === 'ar') {
            document.body.classList.add('rtl');
        } else {
            document.body.classList.remove('rtl');
        }
    };

    useEffect(() => {
        const savedState = localStorage.getItem('language');
        if (savedState) {
            const parsedValue = JSON.parse(savedState);
            setSelect(parsedValue);
            updateHtmlAttributes(parsedValue.name);
        }
    }, []);

    return (
        <div className='relative'>
            <button onClick={() => setIsShow(!isShow)} className='bg-[#F0F1F4] p-0 border-0 w-10 h-10 rounded-full flex items-center justify-center'>
                <img src={select.icon} className='w-6 h-6 rounded-full' alt="" />
            </button>
            {isShow &&
                <div className="absolute z-10 top-full min-w-max left-0 py-3 px-2 bg-white shadow-lg rounded-[0px_0px_6px_6px]">
                    {flag.map((item, index) => (
                        <button onClick={() => handleChange(item)} key={index} className={`border-0 flex items-center py-2 px-2 gap-1 w-full hover:bg-black hover:bg-opacity-5 rounded ${select.name === item.name ? "bg-black bg-opacity-5" : 'bg-transparent'}`}>
                            <div className="icon w-4 h-4 rounded-full overflow-hidden">
                                <img src={item.icon} className='w-full h-full rounded-full' alt="" />
                            </div>
                            <span className='block text-sm font-medium font-roboto text-[#06090B]'>{item.title}</span>
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}
