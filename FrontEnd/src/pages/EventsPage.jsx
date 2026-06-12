// src/pages/EventsPage.jsx (Fixed - Shows all events)
import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header.jsx';
import Footer from '../components/Layout/Footer.jsx';
import { useSelector, useDispatch } from 'react-redux';
import { getAllEvents } from '../redux/actions/event';
import EventCard from '../components/Events/EventCard.jsx';
import { FiLoader, FiFilter, FiX, FiCalendar, FiRefreshCw } from 'react-icons/fi';

const EventsPage = () => {
    const dispatch = useDispatch();
    const { allEvents, isLoading } = useSelector((state) => state.events);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch events on mount and whenever the component focuses
    useEffect(() => {
        window.scrollTo(0, 0);
        fetchEvents();

        // Optional: Set up an interval to refresh events every 30 seconds
        const interval = setInterval(() => {
            fetchEvents(true);
        }, 30000);

        return () => clearInterval(interval);
    }, [dispatch]);

    const fetchEvents = async (silent = false) => {
        if (!silent) setIsRefreshing(true);
        await dispatch(getAllEvents());
        if (!silent) setTimeout(() => setIsRefreshing(false), 500);
    };

    useEffect(() => {
        if (allEvents && allEvents.length > 0) {
            filterEvents();
        } else if (allEvents && allEvents.length === 0) {
            setFilteredEvents([]);
        }
    }, [allEvents, searchTerm, selectedCategory]);


    const filterEvents = () => {
        if (!allEvents || allEvents.length === 0) {
            setFilteredEvents([]);
            return;
        }

        let filtered = [...allEvents];

        // Filter active events (not expired)
        const currentDate = new Date();
        filtered = filtered.filter(event => {
            try {
                // Check for endDate (using endDate field from your data)
                let eventEndDate = event.endDate || event.Finish_Date;

                // If no end date, assume event is still active
                if (!eventEndDate) {
                    return true;
                }

                const eventEndDateTime = new Date(eventEndDate);
                const isValidDate = !isNaN(eventEndDateTime.getTime());

                if (!isValidDate) return true;

                // Check if event is not expired
                return eventEndDateTime >= currentDate;
            } catch (error) {
                console.error('Error filtering event:', error);
                return true;
            }
        });

        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(event =>
                event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                event.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(event =>
                event.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        console.log('Filtered events count:', filtered.length);
        setFilteredEvents(filtered);
    };

    // Get unique categories
    const categories = ['all', ...new Set(allEvents?.map(event => event.category).filter(Boolean) || [])];

    // Handle refresh button click
    const handleRefresh = async () => {
        setIsRefreshing(true);
        await dispatch(getAllEvents());
        setIsRefreshing(false);
        toast.success("Events refreshed!");
    };

    if (isLoading && !allEvents?.length) {
        return (
            <div>
                <Header activeHeading={4} />
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                        <FiLoader className="animate-spin text-5xl text-orange-500 mx-auto mb-4" />
                        <p className="text-gray-500">Loading events...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header activeHeading={4} />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                                />
                                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchTerm && (
                                    <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <FiX className="text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 border rounded-lg"
                        >
                            <FiFilter /> Filters
                        </button>

                        <div className={`${showFilters ? 'flex' : 'hidden'} sm:flex flex-wrap gap-2 items-center`}>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition-all duration-200
                                        ${selectedCategory === category
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {category === 'all' ? 'All Events' : category}
                                </button>
                            ))}
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 flex items-center gap-2"
                            >
                                <FiRefreshCw className={`${isRefreshing ? 'animate-spin' : ''}`} size={14} />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-orange-600">{filteredEvents.length}</span> of{' '}
                        <span className="font-semibold">{allEvents?.length || 0}</span> events
                    </p>
                </div>

                {/* Events Grid */}
                {filteredEvents.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <FiCalendar className="text-5xl text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Events Found</h3>
                        <p className="text-gray-500">
                            {searchTerm || selectedCategory !== 'all'
                                ? "No events match your filters. Try adjusting your search criteria."
                                : "There are no active events at the moment. Check back soon!"}
                        </p>
                        {(searchTerm || selectedCategory !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('all');
                                }}
                                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-12 mt-5 ">
                        {filteredEvents.map((event) => (
                            <EventCard key={event._id} data={event} active={true} />
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default EventsPage;