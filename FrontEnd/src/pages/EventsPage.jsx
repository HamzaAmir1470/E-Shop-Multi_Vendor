import React from 'react'
import Header from '../components/Layout/Header.jsx'
import EventsCard from '../components/Events/EventCard.jsx'
import styles from '../styles/styles'
import Footer from '../components/Layout/Footer.jsx'

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