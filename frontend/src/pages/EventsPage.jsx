import React from 'react'
import Header from '../components/Layout/Header'
import EventsCard from '../components/Events/EventCard'
import styles from '../styles/styles'
import Footer from '../components/Layout/Footer'

const EventsPage = () => {
    return (
        <div>
            <Header activeHeading={4} />
            <EventsCard active={true} />
            <EventsCard active={true} />
            <Footer />
        </div>
    )
}

export default EventsPage