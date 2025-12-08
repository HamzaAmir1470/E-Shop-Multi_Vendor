// create token and saving that in cookies
const sendShopToken = (seller, statusCode, res) => {
    const token = seller.getJwtToken();

    // remove password before sending to frontend
    seller.password = undefined;

    // Cookie options
    const options = {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        sameSite: "none",
        secure: true,
    };

    res
        .status(statusCode)
        .cookie("seller_token", token, options)
        .json({
            success: true,
            seller,   // <-- IMPORTANT: return seller object
            token,
        });
};

module.exports = sendShopToken;
