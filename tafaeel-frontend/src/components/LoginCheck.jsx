import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginCheck() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const loginStatus = JSON.parse(window.localStorage.getItem('login'))       
        if (!loginStatus) {
            if (location.pathname !== "/") {
                navigate('/')
            }
        } else {
            if (location.pathname !== location.pathname) {
                navigate(location.pathname)
            }
        }

    }, [location, navigate]);

    return null;
}
