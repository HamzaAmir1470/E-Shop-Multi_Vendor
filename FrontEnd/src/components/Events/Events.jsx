// src/components/Events/Events.jsx (Fixed)
import React, { useEffect, useState } from 'react';
import styles from "../../styles/styles";
import EventCard from './EventCard.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { getAllEvents } from '../../redux/actions/event';
import { FiLoader, FiCalendar } from 'react-icons/fi';

const Events = () => {
    const dispatch = useDispatch();
    const { allEvents, isLoading } = useSelector((state) => state.events);
    const [activeEvents, setActiveEvents] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!allEvents || allEvents.length === 0) {
            dispatch(getAllEvents());
        }
    }, [dispatch]);

    // Process events when allEvents changes
    useEffect(() => {
        if (allEvents && Array.isArray(allEvents) && allEvents.length > 0) {
            processActiveEvents();
        }
    }, [allEvents]);

    const processActiveEvents = () => {
        const currentDate = new Date();
        
        // Filter active events (not expired and in stock)
        const active = allEvents.filter(event => {
            // Skip if event is invalid
            if (!event) return false;
            
            try {
                // Check for both Finish_Date and endDate (use the one that exists)
                let eventEndDate = event.Finish_Date || event.endDate || event.startDate;
                
                // If no end date is specified, assume event lasts for 7 days from start date
                if (!eventEndDate && event.startDate) {
                    const startDate = new Date(event.startDate);
                    eventEndDate = new Date(startDate);
                    eventEndDate.setDate(startDate.getDate() + 7); // Default to 7 days
                }
                
                if (!eventEndDate) {
                    console.warn('No date found for event:', event._id);
                    return true; // Show event if no date specified
                }
                
                const eventEndDateTime = new Date(eventEndDate);
                const isDateValid = !isNaN(eventEndDateTime.getTime());
                
                if (!isDateValid) {
                    console.warn('Invalid date for event:', event._id, eventEndDate);
                    return true; // Show event if date is invalid
                }
                
                // Check if event is not expired (end date >= current date)
                const isNotExpired = eventEndDateTime >= currentDate;
                
                // Check if has stock (use stock or quantity)
                const stock = event.stock || event.quantity || event.availableStock || 0;
                const hasStock = stock > 0;
                
                return isNotExpired && hasStock;
            } catch (error) {
                console.error('Error processing event:', event._id, error);
                return true; // Show event if there's an error processing
            }
        });
        
        setActiveEvents(active);
    };

    // Display loading skeleton
    if (isLoading) {
        return (
            <div className={`${styles.section} py-12`}>
                <div className={`${styles.heading}`}>
                    <h1>Popular Events</h1>
                </div>
                <div className="w-full flex justify-center items-center py-12">
                    <div className="text-center">
                        <FiLoader className="animate-spin text-4xl text-purple-600 mx-auto mb-4" />
                        <p className="text-gray-500">Loading events...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show only first 3 events
    const displayEvents = activeEvents.slice(0, 3);
    const hasEvents = displayEvents.length > 0;

    return (
        <div className={`${styles.section} py-8`}>
            <div className={`${styles.heading} mb-8`}>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Popular Events </h1>
            </div>
            
            <div className="w-full grid grid-cols-1 gap-8">
                {hasEvents ? (
                    <>
                        {displayEvents.map((event, index) => (
                            <EventCard 
                                key={event._id || index} 
                                data={event} 
                                active={index === 0}
                            />
                        ))}
                        
                        {activeEvents.length > 3 && (
                            <div className="text-center mt-4">
                                <button 
                                    onClick={() => window.location.href = '/events'}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                                >
                                    View All Events ({activeEvents.length})
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCalendar className="text-gray-400 text-3xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Active Events
                        </h3>
                        <p className="text-gray-500">
                            There are no active events at the moment. Check back soon for exciting deals!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Events;