import React, { useEffect, useState } from "react";
import AdminHeader from "../../components/Admin/Layout/AdminHeader.jsx";
import AdminSidebar from "../../components/Admin/Layout/AdminSidebar.jsx";
import { useDispatch, useSelector } from "react-redux";
import { getAllOrdersAdmin } from "../../redux/actions/order";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Calendar, 
  DollarSign,
  ShoppingBag,
  Eye
} from "lucide-react";

const STATUS_STYLES = {
  "Delivered": "bg-green-100 text-green-800 border-green-200",
  "Processing": "bg-blue-100 text-blue-800 border-blue-200",
  "Shipped": "bg-purple-100 text-purple-800 border-purple-200",
  "Cancelled": "bg-red-100 text-red-800 border-red-200",
  "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Refunded": "bg-orange-100 text-orange-800 border-orange-200",
  "Processing Refund": "bg-orange-100 text-orange-800 border-orange-200",
  "Refund Success": "bg-emerald-100 text-emerald-800 border-emerald-200"
};

const AdminDashboardOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const { adminOrders, adminOrderLoading } = useSelector(
    (state) => state.order
  );

  useEffect(() => {
    dispatch(getAllOrdersAdmin());
  }, [dispatch]);

  // Process orders with correct status field
  const processedOrders = adminOrders && adminOrders.length > 0
    ? adminOrders.map((item) => ({
        id: item._id,
        shortId: item._id?.slice(-8) || "N/A",
        itemsQty: item?.cart?.reduce((acc, item) => acc + (item?.qty || 0), 0) || 0,
        total: item?.totalPrice || 0,
        totalFormatted: `${item?.totalPrice || 0} $`,
        status: item?.Status || item?.status || "Pending",
        createdAt: item?.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
        rawDate: item?.createdAt,
        customer: item?.user?.name || "Unknown",
        customerEmail: item?.user?.email || "Unknown",
        paymentMethod: item?.paymentInfo?.type || "Unknown",
        items: item?.cart || []
      }))
    : [];

  // Filter orders based on search
  const filteredOrders = processedOrders.filter(order =>
    order.shortId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewOrder = (orderId) => {
    navigate(`/user/order/${orderId}`);
  };

  const getStatusBadge = (status) => {
    const style = STATUS_STYLES[status] || "bg-gray-100 text-gray-800 border-gray-200";
    return (
      <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${style}`}>
        {status}
      </span>
    );
  };

  // Loading State
  if (adminOrderLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex">
          <AdminSidebar active={2} />
          <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <div className="flex">
        <AdminSidebar active={2} />
        
        <div className="flex-1 overflow-x-hidden">
          {/* Main Content */}
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header Section */}
            <div className="mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                All Orders
              </h1>
              <p className="text-gray-600 text-sm md:text-base">
                Manage and track all customer orders
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Total Orders</p>
                    <p className="text-lg md:text-2xl font-bold text-gray-800">
                      {processedOrders.length}
                    </p>
                  </div>
                  <ShoppingBag className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Total Revenue</p>
                    <p className="text-lg md:text-2xl font-bold text-green-600">
                      ${processedOrders.reduce((sum, order) => sum + order.total, 0)}
                    </p>
                  </div>
                  <DollarSign className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Total Items</p>
                    <p className="text-lg md:text-2xl font-bold text-purple-600">
                      {processedOrders.reduce((sum, order) => sum + order.itemsQty, 0)}
                    </p>
                  </div>
                  <Package className="w-6 h-6 md:w-8 md:h-8 text-purple-500" />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-gray-500">Delivered</p>
                    <p className="text-lg md:text-2xl font-bold text-emerald-600">
                      {processedOrders.filter(o => o.status === "Delivered").length}
                    </p>
                  </div>
                  <Calendar className="w-6 h-6 md:w-8 md:h-8 text-emerald-500" />
                </div>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID, Customer, or Status..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base"
                />
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {currentOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Order ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-800">
                        #{order.shortId}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Customer:</span>
                      <span className="text-xs font-medium text-gray-800">{order.customer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Items:</span>
                      <span className="text-xs font-medium text-gray-800">{order.itemsQty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Total:</span>
                      <span className="text-sm font-bold text-green-600">{order.totalFormatted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-500">Date:</span>
                      <span className="text-xs text-gray-600">{order.createdAt}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleViewOrder(order.id)}
                    className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items Qty
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-gray-900">
                            #{order.shortId}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                            <p className="text-xs text-gray-500">{order.customerEmail}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{order.itemsQty}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-green-600">
                            {order.totalFormatted}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">{order.createdAt}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Empty State */}
            {currentOrders.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">No orders match your search criteria.</p>
              </div>
            )}

            {/* Pagination */}
            {filteredOrders.length > 0 && (
              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (totalPages <= 7 || 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1.5 text-sm border rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} className="px-2 py-1.5 text-sm">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOrders;