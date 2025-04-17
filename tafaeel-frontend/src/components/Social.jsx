import { FaDiscord, FaTelegramPlane, FaTwitter } from "react-icons/fa";


export default function Social({ className }) {
  const socialIcons = [

    {
      name: 'discoard',
      icon: <FaDiscord />,
      url: ''
    },
    {
      name: 'telegram',
      icon: <FaTelegramPlane/>,
      url: ''
    },
    {
      name: 'twitter',
      icon: <FaTwitter />,
      url: ''
    },
  ];
  return (
    <ul className={`social-list flex items-center flex-wrap gap-2 ${className}`}>
      {socialIcons.map((item, index) => (
        <li key={index}>
          <a href={item.url} target="_blank" className="social-link flex items-center justify-center ml-1">
            {item.icon}
          </a>
        </li>
      ))}
    </ul>
  )
}