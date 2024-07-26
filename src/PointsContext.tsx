// PointsContext.tsx
import React, { createContext, useState, ReactNode, FC } from 'react';

// Интерфейс для значений контекста
interface PointsContextType {
    points: number;
    setPoints: React.Dispatch<React.SetStateAction<number>>;
    profitPerHour: number;
    setProfitPerHour: React.Dispatch<React.SetStateAction<number>>;
    lastTimestamp: string;
    setLastTimestamp: React.Dispatch<React.SetStateAction<string>>;
}

// Дефолтное значение контекста
const defaultContextValue: PointsContextType = {
    points: 0,
    setPoints: () => {},
    profitPerHour: 0,
    setProfitPerHour: () => {},
    lastTimestamp: '',
    setLastTimestamp: () => {}
};

export const PointsContext = createContext<PointsContextType>(defaultContextValue);

interface PointsProviderProps {
    children: ReactNode;
}

// Провайдер контекста
export const PointsProvider: FC<PointsProviderProps> = ({ children }) => {
    const [points, setPoints] = useState<number>(0);
    const [profitPerHour, setProfitPerHour] = useState<number>(0);
    const [lastTimestamp, setLastTimestamp] = useState<string>('');

    return (
        <PointsContext.Provider value={{ points, setPoints, profitPerHour, setProfitPerHour, lastTimestamp, setLastTimestamp }}>
            {children}
        </PointsContext.Provider>
    );
};