import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createPortfolio(portfolioData) {
    try {
        const response = await axios.post(`${API_URL}create-portfolio`, portfolioData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            // Backend returned an error response
            throw new Error(
                error.response.data?.message ||
                "Failed to create portfolio."
            );
        }

        if (error.request) {
            // Request was sent but no response was received
            throw new Error(
                "Unable to connect to the server. Please check your backend."
            );
        }

        // Request configuration error
        throw new Error(
            error.message || "An unexpected error occurred."
        );
    }
}
