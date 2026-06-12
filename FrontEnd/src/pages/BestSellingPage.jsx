import React, { useMemo, useEffect } from "react";
import Header from "../components/Layout/Header";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import styles from "../styles/styles";
import Footer from "../components/Layout/Footer";
import { productData } from "../static/data.jsx";

export default function BestSellingPage() {
    const sortedData = useMemo(() => {
        return [...productData].sort((a, b) => b.total_sell - a.total_sell);
    }, []);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Header activeHeading={2} />

            <div className="py-10">
                <div className={`${styles.section}`}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-12 animate-fadeIn">
                        {sortedData.map((item, index) => (
                            <ProductCard key={item.id || index} data={item} />
                        ))}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
