const sendShopToken = (seller, statusCode, res) => {
  const token = seller.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'PRODUCTION',
    sameSite: process.env.NODE_ENV === 'PRODUCTION' ? 'None' : 'Lax'
  };

  res
    .status(statusCode)
    .cookie("seller_token", token, options)
    .json({
      success: true,
      seller,
    });
};

module.exports = sendShopToken;
