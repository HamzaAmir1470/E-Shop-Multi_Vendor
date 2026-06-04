import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { getAllProductsShop } from "../../redux/actions/product";
import { getAlleventsShop } from "../../redux/actions/event";
import ProductCard from "../Route/ProductCard/ProductCard";
import Ratings from "../Products/Ratings";
import styles from "../../styles/styles";
import { backend_url } from "../../server";

const getUserAvatarUrl = (user) => {
  const avatarValue = user?.avatar;

  if (!avatarValue) {
    return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || "User")}`;
  }

  if (typeof avatarValue === "string") {
    return avatarValue.startsWith("http")
      ? avatarValue
      : `${backend_url}${avatarValue.startsWith("/") ? "" : "/"}${avatarValue}`;
  }

  if (typeof avatarValue === "object" && avatarValue.url) {
    return avatarValue.url.startsWith("http")
      ? avatarValue.url
      : `${backend_url}${avatarValue.url.startsWith("/") ? "" : "/"}${avatarValue.url}`;
  }

  return `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(user?.name || "User")}`;
};

const ShopProfileData = ({ isOwner }) => {
  const { products } = useSelector((state) => state.product);
  const { events } = useSelector((state) => state.events);
  const { id } = useParams();
  const dispatch = useDispatch();

  const [active, setActive] = useState(1);

  useEffect(() => {
    dispatch(getAllProductsShop(id));
    dispatch(getAlleventsShop(id));
  }, [dispatch, id]);

  const allReviews = products?.flatMap((product) =>
    (product.reviews || []).map((review) => ({
      ...review,
      productId: product._id,
      productName: product.name,
      productImage: product.images?.[0],
    }))
  ) || [];

  const tabStyle = (tab) =>
    `font-semibold text-lg cursor-pointer px-4 py-2 rounded-md transition-colors ${active === tab ? "bg-red-100 text-red-600" : "text-gray-700 hover:text-red-500"
    }`;

  return (
    <div className="w-full px-4 md:px-6 lg:px-10 py-6 space-y-6">
      {/* Tabs + Dashboard Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
        <div className="flex space-x-2 md:space-x-4 bg-gray-50 rounded-lg p-1">
          <h5 className={tabStyle(1)} onClick={() => setActive(1)}>Shop Products</h5>
          <h5 className={tabStyle(2)} onClick={() => setActive(2)}>Running Events</h5>
          <h5 className={tabStyle(3)} onClick={() => setActive(3)}>Shop Reviews</h5>
        </div>
        {isOwner && (
          <Link to="/dashboard">
            <button className={`${styles.button} text-white !rounded-md h-10 px-4`}>
              Go Dashboard
            </button>
          </Link>
        )}
      </div>

      {/* Products Tab */}
      {active === 1 && (
        <>
          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <ProductCard data={item} key={item._id} isShop={true} />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-60 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg font-medium">No products available for this shop.</p>
            </div>
          )}
        </>
      )}

      {/* Events Tab */}
      {active === 2 && (
        <div className="space-y-4">
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((item, index) => (
                <ProductCard
                  data={item}
                  key={index}
                  isShop={true}
                  isEvent={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500 font-medium">
              No events for this shop!
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {active === 3 && (
        <div className="space-y-6">
          {allReviews && allReviews.length > 0 ? (
            allReviews.map((item, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={getUserAvatarUrl(item.user || item)}
                  alt={item.user?.name || item.name || "User"}
                  className="w-12 h-12 rounded-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(item.user?.name || item.name || "User")}`;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <h1 className="font-semibold text-gray-800">{item.user?.name || item.name || "Anonymous"}</h1>
                      <p className="text-xs text-gray-500">{item.productName || "Product review"}</p>
                    </div>
                    <Ratings rating={item?.rating || 0} />
                  </div>
                  <p className="text-gray-600">{item?.comment || item?.review || "No comment provided."}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent review"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 font-medium">
              No reviews for this shop!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopProfileData;
