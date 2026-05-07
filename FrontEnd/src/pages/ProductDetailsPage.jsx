import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Footer from "../components/Layout/Footer";
import Header from "../components/Layout/Header";
import ProductDetails from "../components/Products/ProductDetails.jsx";
import { productData } from "../static/data";
import SuggestedProduct from "../components/Products/SuggestedProduct.jsx";
import { useSelector } from "react-redux";

const ProductDetailsPage = () => {
    const { products } = useSelector((state) => state.product);
    const { id } = useParams();
    const [data, setData] = useState(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {

        const data = products.find((i) => i._id === id);
        setData(data);

    }, [products])

    return (
        <div>
            <Header />

            <ProductDetails data={data} />

            {data && <SuggestedProduct data={data} />}

            <Footer />
        </div>
    );
};

export default ProductDetailsPage;