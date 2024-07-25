import React, { useState, useEffect } from 'react';
import { binanceLogo, hamsterCoin } from './images';
import Mine from './icons/Mine';
import Friends from './icons/Friends';
import Coins from './icons/Coins';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    type Player = {
        username: string;
        clicks: number;
    };

    type TopPlayersResponse = {
        players: Player[];
    };

    const [topPlayers, setTopPlayers] = useState<Player[]>([]);

    useEffect(() => {
        fetchTopPlayers();
    }, []);

    const fetchTopPlayers = async () => {
        const response = await fetch(`/api/top-players`);
        const data: TopPlayersResponse = await response.json();
        setTopPlayers(data.players);
    };

    return (
        <div className="bg-black flex justify-center">
            <div className="w-full bg-black text-white h-screen font-bold flex flex-col max-w-xl">
                <div>
                    <h1>Top Players</h1>
                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                        <tbody id="top-players">
                            {topPlayers.map((player, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid white', padding: '8px' }}>@{player.username}</td>
                                    <td style={{ border: '1px solid white', padding: '8px' }}>{player.clicks}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom fixed div */}
            <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-xl bg-[#272a2f] flex justify-around items-center z-50 rounded-3xl text-xs">
                <div className="text-center text-[#85827d] w-1/5 m-1 p-2">
                    <Link to="/">
                        <img src={binanceLogo} alt="Exchange" className="w-8 h-8 mx-auto" />
                        <p className="mt-1">Exchange</p>
                    </Link>
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
                <div className="text-center text-[#85827d] w-1/5 bg-[#1c1f24] m-1 p-2 rounded-2xl">
                    <Link to="/about">
                        <img src={hamsterCoin} alt="Airdrop" className="w-8 h-8 mx-auto" />
                        <p className="mt-1">About</p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default About;