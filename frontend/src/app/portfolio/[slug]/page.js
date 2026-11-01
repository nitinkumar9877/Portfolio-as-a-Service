
import GetUserProfile from "./GetUserProfile";

export default async function PortfolioPage({ params }) {
  const { slug } = await params;

  return <GetUserProfile slug={slug} />;
}
