import { PortfolioApp } from "@/components/PortfolioApp";
import { filtersFromRawParams, type RawSearchParams } from "@/lib/url";

/**
 * The filter state is read from the request URL on the server, so a link like
 * /?track=ai&tags=rag renders the correct view in the first HTML response
 * rather than after hydration.
 */
export default async function Home({
  searchParams,
}: {
  readonly searchParams: Promise<RawSearchParams>;
}) {
  const params = await searchParams;
  return <PortfolioApp initialFilters={filtersFromRawParams(params)} />;
}
