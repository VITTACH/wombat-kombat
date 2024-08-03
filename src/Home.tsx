import { DateTime } from 'luxon';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import { fetchClicks } from './fetchClicks';
import Coins from './icons/Coins';
import Friends from './icons/Friends';
import Hamster from './icons/Hamster';
import Info from './icons/Info';
import Mine from './icons/Mine';
import Settings from './icons/Settings';
import { binanceLogo, dailyCipher, dailyCombo, dailyReward, dollarCoin, hamsterCoin, mainCharacter } from './images';
import { PointsContext } from './PointsContext';

const Home: React.FC = () => {
    const levelNames = [
        "Bronze",    // From 0 to 4999 coins
        "Silver",    // From 5000 coins to 24,999 coins
        "Gold",      // From 25,000 coins to 99,999 coins
        "Platinum",  // From 100,000 coins to 999,999 coins
        "Diamond",   // From 1,000,000 coins to 2,000,000 coins
        "Epic",      // From 2,000,000 coins to 10,000,000 coins
        "Legendary", // From 10,000,000 coins to 50,000,000 coins
        "Master",    // From 50,000,000 coins to 100,000,000 coins
        "GrandMaster", // From 100,000,000 coins to 1,000,000,000 coins
        "Lord"       // From 1,000,000,000 coins to ∞
    ];

    const levelMinPoints = [
        0,        // Bronze
        5000,     // Silver
        25000,    // Gold
        100000,   // Platinum
        1000000,  // Diamond
        2000000,  // Epic
        10000000, // Legendary
        50000000, // Master
        100000000,// GrandMaster
        1000000000// Lord
    ];

    const [levelIndex, setLevelIndex] = useState(6);
    const { points, setPoints, profitPerHour, setProfitPerHour, lastTimestamp, setLastTimestamp } = useContext(PointsContext);
    const [clicks, setClicks] = useState<{ id: number, x: number, y: number }[]>([]);
    const pointsToAdd = 11;

    const [dailyRewardTimeLeft, setDailyRewardTimeLeft] = useState("");
    const [dailyCipherTimeLeft, setDailyCipherTimeLeft] = useState("");
    const [dailyComboTimeLeft, setDailyComboTimeLeft] = useState("");
    const [username, setUsername] = useState<string | null>("test");
    const [userId, setUserId] = useState("-1");

    const [isMounted, setIsMounted] = useState(false); // состояние для отслеживания загрузки страницы

    const delayRef = useRef<NodeJS.Timeout | null>(null); // Для хранения таймера

    const MAX_MINING_HOURS = 3;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const updateCountdowns = () => {
            setDailyRewardTimeLeft(calculateTimeLeft(0));
            setDailyCipherTimeLeft(calculateTimeLeft(19));
            setDailyComboTimeLeft(calculateTimeLeft(12));
        };

        updateCountdowns();
        const interval = setInterval(updateCountdowns, 60000); // Update every minute

        setIsMounted(true);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const user = window.Telegram.WebApp.initDataUnsafe.user;
        if (user) {
            if (user.username) {
                setUsername(user.username);
            }
            setUserId(user.id);
        }
    }, []);

    useEffect(() => {
        var addedPoints = 0;
        if (lastTimestamp) {
            // Сколько насыпать за возвращение
            const lastTimestampDate = DateTime.fromISO(lastTimestamp);
            const now = DateTime.now();
            const hoursElapsed = Math.min(MAX_MINING_HOURS, now.diff(lastTimestampDate, 'hours').as('hours'));
            addedPoints = Math.floor(hoursElapsed * profitPerHour);
            setLastTimestamp(now.toISO());
        }
        setPoints(points + addedPoints);
    }, [profitPerHour]);

    useEffect(() => {
        const currentLevelMin = levelMinPoints[levelIndex];
        const nextLevelMin = levelMinPoints[levelIndex + 1];
        if (points >= nextLevelMin && levelIndex < levelNames.length - 1) {
            setLevelIndex(levelIndex + 1);
        } else if (points < currentLevelMin && levelIndex > 0) {
            setLevelIndex(levelIndex - 1);
        }
    }, [points, levelIndex]);

    useEffect(() => {
        const pointsPerSecond = Math.floor(profitPerHour / 3600);
        const interval = setInterval(() => {
            setPoints(prevPoints => prevPoints + pointsPerSecond);
        }, 1000);
        return () => clearInterval(interval);
    }, [profitPerHour]);

    const calculateTimeLeft = (targetHour: number) => {
        const now = new Date();
        const target = new Date(now);
        target.setUTCHours(targetHour, 0, 0, 0);

        if (now.getUTCHours() >= targetHour) {
            target.setUTCDate(target.getUTCDate() + 1);
        }

        const diff = target.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const paddedHours = hours.toString().padStart(2, '0');
        const paddedMinutes = minutes.toString().padStart(2, '0');

        return `${paddedHours}:${paddedMinutes}`;
    };

    const applyCardTransform = (
        e: React.TouchEvent<HTMLDivElement> | React.MouseEvent<HTMLDivElement>,
        isTouchEvent: boolean
    ) => {
        const card = e.currentTarget as HTMLDivElement;
        const rect = card.getBoundingClientRect();
        const x = (isTouchEvent ? (e as React.TouchEvent<HTMLDivElement>).touches[0].clientX : (e as React.MouseEvent<HTMLDivElement>).clientX) - rect.left - rect.width / 2;
        const y = (isTouchEvent ? (e as React.TouchEvent<HTMLDivElement>).touches[0].clientY : (e as React.MouseEvent<HTMLDivElement>).clientY) - rect.top - rect.height / 2;

        card.style.transform = `perspective(1000px) rotateX(${-y / 10}deg) rotateY(${x / 10}deg)`;
        setTimeout(() => {
            card.style.transform = '';
        }, 100);
    };

    const handleCardTouch = (e: React.TouchEvent<HTMLDivElement>) => {
        applyCardTransform(e, true);

        const lastTouch = e.touches[e.touches.length - 1];
        updateClicks(points + pointsToAdd);
        setClicks([...clicks, { id: Date.now(), x: lastTouch.pageX, y: lastTouch.pageY }]);
    };

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
        applyCardTransform(e, false);

        updateClicks(points + pointsToAdd);
        setClicks([...clicks, { id: Date.now(), x: e.pageX, y: e.pageY }]);
    };

    const handleAnimationEnd = (id: number) => {
        setClicks((prevClicks) => prevClicks.filter(click => click.id !== id));
    };

    const calculateProgress = () => {
        if (levelIndex >= levelNames.length - 1) {
            return 100;
        }
        const currentLevelMin = levelMinPoints[levelIndex];
        const nextLevelMin = levelMinPoints[levelIndex + 1];
        const progress = ((points - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
        return Math.min(progress, 100);
    };

    const formatProfitPerHour = (profit: number) => {
        if (profit >= 1000000000) return `+${(profit / 1000000000).toFixed(2)}B`;
        if (profit >= 1000000) return `+${(profit / 1000000).toFixed(2)}M`;
        if (profit >= 1000) return `+${(profit / 1000).toFixed(2)}K`;
        return `+${profit}`;
    };

    const updateClicks = async (newClicks: number) => {
        setPoints(newClicks);
        if (delayRef.current) {
            clearTimeout(delayRef.current); // сброс таймера
        }
        delayRef.current = setTimeout(async () => {
            forceUpdateClicks(newClicks);
        }, 1000); // Задержка в 1 секунду
    };

    const forceUpdateClicks = async (newClicks: number) => {
        await fetch(`/api/clicks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, username, clicks: newClicks })
        });
    };

    const handleBuyUpgrade = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) animateCircle(ctx);
        }
        buyUpgrade(1);
    };

    const buyUpgrade = async (level: number) => {
        const response = await fetch(`/api/upgrade`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, level })
        });
        const data = await response.json();
        if (data.success) {
            fetchClicks(userId, setPoints, setProfitPerHour, setLastTimestamp);
        } else {
            alert('Недостаточно кликов');
        }
    };

    const drawCircle = (ctx: CanvasRenderingContext2D, progress: number) => {
        const radius = 48;
        const centerX = 50;
        const centerY = 50;
        const startAngle = -Math.PI / 2;
        const endAngle = 2 * Math.PI * progress + startAngle;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'yellow';
        ctx.stroke();
    };

    const animateCircle = (ctx: CanvasRenderingContext2D) => {
        let startTime: number;
        const duration = 5000;
        const particles: any[] = [];

        const createParticle = (x: number, y: number) => {
            const particle = {
                x: x,
                y: y,
                radius: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                alpha: 1
            };
            particles.push(particle);
        };

        const updateParticles = () => {
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.alpha -= 0.01;
                if (particle.alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
        };

        const drawParticles = () => {
            for (const particle of particles) {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
                ctx.fill();
            }
        };

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Clear canvas
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            // Draw the circle with animation
            drawCircle(ctx, progress);

            // Generate particles
            if (progress < 1) {
                const angle = progress * 2 * Math.PI - Math.PI / 2;
                const x = 50 + 48 * Math.cos(angle);
                const y = 50 + 48 * Math.sin(angle);
                createParticle(x, y);
            }

            // Update and draw particles
            updateParticles();
            drawParticles();

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            }
        };

        requestAnimationFrame(animate);
    };

    return (
        <div className="bg-black flex justify-center">
            <div className="w-full bg-black text-white h-200vh font-bold flex flex-col max-w-xl">
                <div className="px-4 z-10">
                    <div className="flex items-center space-x-2 pt-4">
                        <div className="p-1 rounded-lg bg-[#1d2025]">
                            <Hamster size={24} className="text-[#d4d4d4]" />
                        </div>
                        <div>
                            <p className="text-sm">{username} (CEO)</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between space-x-4 mt-1">
                        <div className="flex items-center w-1/3">
                            <div className="w-full">
                                <div className="flex justify-between">
                                    <p className="text-sm">{levelNames[levelIndex]}</p>
                                    <p className="text-sm">{levelIndex + 1} <span className="text-[#95908a]">/ {levelNames.length}</span></p>
                                </div>
                                <div className="flex items-center mt-1 border-2 border-[#43433b] rounded-full">
                                    <div className="w-full h-2 bg-[#43433b]/[0.6] rounded-full">
                                        <div className="progress-gradient h-2 rounded-full" style={{ width: `${calculateProgress()}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center w-2/3 border-2 border-[#43433b] rounded-full px-4 py-[2px] bg-[#43433b]/[0.6] max-w-64">
                            <img src={binanceLogo} alt="Exchange" className="w-8 h-8" />
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                            <div className="flex-1 text-center">
                                <p className="text-xs text-[#85827d] font-medium">Profit per hour</p>
                                <div className="flex items-center justify-center space-x-1">
                                    <img src={dollarCoin} alt="Dollar Coin" className="w-[18px] h-[18px]" />
                                    <p className="text-sm">{formatProfitPerHour(profitPerHour)}</p>
                                    <Info size={20} className="text-[#43433b]" />
                                </div>
                            </div>
                            <div className="h-[32px] w-[2px] bg-[#43433b] mx-2"></div>
                            <Settings className="text-white" />
                        </div>
                    </div>
                </div>

                <div className="flex-grow mt-4 bg-[#f3ba2f] rounded-t-[48px] relative top-glow z-0">
                    <div className="absolute top-[2px] left-0 right-0 bottom-0 bg-[#1d2025] rounded-t-[46px]">
                        <div className={`shake ${isMounted ? 'active' : ''}`}>
                            <div className="px-4 mt-6 flex justify-between gap-2">
                                <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-full relative" onClick={handleBuyUpgrade}>
                                    <canvas ref={canvasRef} id="particles-canvas" width="100" height="100"></canvas>
                                    <div className="content">
                                        <div className="dot"></div>
                                        <img src={dailyReward} alt="Daily Reward" className="mx-auto w-12 h-12" />
                                        <p className="text-[10px] text-center text-white mt-1">Daily reward</p>
                                        <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{dailyRewardTimeLeft}</p>
                                    </div>
                                </div>
                                <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-full relative">
                                    <div className="dot"></div>
                                    <img src={dailyCipher} alt="Daily Cipher" className="mx-auto w-12 h-12" />
                                    <p className="text-[10px] text-center text-white mt-1">Daily cipher</p>
                                    <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{dailyCipherTimeLeft}</p>
                                </div>
                                <div className="bg-[#272a2f] rounded-lg px-4 py-2 w-full relative">
                                    <div className="dot"></div>
                                    <img src={dailyCombo} alt="Daily Combo" className="mx-auto w-12 h-12" />
                                    <p className="text-[10px] text-center text-white mt-1">Daily combo</p>
                                    <p className="text-[10px] font-medium text-center text-gray-400 mt-2">{dailyComboTimeLeft}</p>
                                </div>
                            </div>
                        </div>

                        <div className="px-4 mt-4 flex justify-center">
                            <div className="px-4 py-2 flex items-center space-x-2">
                                <img src={dollarCoin} alt="Dollar Coin" className="w-10 h-10" />
                                <p className="text-4xl text-white">{points.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className={`fade-in ${isMounted ? 'active' : ''}`}>
                            <div className="px-4 mt-4 flex justify-center">
                                <div
                                    className="w-80 h-80 p-4 rounded-full circle-outer"
                                    onTouchEnd={handleCardTouch}
                                    onClick={handleCardClick}
                                >
                                    <div className="w-full h-full rounded-full circle-inner">
                                        <img src={mainCharacter} alt="Main Character" className="w-full h-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom fixed div */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#272a2f] flex justify-around items-center z-50 rounded-3xl text-xs">
                <div className="text-center text-[#85827d] w-1/5 bg-[#1c1f24] m-1 p-2 rounded-2xl">
                    <img src={binanceLogo} alt="Exchange" className="w-8 h-8 mx-auto" />
                    <p className="mt-1">Exchange</p>
                </div>
                <div className="text-center text-[#85827d] w-1/5 m-1 p-2">
                    <Mine className="w-8 h-8 mx-auto" />
                    <p className="mt-1">Mine</p>
                </div>
                <div className="text-center text-[#85827d] w-1/5 m-1 p-2">
                    <Friends className="w-8 h-8 mx-auto" />
                    <p className="mt-1">Friends</p>
                </div>
                <div className="text-center text-[#85827d] w-1/5 m-1 p-2">
                    <Coins className="w-8 h-8 mx-auto" />
                    <p className="mt-1">Earn</p>
                </div>
                <div className="text-center text-[#85827d] w-1/5 m-1 p-2">
                    <Link to="/about">
                        <img src={hamsterCoin} alt="Airdrop" className="w-8 h-8 mx-auto" />
                        <p className="mt-1">About</p>
                    </Link>
                </div>
            </div>

            {clicks.map((click) => (
                <div
                    key={click.id}
                    className="absolute text-5xl font-bold opacity-0 text-white pointer-events-none"
                    style={{
                        top: `${click.y - 42}px`,
                        left: `${click.x - 28}px`,
                        animation: `float 1s ease-out`
                    }}
                    onAnimationEnd={() => handleAnimationEnd(click.id)}
                >
                    +{pointsToAdd}
                </div>
            ))}
        </div>
    );
};

export default Home;
