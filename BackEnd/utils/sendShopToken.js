const sendShopToken = (seller, statusCode, res) => {
  const token = seller.getJwtToken();

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: "None"
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
