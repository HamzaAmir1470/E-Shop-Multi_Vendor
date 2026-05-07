import React from "react";
import {
  AiFillFacebook,
  AiFillInstagram,
  AiFillYoutube,
  AiOutlineTwitter,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import {
  footercompanyLinks,
  footerProductLinks,
  footerSupportLinks,
} from "../../static/data";

const Footer = () => {
  return (
    <div className="bg-[#000] text-white">
      {/* Subscribe Section */}
      <div className="md:flex md:justify-between md:items-center sm:px-12 px-4 bg-[#342ac8] py-7">
        <h1 className="lg:text-4xl text-3xl md:mb-0 mb-6 lg:leading-normal font-semibold md:w-2/5">
          <span className="text-[#56d879]">Subscribe</span> us for get news
          <br />
          events and offers
        </h1>

        <div className="flex w-full sm:w-auto">
          <input
            type="email"
            required
            placeholder="Enter your email..."
            className="flex-1 px-4 py-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 text-gray-900 placeholder-gray-400 transition duration-300"
          />
          <button className="bg-teal-400 hover:bg-teal-500 px-5 py-3 rounded-r-lg text-white font-semibold transition duration-300">
            Subscribe
          </button>
        </div>

      </div>

      {/* Main Footer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:px-8 px-5 py-16">

        {/* Logo + Social */}
        <ul className="px-5 text-center sm:text-start flex sm:block flex-col items-center">
          <img
            src="https://shopo.quomodothemes.website/assets/images/logo.svg"
            alt=""
            style={{ filter: "brightness(0) invert(1)" }}
          />
          <p className="mt-4">
            The home and elements needed to create beautiful products.
          </p>

          <div className="flex items-center mt-4">
            <AiFillFacebook size={25} className="cursor-pointer" />
            <AiOutlineTwitter size={25} className="ml-4 cursor-pointer" />
            <AiFillInstagram size={25} className="ml-4 cursor-pointer" />
            <AiFillYoutube size={25} className="ml-4 cursor-pointer" />
          </div>
        </ul>

        {/* Company */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-2 font-semibold">Company</h1>
          {footerProductLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Shop */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-2 font-semibold">Shop</h1>
          {footercompanyLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Support */}
        <ul className="text-center sm:text-start">
          <h1 className="mb-2 font-semibold">Support</h1>
          {footerSupportLinks.map((link, index) => (
            <li key={index}>
              <Link
                className="text-gray-400 hover:text-teal-400 duration-300 text-sm leading-6"
                to={link.link}
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 text-center pt-2 text-gray-400 text-sm pb-8">
        <span>© 2020 Becodemy. All rights reserved.</span>
        <span>Terms · Privacy Policy</span>
        <div className="flex items-center justify-center w-full">
          <img
            src="https://hamart-shop.vercel.app/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffooter-payment.a37c49ac.png&w=640&q=75"
            alt=""
          />
        </div>
      </div>
    </div>
  );
};

export default Footer;
