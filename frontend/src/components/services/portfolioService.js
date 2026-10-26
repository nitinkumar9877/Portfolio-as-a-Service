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
        // http://localhost:8080/get-portfolio/nitin-kumar-devo
        const URL = `${API_URL}get-portfolio/${slugName}`
        console.log("This is the url for the fetching data from the user :: ", URL);
        const apiResponse = await axios.get(URL);
        return apiResponse;
    } catch (err) {
        console.log("Fail to fetch profile of user");
        console.log(err);
        return false;
    }
}
