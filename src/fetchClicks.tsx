type ClicksResponse = {
    clicks: number;
    auto_clicks: number;
    timestamp: string;
};

export const fetchClicks = async (
    userId: string,
    setPoints: React.Dispatch<React.SetStateAction<number>>,
    setProfitPerHour: React.Dispatch<React.SetStateAction<number>>,
    setLastTimestamp: React.Dispatch<React.SetStateAction<string>>
) => {
    try {
        const response = await fetch(`/api/clicks?userId=${userId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data: ClicksResponse = await response.json();
        setPoints(data.clicks);
        setProfitPerHour(data.auto_clicks);
        setLastTimestamp(data.timestamp);
    } catch (error) {
        console.error('Error fetching clicks:', error);
    }
};