import React, { useEffect } from 'react'
import styles from "../../styles/styles";
import EventCard from './EventCard.jsx';
import { useSelector } from 'react-redux';

const Events = () => {
    const { allEvents, isLoading } = useSelector((state) => state.events);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const hasEvents = Array.isArray(allEvents) && allEvents.length > 0;

    return (
        <div>
            {
                !isLoading && (
                    <div className={`${styles.section}`}>
                        <div className={`${styles.heading}`}>
                            <h1>Popular Events</h1>
                        </div>
                        <div className="w-full grid">
                            {hasEvents ? (
                                <EventCard data={allEvents[0]} />
                            ) : (
                                <p className="py-12 text-center text-lg font-medium text-gray-600">
                                    No current events
                                </p>
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    )
}

export default Events