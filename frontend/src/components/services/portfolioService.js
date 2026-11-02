import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createPortfolio(portfolioData) {
    if (!API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is missing in .env.local");
    }

    const baseURL = API_URL.endsWith("/") ? API_URL : `${API_URL}/`;

    try {
        const response = await axios.post(`${baseURL}create-portfolio`, portfolioData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;
    } catch (error) {
        if (error.response) {
            const message =
                error.response.data?.message ||
                "Failed to create portfolio";

            const details = error.response.data?.error;

            throw new Error(
                details ? `${message}: ${details}` : message
            );
        }

        if (error.request) {
            throw new Error(
                "Cannot connect to the backend. Check the server URL and whether your backend is running."
            );
        }

        throw new Error(
            error.message || "An unexpected error occurred"
        );
    }
}

export async function getPortfolioProfile(slugName) {
    try {
        const URL = `${API_URL}/get-portfolio/${slugName}`;

        const apiResponse = await axios.get(URL);

        console.log("STATUS:", apiResponse.status);
        console.log("RESPONSE DATA:", apiResponse.data);
        console.log("RESPONSE HEADERS:", apiResponse.headers);

        return apiResponse;

    } catch (err) {
        console.log("API ERROR:", err);
        return false;
    }
}
