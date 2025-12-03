import React, { useState } from 'react'
import ProfileSidebar from '../components/Profile/ProfileSidebar'
import ProfileContent from '../components/Profile/ProfileContent'
import Header from '../components/Layout/Header'
import styles from '../styles/styles'

const ProfilePage = () => {
    const [active, setActive] = useState(1);
  return (
      <div>
          <Header />
          <div className={`${styles.section} flex bg-[#f5f5f5] py-10 `}>
              <div className="w-[50px] lg:w-[335px]">
                  <ProfileSidebar active={active } setActive={setActive} />
              </div>
              <ProfileContent active={ active} />
          </div>
    </div>
  )
}

export default ProfilePage;
