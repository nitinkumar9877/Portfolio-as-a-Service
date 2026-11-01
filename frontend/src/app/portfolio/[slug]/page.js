
import { Suspense } from "react";
import GetUserProfile from "./GetUserProfile";

async function PortfolioContent({ params }) {
  const { slug } = await params;

  return <GetUserProfile slug={slug} />;
}

export default function PortfolioPage({ params }) {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "15px",
          }}
        >
          <p>Loading portfolio...</p>
        </main>
      }
    >
      <PortfolioContent params={params} />
    </Suspense>
  );
}
