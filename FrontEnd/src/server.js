const normalizeBaseUrl = (value) => value ? value.replace(/\/$/, "") : value;

const backendBaseUrl = normalizeBaseUrl(
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_SERVER_URL ||
    "https://e-shop-multi-vendor.vercel.app"
);

const apiBaseUrl = normalizeBaseUrl(
    import.meta.env.VITE_API_URL || `${backendBaseUrl}/api/v2`
);

export const server = apiBaseUrl;
export const serverShop = `${apiBaseUrl}/shop`;
export const backend_url = backendBaseUrl;
export const frontend_url = normalizeBaseUrl(
    import.meta.env.VITE_FRONTEND_URL || "https://sultanf.vercel.app"
);

export const resolveAssetUrl = (value) => {
    if (!value) return "";

    if (typeof value === "string") {
        if (/^https?:\/\//i.test(value)) {
            return value;
        }

        return `${backend_url}/${value.replace(/^\/+/, "")}`;
    }

    if (typeof value === "object") {
        return resolveAssetUrl(value.url || value.secure_url || value.image || value.path || value.public_id);
    }

    return "";
};