
const sendToken = (user, statusCode, res) => {
    const token = user.getJwtToken();

    const options = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
        ),
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user,
        });
};

module.exports = sendToken;
