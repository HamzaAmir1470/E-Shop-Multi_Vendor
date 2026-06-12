import React, { useEffect, useState } from "react";
import axios from "axios";
import { server } from "../../server";

const CountDown = ({ data }) => {
    const [timeLeft, setTimeLeft] = useState({});
    const [deleted, setDeleted] = useState(false);

    useEffect(() => {
        let timer;

        const update = async () => {
            if (!data?.endDate) return;

            const difference = new Date(data.endDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setTimeLeft({});

                // Delete expired event only once
                if (data?._id && !deleted) {
                    setDeleted(true);
                    try {
                        await axios.delete(`${server}/events/delete-shop-event/${data._id}`);
                    } catch (error) {
                        console.error("Error deleting expired event:", error);
                    }
                }
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
        timer = setInterval(update, 1000);

        return () => clearInterval(timer);
    }, [data?.endDate, data?._id, deleted]);

    if (!Object.keys(timeLeft).length) {
        return <span className="text-red-500 text-xl font-semibold">Time's Up</span>;
    }

    return (
        <div className="flex gap-2 text-indigo-600 font-bold text-lg">
            {timeLeft.days > 0 && (
                <span className="px-2 py-1 bg-indigo-100 rounded-lg">
                    {timeLeft.days}d
                </span>
            )}
            <span className="px-2 py-1 bg-indigo-100 rounded-lg">
                {String(timeLeft.hours).padStart(2, '0')}h
            </span>
            <span className="px-2 py-1 bg-indigo-100 rounded-lg">
                {String(timeLeft.minutes).padStart(2, '0')}m
            </span>
            <span className="px-2 py-1 bg-indigo-100 rounded-lg">
                {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
        </div>
    );
};

export default CountDown;