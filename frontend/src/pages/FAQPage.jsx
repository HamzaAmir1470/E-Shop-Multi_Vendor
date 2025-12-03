import React, { useState } from "react";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import styles from "../styles/styles";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeHeading={5} />
      <Faq />
      <Footer />
    </div>
  );
}

const faqItems = [
  {
    id: 1,
    question: "What is your return policy?",
    answer:
      "If you're not satisfied with your purchase, we accept returns within 30 days of delivery. Please email support@myecommercestore.com with your order number.",
  },
  {
    id: 2,
    question: "How do I track my order?",
    answer:
      "Track your order using the link in your shipping confirmation email or by logging into your account.",
  },
  {
    id: 3,
    question: "How do I contact customer support?",
    answer:
      "Email us at support@myecommercestore.com or call (555) 123-4567 between 9am - 5pm EST.",
  },
  {
    id: 4,
    question: "Can I change or cancel my order?",
    answer:
      "Once an order is placed, we cannot modify or cancel it. You can return the item within 30 days.",
  },
  {
    id: 5,
    question: "Do you offer international shipping?",
    answer: "Currently, we only ship within the United States.",
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    answer:
      "We accept Visa, Mastercard, PayPal, and offer cash on delivery.",
  },
];

function Faq() {
  const [active, setActive] = useState(null);

  const toggle = (id) => {
    setActive((prev) => (prev === id ? null : id));
  };

  return (
    <div className={`${styles.section} py-10 animate-fadeIn mt-10 md:mt-0`}>
      <h2 className="text-4xl font-extrabold text-gray-900 mb-10">Frequently Asked Questions</h2>

      <div className="space-y-6 max-w-3xl mx-auto">
        {faqItems.map((item) => (
          <div
            key={item.id}
            className="border border-gray-200 bg-white rounded-2xl shadow-sm p-6 transition hover:shadow-md"
          >
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => toggle(item.id)}
            >
              <span className="text-lg font-semibold text-gray-900">{item.question}</span>

              <svg
                className={`h-6 w-6 transform transition-transform duration-300 ${active === item.id ? "rotate-45" : "rotate-0"
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 5v14m7-7H5"
                />
              </svg>
            </button>

            {active === item.id && (
              <p className="mt-4 text-gray-600 text-base leading-relaxed">
                {item.answer}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}