import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import { server } from '../../server';
import styles from '../../styles/styles';
import CheckoutSteps from '../Checkout/CheckoutSteps.jsx';
import {
  CardNumberElement,
  CardCvcElement,
  CardExpiryElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// PayPal Script Loader
const loadPayPalScript = (setPaypalReady) => {
  const script = document.createElement('script');
  script.src = 'https://www.paypal.com/sdk/js?client-id=test&currency=USD';
  script.addEventListener('load', () => setPaypalReady(true));
  document.body.appendChild(script);
};

// Card payment method component
const CardPayment = ({ handlePayment, stripe, elements, amount }) => {
  const [cardName, setCardName] = useState('');
  const [errors, setErrors] = useState({});
  const [cardState, setCardState] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });

  const stripeElementStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        fontFamily: 'inherit',
        '::placeholder': {
          color: '#9CA3AF',
        },
      },
      invalid: {
        color: '#DC2626',
      },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!cardName.trim()) {
      nextErrors.cardName = 'Cardholder name is required';
    }

    if (!cardState.number) {
      nextErrors.cardNumber = 'Card number is incomplete';
    }

    if (!cardState.expiry) {
      nextErrors.expiryDate = 'Expiry date is incomplete';
    }

    if (!cardState.cvc) {
      nextErrors.cvv = 'CVV is incomplete';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await handlePayment('card', {
      cardName: cardName.trim(),
      amount,
      stripe,
      elements,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number <span className="text-red-500">*</span>
        </label>
        <div className={`w-full border rounded-lg px-3 py-3 bg-white ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}>
          <CardNumberElement options={stripeElementStyle} onChange={(event) => setCardState((prev) => ({ ...prev, number: event.complete }))} />
        </div>
        {errors.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="cardName"
          value={cardName}
          onChange={(e) => {
            setCardName(e.target.value);
            if (errors.cardName) {
              setErrors((prev) => ({ ...prev, cardName: '' }));
            }
          }}
          placeholder="As shown on card"
          className={`${styles.input} w-full ${errors.cardName ? 'border-red-500' : ''}`}
        />
        {errors.cardName && (
          <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <div className={`w-full border rounded-lg px-3 py-3 bg-white ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'}`}>
            <CardExpiryElement options={stripeElementStyle} onChange={(event) => setCardState((prev) => ({ ...prev, expiry: event.complete }))} />
          </div>
          {errors.expiryDate && (
            <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV <span className="text-red-500">*</span>
          </label>
          <div className={`w-full border rounded-lg px-3 py-3 bg-white ${errors.cvv ? 'border-red-500' : 'border-gray-300'}`}>
            <CardCvcElement options={stripeElementStyle} onChange={(event) => setCardState((prev) => ({ ...prev, cvc: event.complete }))} />
          </div>
          {errors.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements}
        className="w-full bg-blue-600 disabled:bg-blue-400 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
      >
        {!stripe || !elements ? 'Loading payment form...' : `Pay $${Number(amount || 0).toFixed(2)}`}
      </button>
    </form>
  );
};

// PayPal payment method component
const PayPalPayment = ({ amount, handlePayment }) => {
  const [paypalReady, setPaypalReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if PayPal script is already loaded
    if (!window.paypal) {
      loadPayPalScript(setPaypalReady);
    } else {
      setPaypalReady(true);
    }
  }, []);

  useEffect(() => {
    if (paypalReady && window.paypal) {
      try {
        window.paypal.Buttons({
          createOrder: (data, actions) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: amount.toString(),
                  currency_code: 'USD'
                }
              }]
            });
          },
          onApprove: (data, actions) => {
            return actions.order.capture().then((details) => {
              // Payment successful
              handlePayment('paypal', {
                orderId: data.orderID,
                payerEmail: details.payer.email_address,
                payerName: `${details.payer.name.given_name} ${details.payer.name.surname}`
              });
            });
          },
          onError: (err) => {
            console.error('PayPal Error:', err);
            setError('PayPal payment failed. Please try again.');
            toast.error('PayPal payment failed. Please try again.');
          }
        }).render('#paypal-button-container');
      } catch (err) {
        console.error('PayPal Render Error:', err);
        setError('Failed to load PayPal button');
      }
    }
  }, [paypalReady, amount, handlePayment]);

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-600 hover:text-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!paypalReady) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading PayPal...</p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div id="paypal-button-container" className="max-w-md mx-auto"></div>
      <p className="text-xs text-gray-500 text-center mt-4">
        You'll be redirected to PayPal to complete your payment securely
      </p>
    </div>
  );
};

