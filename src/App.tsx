import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import About from './about/About';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';

const App: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        WebApp.ready();

        // Обработка нажатия кнопки "назад"
        WebApp.BackButton.onClick(() => {
            navigate(-1);
        });

        // Слушаем изменения в истории для управления кнопкой "назад"
        if (location.pathname !== '/') {
            WebApp.BackButton.show();
        } else {
            WebApp.BackButton.hide();
        }
    }, [location, navigate]);

    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
};

export default App;