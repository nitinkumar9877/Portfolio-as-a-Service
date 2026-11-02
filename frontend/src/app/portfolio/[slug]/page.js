import { Suspense } from "react";
import PortfolioClient from "./PortfolioClient";

export default function PortfolioPage() {
    return (
        <Suspense fallback={<div>Loading portfolio...</div>}>
            <PortfolioClient />
        </Suspense>
    );
}