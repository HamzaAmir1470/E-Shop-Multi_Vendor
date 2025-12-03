import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { productData } from "../static/data";
import ProductCard from "../components/Route/ProductCard/ProductCard";
import Header from "../components/Layout/Header";
import Footer from "../components/Layout/Footer";
import styles from "../styles/styles";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category");

  const filteredData = useMemo(() => {
    if (!category) {
      return [...productData].sort((a, b) => a.total_sell - b.total_sell);
    }
    return productData.filter((p) => p.category === category);
  }, [category]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [category]);

  return (
    <div className="min-h-screen bg-gray-50 mt-10 md:mt-0">
      <Header activeHeading={3} />

      <div className="py-10">
        <div className={`${styles.section}`}>
          <div
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 mb-12 animate-fadeIn"
          >
            {filteredData.map((item) => (
              <ProductCard key={item.id || item._id} data={item} />
            ))}
          </div>

          {filteredData.length === 0 && (
            <h1 className="text-center text-xl font-semibold text-gray-600 pb-20 animate-fadeIn">
              No Products Found!
            </h1>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
