// utils/sendShopToken.js
const sendShopToken = (seller, statusCode, res) => {
    const token = seller.getJwtToken();

    res.status(statusCode)
        .cookie("seller_token", token, {
            httpOnly: true,
            secure: true,           // REQUIRED for cross-site cookies
            sameSite: "none",       // REQUIRED for cross-site cookies
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .json({
            success: true,
            seller,
            token,
        });
};

module.exports = sendShopToken;
