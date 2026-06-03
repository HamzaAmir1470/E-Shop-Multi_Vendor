import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { backend_url, server } from '../../server';
import { FiMapPin, FiPhone, FiPackage, FiStar, FiCalendar, FiEdit2, FiLogOut } from 'react-icons/fi';
import { MdStorefront } from 'react-icons/md';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';

const getShopAvatarUrl = (avatar) => {
  if (!avatar) return 'https://via.placeholder.com/140';

  if (typeof avatar === 'string') {
    return avatar.startsWith('http')
      ? avatar
      : `${backend_url}${avatar.startsWith('/') ? '' : '/'}${avatar}`;
  }

  if (typeof avatar === 'object' && avatar.url) {
    return avatar.url.startsWith('http')
      ? avatar.url
      : `${backend_url}${avatar.url.startsWith('/') ? '' : '/'}${avatar.url}`;
  }

  return 'https://via.placeholder.com/140';
};


const ShopInfo = ({ isOwner }) => {
  const { products } = useSelector((state) => state.product);
  const { seller } = useSelector((state) => state.seller);
  const navigate = useNavigate();
  const [data, setData] = React.useState(null);


  const { id } = useParams();

  useEffect(() => {
    if (!id) return;

    axios.get(`${server}/shop/get-shop-info/${id}`)
      .then((res) => {
        setData(res.data.shop);
      })
      .catch((err) => {
        console.error("Error fetching shop info:", err);
      });

  }, [id]);

  const totalReviewsLength = products && products.reduce((total, product) => total + (product.reviews?.length || 0), 0);

  const totalRatings = products && products.reduce((total, product) => total + (product.reviews?.reduce((sum, review) => sum + review.rating, 0) || 0), 0);

  const averageRating = totalReviewsLength > 0 ? (totalRatings / totalReviewsLength).toFixed(1) : '0/5';

  const logoutHandler = async () => {
    await axios.get(`${server}/shop/logout`, { withCredentials: true });
    navigate('/');
    window.location.reload();
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Shop Header */}
      <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
        <div className="absolute top-4 right-4">
          <span className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
            {isOwner ? 'Owner' : 'Shop'}
          </span>
        </div>

        <div className="w-full flex flex-col items-center justify-center pt-4">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur opacity-30"></div>
            <img
              src={getShopAvatarUrl(data?.avatar)}
              alt={seller?.name || "Shop Avatar"}
              className='relative w-[140px] h-[140px] object-cover rounded-full border-4 border-white shadow-2xl'
              onError={(e) => {
                e.currentTarget.src = 'https://via.placeholder.com/140';
              }}
            />
          </div>
          <h3 className='text-center mt-4 text-2xl font-bold text-white'>
            {data?.name || "Shop Name"}
          </h3>
          <div className="mt-2 flex items-center gap-1">
            <FiStar className="text-yellow-300 fill-yellow-300" size={14} />
            <span className="text-white/90 font-medium">{averageRating}</span>
            <span className="text-white/70 text-sm">({totalReviewsLength} reviews)</span>
          </div>
        </div>
      </div>

      {/* Shop Description */}
      <div className="px-6 pt-6">
        <div className="flex items-start gap-3">
          <MdStorefront className="text-blue-500 mt-1" size={20} />
          <p className='text-gray-600 leading-relaxed'>
            {data?.description || "No description available"}
          </p>
        </div>
      </div>

      {/* Shop Details */}
      <div className="px-6 py-4 space-y-4">
        {/* Address */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiMapPin className="text-blue-600" size={20} />
          </div>
          <div className="flex-1">
            <h5 className='font-semibold text-gray-700 mb-1'>
              Address
            </h5>
            <h4 className='text-gray-600'>
              {data?.address || "Address not specified"}
            </h4>
          </div>
        </div>

        {/* Phone Number */}
        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors duration-200">
          <div className="p-2 bg-green-100 rounded-lg">
            <FiPhone className="text-green-600" size={20} />
          </div>
          <div className="flex-1">
            <h5 className='font-semibold text-gray-700 mb-1'>
              Phone Number
            </h5>
            <h4 className='text-gray-600'>
              {data?.phoneNumber ? `0${data.phoneNumber}` : "Not provided"}
            </h4>
          </div>
        </div>

        {/* Total Products */}
        < div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors duration-200">
          <div className="p-2 bg-purple-100 rounded-lg">
            <FiPackage className="text-purple-600" size={20} />
          </div>
          <div className="flex-1">
            <h5 className='font-semibold text-gray-700 mb-1'>
              Total Products
            </h5>
            <h4 className='text-gray-600'>
              {products?.length || 0} {products?.length === 1 ? 'product' : 'products'}
            </h4>
          </div>
        </div>

        {/* Shop Ratings */}
        <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors duration-200">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <FiStar className="text-yellow-600" size={20} />
          </div>
          <div className="flex-1">
            <h5 className='font-semibold text-gray-700 mb-1'>
              Shop Ratings
            </h5>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FiStar
                    key={star}
                    className={`${star <= Math.floor(averageRating)
                      ? "text-yellow-400 fill-yellow-400"
                      : star === Math.ceil(averageRating) && averageRating % 1 !== 0
                        ? "text-yellow-400 half-star"
                        : "text-gray-300"
                      }`}
                    size={18}
                    style={
                      star === Math.ceil(averageRating) && averageRating % 1 !== 0
                        ? {
                          position: 'relative',
                          clipPath: 'inset(0 50% 0 0)'
                        }
                        : undefined
                    }
                  />
                ))}
              </div>
              <span className="text-gray-600 font-medium">
                {(Number(averageRating) || 0).toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Joined On */}
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
          <div className="p-2 bg-gray-100 rounded-lg">
            <FiCalendar className="text-gray-600" size={20} />
          </div>
          <div className="flex-1">
            <h5 className='font-semibold text-gray-700 mb-1'>
              Joined On
            </h5>
            <h4 className='text-gray-600'>
              {data?.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'N/A'}
            </h4>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {
        isOwner && (
          <div className="px-6 py-6 bg-gradient-to-t from-gray-50 to-white border-t border-gray-200">
            <div className="space-y-3">
              <Link to="/settings">
                <button
                  className="w-full h-[48px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group"
                  onClick={() => console.log('Edit shop')}
                >
                  <FiEdit2 size={18} className="group-hover:rotate-12 transition-transform" />
                  <span>Edit Shop</span>
                </button>
              </Link>
              <button
                className="w-full mt-3 h-[48px] border-2 border-red-300 hover:border-red-400 text-red-600 hover:text-red-700 font-semibold rounded-xl bg-white hover:bg-red-50 transition-all duration-300 flex items-center justify-center gap-2 group"
                onClick={logoutHandler}
              >
                <FiLogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                <span>Log Out</span>
              </button>
            </div>

            {/* Shop Stats */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h5 className="font-semibold text-gray-700 mb-4 text-center">Shop Performance</h5>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                  <p className="text-2xl font-bold text-blue-600">{data?.orders || '0'}</p>
                  <p className="text-xs text-gray-500 mt-1">Orders Today</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                  <p className="text-2xl font-bold text-green-600">{totalReviewsLength || '0'}</p>
                  <p className="text-xs text-gray-500 mt-1">Positive Reviews</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                  <p className="text-2xl font-bold text-purple-600">{data?.responseTime || '100'}%</p>
                  <p className="text-xs text-gray-500 mt-1">Response Time</p>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-200">
        <p className="text-center text-sm text-gray-500">
          Shop ID: <span className="font-mono text-gray-700">{data?._id?.slice(-8) || 'N/A'}</span>
        </p>
      </div>
    </div >
  );
};

export default ShopInfo;