const sendShopToken = (seller, statusCode, res) => {
  const token = seller.getJwtToken();

  const isProduction = process.env.NODE_ENV === "production" && !process.env.FRONTEND_URL?.includes("http://13.53");

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };

  res
    .status(statusCode)
    .cookie("seller_token", token, options)
    .json({
      success: true,
      token,
      seller,
    });
};

module.exports = sendShopToken;