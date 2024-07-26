import React, { useEffect, useContext, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import About from './About';
import { PointsProvider, PointsContext } from './PointsContext';
import { useNavigate, useLocation } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { fetchClicks } from './fetchClicks';

const App: React.FC = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const [userId, setUserId] = useState("-1");
    const { setPoints, setProfitPerHour, setLastTimestamp } = useContext(PointsContext);

    useEffect(() => {
        fetchClicks(userId, setPoints, setProfitPerHour, setLastTimestamp);
    }, [])

    useEffect(() => {
        WebApp.ready();

        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user && user.username) {
            setUserId(user.id);
        }

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
const Root = () => (
    <PointsProvider>
        <Router>
            <App />
        </Router>
    </PointsProvider>
);

export default Root;