// Cash on Delivery method
const CashOnDelivery = ({ handlePayment }) => {
  return (
    <div className="text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">Cash on Delivery</h3>
      <p className="text-gray-600 mb-6">
        Pay with cash when your order is delivered
      </p>
      <button
        onClick={() => handlePayment('cod')}
        className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
      >
        Place Order (COD)
      </button>
    </div>
  );
};

// Main Payment Component
const Payment = () => {
  const { user } = useSelector((state) => state.user);
  const { cart } = useSelector((state) => state.cart);
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const navigate = useNavigate();


  useEffect(() => {
    // Get order data from localStorage
    const storedOrder = localStorage.getItem('latestOrder');
    if (storedOrder) {
      setOrderData(JSON.parse(storedOrder));
    } else {
      toast.error('No order found. Please start checkout again.');
      navigate('/checkout');
    }

    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, [navigate]);

  const finalizePayment = async (method, paymentDetails = null) => {
    if (!orderData) {
      toast.error('Order data not found');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call for non-PayPal payments
      if (method !== 'paypal' && method !== 'card') {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      if (method === 'card') {
        const { data } = await axios.post(
          `${server}/order/create-order`,
          {
            cart: orderData.items,
            shippingAddress: orderData.shippingAddress,
            totalPrice: Number(orderData.totalPrice),
            paymentInfo: {
              id: paymentDetails?.paymentIntentId,
              status: 'succeeded',
              type: 'card',
            },
          },
          { withCredentials: true }
        );

        if (!data?.success) {
          throw new Error('Order could not be created');
        }

        const firstOrderId = data?.orders?.[0]?._id || data?.orders?.[0]?.id || `ORD${Date.now()}`;

        localStorage.removeItem('latestOrder');
        toast.success('Card payment successful! Order placed successfully!');

        navigate(`/order/success/${firstOrderId}`, {
          state: {
            orderId: firstOrderId,
            paymentMethod: method,
            amount: orderData.totalPrice,
            paymentDetails: paymentDetails,
          }
        });

        return;
      }

      // Mock successful payment (for demonstration)
      const orderResponse = {
        success: true,
        orderId: 'ORD' + Date.now(),
        message: method === 'cod' ? 'Order placed successfully!' :
          method === 'paypal' ? 'PayPal payment successful!' :
            'Payment successful!'
      };

      if (orderResponse.success) {
        // Clear cart and stored order
        localStorage.removeItem('latestOrder');
        // Note: You should also dispatch an action to clear Redux cart

        toast.success(orderResponse.message);

        // Navigate to success page with order details
        navigate(`/order/success/${orderResponse.orderId}`, {
          state: {
            orderId: orderResponse.orderId,
            paymentMethod: method,
            amount: orderData.totalPrice,
            paymentDetails: paymentDetails
          }
        });
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (method, paymentDetails = null) => {
    if (method !== 'card') {
      await finalizePayment(method, paymentDetails);
      return;
    }

    if (!stripe || !elements) {
      toast.error('Payment form is still loading. Please try again.');
      return;
    }

    if (!orderData) {
      toast.error('Order data not found');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (!cardNumberElement) {
      toast.error('Card details are not ready yet');
      return;
    }

    setLoading(true);

    try {
      const amountInCents = Math.round(Number(orderData.totalPrice) * 100);

      const { data } = await axios.post(`${server}/payment/process`, {
        amount: amountInCents,
      });

      const result = await stripe.confirmCardPayment(data.client_secret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: paymentDetails?.cardName || orderData.shippingAddress?.fullName || user?.name || 'Customer',
            email: user?.email,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message || 'Card payment failed');
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        await finalizePayment('card', {
          paymentIntentId: result.paymentIntent.id,
          cardName: paymentDetails?.cardName || orderData.shippingAddress?.fullName || user?.name || 'Customer',
        });
      } else {
        toast.error('Card payment was not completed');
      }
    } catch (error) {
      console.error('Card payment error:', error);
      toast.error(error.response?.data?.message || 'Card payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if cart is empty
  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center py-8 bg-gray-50 min-h-screen">
      <CheckoutSteps active={2} />

      <div className="w-[90%] 1000px:w-[70%] mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold mb-6">Payment Method</h2>

              {/* Payment Method Tabs */}
              <div className="flex border-b mb-6 overflow-x-auto">
                <button
                  className={`pb-3 px-6 font-medium transition-colors relative whitespace-nowrap ${paymentMethod === 'card'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    Credit/Debit Card
                  </div>
                </button>

                <button
                  className={`pb-3 px-6 font-medium transition-colors relative whitespace-nowrap ${paymentMethod === 'paypal'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setPaymentMethod('paypal')}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72c.045-.24.254-.416.495-.416h7.8c2.82 0 4.765.6 5.808 1.758.968 1.074 1.327 2.652.995 4.338-.465 2.355-1.944 4.207-4.15 5.207-2.125.962-4.873.962-8.074.962h-2.47l-.54 2.967a.647.647 0 0 1-.637.54h-2.47l.54-2.967z" />
                      <path d="M18.892 6.793c.45-.022.892-.034 1.32-.034 3.445 0 5.31 1.572 5.31 4.88 0 3.256-1.91 5.172-5.31 5.172h-2.004l-.54 2.967a.647.647 0 0 1-.637.54h-2.47l.54-2.967 1.452-7.978a.502.502 0 0 1 .495-.416c.94 0 1.782.034 2.474.096z" />
                    </svg>
                    PayPal
                  </div>
                </button>

                <button
                  className={`pb-3 px-6 font-medium transition-colors relative whitespace-nowrap ${paymentMethod === 'cod'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Cash on Delivery
                  </div>
                </button>
              </div>

              {/* Payment Method Content */}
              {paymentMethod === 'card' ? (
                <CardPayment
                  handlePayment={handlePayment}
                  stripe={stripe}
                  elements={elements}
                  amount={orderData?.totalPrice}
                />
              ) : paymentMethod === 'paypal' ? (
                <PayPalPayment
                  amount={orderData?.totalPrice}
                  handlePayment={handlePayment}
                />
              ) : (
                <CashOnDelivery handlePayment={handlePayment} />
              )}

              {/* Security Note */}
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>

              {orderData && (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>${orderData.subTotalPrice?.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span>${orderData.shipping?.toFixed(2)}</span>
                    </div>
                    {orderData.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>-${orderData.discountAmount?.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between font-bold">
                        <span>Total</span>
                        <span className="text-blue-600">${orderData.totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address Preview */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Shipping to:</h4>
                    <p className="text-sm text-gray-600">
                      {orderData.shippingAddress?.fullName}<br />
                      {orderData.shippingAddress?.address1}<br />
                      {orderData.shippingAddress?.address2 && (
                        <>{orderData.shippingAddress.address2}<br /></>
                      )}
                      {orderData.shippingAddress?.city}, {orderData.shippingAddress?.country}<br />
                      {orderData.shippingAddress?.zipCode}
                    </p>
                  </div>

                  {/* PayPal Badge for PayPal method */}
                  {paymentMethod === 'paypal' && (
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72c.045-.24.254-.416.495-.416h7.8c2.82 0 4.765.6 5.808 1.758.968 1.074 1.327 2.652.995 4.338-.465 2.355-1.944 4.207-4.15 5.207-2.125.962-4.873.962-8.074.962h-2.47l-.54 2.967a.647.647 0 0 1-.637.54h-2.47l.54-2.967z" />
                        </svg>
                        <span>PayPal Buyer Protection covers your purchase</span>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-700">Processing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payment;