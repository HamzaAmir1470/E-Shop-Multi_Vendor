import React from 'react';
import { Link } from 'react-router-dom';
import { navItems } from '../../static/data';
import styles from '../../styles/styles';

const Navbar = ({ active }) => {
  return (
    <div className={`block md:${styles.normalFlex}`}>
      {navItems &&
        navItems.map((i, index) => (
          <div className="flex" key={i.id || index}>
            <Link
              to={i.url}
              className={`pb-[30px] md:pb-0 font-[500] px-6 cursor-pointer ${
                active === index + 1 ? "text-[#17dd1f]" : "text-black md:text-white"
              }`}
            >
              {i.title}
            </Link>
          </div>
        ))}
    </div>
  );
};

export default Navbar;
