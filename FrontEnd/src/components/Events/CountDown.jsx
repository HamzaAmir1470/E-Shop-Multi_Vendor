import React, { useEffect, useState } from "react";

const CountDown = ({ data }) => {
    const [timeLeft, setTimeLeft] = useState({});

    useEffect(() => {
        const update = () => {
            const difference =
                new Date(data?.endDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setTimeLeft({});
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            });
        };

        update();
        const timer = setInterval(update, 1000);
        return () => clearInterval(timer);
    }, [data?._id]);

    if (!Object.keys(timeLeft).length) {
        return <span className="text-red-500 text-xl font-semibold">Time's Up</span>;
    }

    return (
        <div className="flex gap-2 text-indigo-600 font-bold text-lg">
            {Object.entries(timeLeft).map(([key, value]) => (
                <span key={key} className="px-2 py-1 bg-indigo-100 rounded-lg">
                    {value} {key}
                </span>
            ))}
        </div>
    );
};

export default CountDown;
