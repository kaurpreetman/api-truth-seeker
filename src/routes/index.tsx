import { createFileRoute } from "@tanstack/react-router";
import {
  Bookmark,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  RotateCcw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState, PageFrame, SectionIntro } from "@/components/ivy-app";
import {
  fetchAll,
  formatDate,
  formatPrice,
  formatProjectPrice,
  ivyRequest,
  login,
  readStoredSession,
  type Collection,
  type IvySession,
  type Listing,
  type Project,
  type Rental,
  titleCase,
} from "@/lib/ivy";

type View = "listings" | "rentals" | "projects" | "saved" | "insights";
type SearchParams = { view?: View | undefined };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    view: search["view"] as View | undefined,
  }),
  component: Index,
  head: () => ({
    meta: [
      { title: "Ivy Homes · Gurgaon property search" },
      {
        name: "description",
        content: "Browse verified Gurgaon homes, rentals, projects, and live market insights.",
      },
      { property: "og:title", content: "Ivy Homes · Gurgaon property search" },
      {
        property: "og:description",
        content: "Browse verified Gurgaon homes, rentals, projects, and live market insights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Index() {
  const { view = "listings" } = Route.useSearch();
  const [session, setSession] = useState<IvySession | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setSession(readStoredSession());
    setReady(true);
  }, []);
  if (!ready) return <LoadingState />;
  if (!session) return <LoginScreen onLoggedIn={setSession} />;
  return (
    <PageFrame session={session} active={view}>
      <ViewContent session={session} view={view} />
    </PageFrame>
  );
}

function LoginScreen({ onLoggedIn }: { onLoggedIn: (session: IvySession) => void }) {
  const [email, setEmail] = useState("demo1@ivy.homes");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      onLoggedIn(await login(email.trim(), password));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login-page">
      <div className="login-story">
        <div className="brand">
          <span className="brand-mark">I</span>
          <span>
            Ivy <em>Homes</em>
          </span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">Gurgaon, reimagined</p>
          <h1>Space to live life well.</h1>
          <p>
            A considered way to browse the city’s homes, rentals, and new projects — using live data
            from Ivy Homes.
          </p>
        </div>
        <div className="story-meta">
          <span>PROPERTY SEARCH / 06</span>
          <span>CURATED FOR GURGAON</span>
        </div>
      </div>
      <div className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <p className="eyebrow">Welcome back</p>
          <h2>Sign in to Ivy Homes</h2>
          <p>Use one of your demo accounts to explore the live Gurgaon property collection.</p>
          {error ? <div className="login-error">{error}</div> : null}
          <label className="form-label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            className="filter-field"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            className="filter-field"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <Button className="login-submit" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Enter Ivy Homes"}
          </Button>
          <p className="login-help">
            Demo access is available for demo1@ivy.homes, demo2@ivy.homes, and demo3@ivy.homes.
          </p>
        </form>
      </div>
    </div>
  );
}

function ViewContent({ session, view }: { session: IvySession; view: View }) {
  if (view === "rentals") return <RentalsView session={session} />;
  if (view === "projects") return <ProjectsView session={session} />;
  if (view === "saved") return <SavedView session={session} />;
  if (view === "insights") return <InsightsView session={session} />;
  return <ListingsView session={session} />;
}

function ListingsView({ session }: { session: IvySession }) {
  const [filters, setFilters] = useState({
    search: "",
    locality: "",
    bedroom: "",
    furnishing: "",
    min: "",
    max: "",
  });
  const [data, setData] = useState<Collection<Listing> | null>(null);
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);
  const [error, setError] = useState("");
  const query = useMemo(() => {
    const p = new URLSearchParams({
      ...(filters.locality ? { locality: filters.locality } : {}),
      ...(filters.bedroom ? { bhk: filters.bedroom } : {}),
      ...(filters.furnishing ? { furnishing: filters.furnishing } : {}),
      ...(filters.min ? { min_price: filters.min } : {}),
      ...(filters.max ? { max_price: filters.max } : {}),
      sort_by: "posted_at",
      order: "desc",
    });
    return p;
  }, [filters]);
  useEffect(() => {
    setError("");
    void fetchAll<Listing>("/v1/listings", session, query)
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [query, reload, session]);
  const visible =
    data?.results.filter((item) => {
      const searchText =
        `${item.apartment_name} ${item.locality} ${item.description}`.toLowerCase();
      return (
        (!filters.search || searchText.includes(filters.search.toLowerCase())) &&
        (!filters.locality ||
          item.locality.toLowerCase().includes(filters.locality.toLowerCase())) &&
        (!filters.bedroom || item.bedroom === Number(filters.bedroom)) &&
        (!filters.furnishing ||
          item.furnishing.toLowerCase() === filters.furnishing.toLowerCase()) &&
        (!filters.min || item.price >= Number(filters.min)) &&
        (!filters.max || item.price <= Number(filters.max))
      );
    }) ?? [];
  const pageResults = visible.slice(page * 12, page * 12 + 12);
  return (
    <>
      <SectionIntro
        eyebrow="Gurgaon / Homes for sale"
        title="A place that feels like yours."
        description="Browse live sale listings across Gurgaon, with the detail that helps you decide."
        action={
          <span className="status-tag">
            <span className="loading-dot" /> Live collection
          </span>
        }
      />
      <div className="filter-bar">
        <div className="filter-search">
          <Search size={17} />
          <input
            className="filter-field"
            placeholder="Search homes or localities"
            value={filters.search}
            onChange={(e) => {
              setPage(0);
              setFilters({ ...filters, search: e.target.value });
            }}
          />
        </div>
        <input
          className="filter-field"
          placeholder="Locality"
          value={filters.locality}
          onChange={(e) => {
            setPage(0);
            setFilters({ ...filters, locality: e.target.value });
          }}
        />
        <select
          aria-label="Bedrooms"
          className="filter-field"
          value={filters.bedroom}
          onChange={(e) => {
            setPage(0);
            setFilters({ ...filters, bedroom: e.target.value });
          }}
        >
          <option value="">Bedrooms</option>
          <option value="1">1 bedroom</option>
          <option value="2">2 bedrooms</option>
          <option value="3">3 bedrooms</option>
          <option value="4">4 bedrooms</option>
          <option value="5">5 bedrooms</option>
        </select>
        <select
          aria-label="Furnishing"
          className="filter-field"
          value={filters.furnishing}
          onChange={(e) => {
            setPage(0);
            setFilters({ ...filters, furnishing: e.target.value });
          }}
        >
          <option value="">Furnishing</option>
          <option value="unfurnished">Unfurnished</option>
          <option value="semi-furnished">Semi-furnished</option>
          <option value="fully-furnished">Fully furnished</option>
        </select>
        <input
          className="filter-field"
          type="number"
          placeholder="Min ₹"
          value={filters.min}
          onChange={(e) => {
            setPage(0);
            setFilters({ ...filters, min: e.target.value });
          }}
        />
        <input
          className="filter-field"
          type="number"
          placeholder="Max ₹"
          value={filters.max}
          onChange={(e) => {
            setPage(0);
            setFilters({ ...filters, max: e.target.value });
          }}
        />
        <Button
          variant="outline"
          size="icon"
          title="Reset filters"
          aria-label="Reset filters"
          onClick={() => {
            setPage(0);
            setFilters({ search: "", locality: "", bedroom: "", furnishing: "", min: "", max: "" });
          }}
        >
          <RotateCcw size={16} />
        </Button>
      </div>
      {error ? (
        <ErrorState message={error} onRetry={() => setReload((value) => value + 1)} />
      ) : (
        <>
          <div className="results-meta">
            <span>
              <strong>{visible.length.toLocaleString("en-IN")}</strong> homes found
            </span>
            <span>
              <SlidersHorizontal size={14} /> Sorted by newest
            </span>
          </div>
          {data ? (
            <div className="listing-grid">
              {pageResults.map((listing) => (
                <ListingCard key={listing.listing_id} listing={listing} session={session} />
              ))}
            </div>
          ) : (
            <LoadingState />
          )}
          {data && visible.length === 0 ? (
            <div className="error-state">No homes match those filters.</div>
          ) : null}
          {data ? (
            <div className="pagination-row">
              <Button
                variant="outline"
                size="icon"
                disabled={page === 0}
                aria-label="Previous page"
                onClick={() => setPage((value) => value - 1)}
              >
                <ChevronLeft size={17} />
              </Button>
              <span className="status-tag">
                Page {page + 1} of {Math.max(1, Math.ceil(visible.length / 12))}
              </span>
              <Button
                variant="outline"
                size="icon"
                disabled={page + 1 >= Math.ceil(visible.length / 12)}
                aria-label="Next page"
                onClick={() => setPage((value) => value + 1)}
              >
                <ChevronRight size={17} />
              </Button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}

function ListingCard({ listing, session }: { listing: Listing; session: IvySession }) {
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    void ivyRequest<{ results: Listing[] }>("/v1/saved", session)
      .then((data) => setSaved(data.results.some((item) => item.listing_id === listing.listing_id)))
      .catch((reason: Error) => setSaveError(reason.message));
  }, [listing.listing_id, session]);
  const toggle = async () => {
    setSaveError("");
    try {
      await ivyRequest(
        `/v1/saved${saved ? `/${encodeURIComponent(listing.listing_id)}` : ""}`,
        session,
        {
          method: saved ? "DELETE" : "POST",
          body: saved ? null : JSON.stringify({ listing_id: listing.listing_id }),
        },
      );
      setSaved((value) => !value);
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : "Unable to update saved listings.");
    }
  };
  return (
    <article className="listing-card">
      <div className="card-visual">
        <div className="card-topline">
          <span className="source-tag">{listing.website}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={saved ? "Remove from saved" : "Save listing"}
            title={saved ? "Remove from saved" : "Save listing"}
          >
            <Bookmark size={17} fill={saved ? "currentColor" : "none"} />
          </Button>
        </div>
        <div className="price">{formatPrice(listing.price)}</div>
      </div>
      <div className="card-body">
        <h3>{listing.apartment_name}</h3>
        <p className="card-locality">
          <MapPin size={13} /> {titleCase(listing.locality)}
        </p>
        <p className="specs">
          <span>
            <strong>{listing.bedroom}</strong> bed
          </span>
          <span>
            <strong>{listing.bathroom}</strong> bath
          </span>
          <span>
            <strong>{listing.carpet_area.toLocaleString("en-IN")}</strong> sq ft
          </span>
        </p>
        {saveError ? <div className="login-error">{saveError}</div> : null}
        <div className="card-foot">
          <span>
            {listing.is_verified ? (
              <>
                <CheckCircle2 size={13} /> Verified
              </>
            ) : (
              "Listed " + formatDate(listing.posted_at)
            )}
          </span>
          <a className="text-link" href={`/listings/${encodeURIComponent(listing.listing_id)}`}>
            View home
          </a>
        </div>
      </div>
    </article>
  );
}

function RentalsView({ session }: { session: IvySession }) {
  return <CollectionView session={session} type="rentals" />;
}
function ProjectsView({ session }: { session: IvySession }) {
  return <CollectionView session={session} type="projects" />;
}
function CollectionView({ session, type }: { session: IvySession; type: "rentals" | "projects" }) {
  const [data, setData] = useState<Collection<Rental | Project> | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    setError("");
    void fetchAll<Rental | Project>(`/v1/${type}`, session)
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [session, type]);
  const isRental = type === "rentals";
  const pageResults = data?.results.slice(page * 12, page * 12 + 12) ?? [];
  return (
    <>
      <SectionIntro
        eyebrow={`Gurgaon / ${isRental ? "Rentals" : "New projects"}`}
        title={isRental ? "Rent well. Live lightly." : "The next chapter is here."}
        description={
          isRental
            ? "Monthly homes across Gurgaon, with the practical details upfront."
            : "Explore the city’s builder communities, from launch to possession."
        }
      />
      {error ? (
        <ErrorState message={error} />
      ) : data ? (
        <>
          <div className={isRental ? "listing-grid" : "project-grid"}>
            {pageResults.map((item) =>
              isRental ? (
                <RentalCard key={(item as Rental).listing_id} rental={item as Rental} />
              ) : (
                <ProjectCard key={(item as Project).project_id} project={item as Project} />
              ),
            )}
          </div>
          <div className="pagination-row">
            <Button
              variant="outline"
              size="icon"
              disabled={page === 0}
              aria-label="Previous page"
              onClick={() => setPage((value) => value - 1)}
            >
              <ChevronLeft size={17} />
            </Button>
            <span className="status-tag">
              Page {page + 1} of {Math.max(1, Math.ceil(data.total / 12))}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page + 1 >= Math.ceil(data.total / 12)}
              aria-label="Next page"
              onClick={() => setPage((value) => value + 1)}
            >
              <ChevronRight size={17} />
            </Button>
          </div>
        </>
      ) : (
        <LoadingState />
      )}
    </>
  );
}
function RentalCard({ rental }: { rental: Rental }) {
  return (
    <article className="listing-card">
      <div className="card-visual">
        <div className="card-topline">
          <span className="source-tag">{rental.website}</span>
          <span className="status-tag">Rent</span>
        </div>
        <div className="price">
          {formatPrice(rental.price, true)}
          <small>/ month</small>
        </div>
      </div>
      <div className="card-body">
        <h3>{rental.apartment_name}</h3>
        <p className="card-locality">{titleCase(rental.locality)}</p>
        <p className="specs">
          <span>
            <strong>{rental.bedroom}</strong> bed
          </span>
          <span>
            <strong>{rental.bathroom}</strong> bath
          </span>
          <span>
            <strong>{rental.carpet_area.toLocaleString("en-IN")}</strong> sq ft
          </span>
        </p>
        <div className="card-foot">
          <span>Deposit {formatPrice(rental.deposit)}</span>
          <span>{titleCase(rental.furnishing)}</span>
        </div>
      </div>
    </article>
  );
}
function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div className="card-topline">
        <span className="status-tag">{project.project_status}</span>
        <span className="card-locality">{titleCase(project.locality)}</span>
      </div>
      <h3>{project.apartment_name}</h3>
      <p className="project-developer">{project.developer_name}</p>
      <div className="project-price">
        {formatProjectPrice(project.price_min)} — {formatProjectPrice(project.price_max)}
      </div>
      <div className="project-stats">
        <span>
          Available listings<strong>{project.total_listings}</strong>
        </span>
        <span>
          Homes from<strong>{project.min_area_sqft.toLocaleString("en-IN")} sq ft</strong>
        </span>
        <span>
          Possession<strong>{formatDate(project.possession_date)}</strong>
        </span>
        <span>
          Amenities<strong>{project.amenities.slice(0, 2).map(titleCase).join(" · ")}</strong>
        </span>
      </div>
    </article>
  );
}

function SavedView({ session }: { session: IvySession }) {
  const [data, setData] = useState<{ results: Listing[] } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void ivyRequest<{ results: Listing[] }>("/v1/saved", session)
      .then(setData)
      .catch((reason: Error) => setError(reason.message));
  }, [session]);
  return (
    <>
      <SectionIntro
        eyebrow="Your shortlist"
        title="Homes worth coming back to."
        description="Your saved listings stay connected to your Ivy Homes account."
      />
      {error ? (
        <ErrorState message={error} />
      ) : data ? (
        data.results.length ? (
          <div className="listing-grid">
            {data.results.map((listing) => (
              <ListingCard key={listing.listing_id} listing={listing} session={session} />
            ))}
          </div>
        ) : (
          <div className="error-state">
            <Bookmark size={24} />
            <p>Your shortlist is empty. Save a home from the sale collection to see it here.</p>
          </div>
        )
      ) : (
        <LoadingState />
      )}
    </>
  );
}

function InsightsView({ session }: { session: IvySession }) {
  const [data, setData] = useState<{
    city?: string;
    total_listings?: number;
    median_price?: number;
    median_price_per_sqft?: number;
    by_locality?: { locality: string; count: number; median_price?: number }[];
    by_bhk?: { bedroom: number; count: number }[];
  } | null>(null);
  const [findings, setFindings] = useState<{
    duplicateLike: number;
    structurallyInvalid: number;
  } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    void ivyRequest<typeof data>("/v1/analytics/summary", session)
      .then(setData)
      .catch((reason: Error) => {
        setError(reason.message);
        void fetchAll<Listing>("/v1/listings", session)
          .then((collection) => {
            const signatures = new Set<string>();
            let duplicateLike = 0;
            let structurallyInvalid = 0;
            collection.results.forEach((listing) => {
              const signature = [
                listing.apartment_name.trim().toLowerCase(),
                listing.locality.trim().toLowerCase(),
                listing.bedroom,
                listing.price,
                listing.carpet_area,
              ].join("|");
              if (signatures.has(signature)) duplicateLike += 1;
              signatures.add(signature);
              if (listing.price <= 0 || listing.carpet_area <= 0 || !listing.listing_id)
                structurallyInvalid += 1;
            });
            setFindings({ duplicateLike, structurallyInvalid });
          })
          .catch(() => undefined);
      });
  }, [session]);
  return (
    <>
      <SectionIntro
        eyebrow="Gurgaon / Market pulse"
        title="A clearer view of the city."
        description="The service’s live analytics, plus a few signals to help you read the market."
      />
      {error ? (
        <>
          <ErrorState message={`${error} The documented analytics summary is unavailable.`} />
          {findings ? (
            <section className="insight-panel">
              <p className="eyebrow">Live data-quality scan</p>
              <h2>Findings from retrievable listings</h2>
              <div className="metric-grid">
                <div className="metric">
                  <span className="metric-label">Duplicate-looking records</span>
                  <strong>{findings.duplicateLike.toLocaleString("en-IN")}</strong>
                </div>
                <div className="metric">
                  <span className="metric-label">Structurally invalid records</span>
                  <strong>{findings.structurallyInvalid.toLocaleString("en-IN")}</strong>
                </div>
              </div>
              <p className="intro-copy">
                These are observable flags for review, not conclusions about fraud or identity.
              </p>
            </section>
          ) : (
            <LoadingState label="Scanning retrievable listings for findings" />
          )}
        </>
      ) : data ? (
        <div className="insight-layout">
          <section className="insight-panel">
            <p className="eyebrow">City snapshot</p>
            <h2>{titleCase(data.city ?? "Gurgaon")} at a glance</h2>
            <div className="metric-grid">
              <div className="metric">
                <span className="metric-label">Listings tracked</span>
                <strong>{data.total_listings?.toLocaleString("en-IN") ?? "—"}</strong>
              </div>
              <div className="metric">
                <span className="metric-label">Median price</span>
                <strong>{data.median_price ? formatPrice(data.median_price) : "—"}</strong>
              </div>
              <div className="metric">
                <span className="metric-label">Median / sq ft</span>
                <strong>
                  {data.median_price_per_sqft ? formatPrice(data.median_price_per_sqft) : "—"}
                </strong>
              </div>
              <div className="metric">
                <span className="metric-label">Reference city</span>
                <strong>Gurgaon</strong>
              </div>
            </div>
          </section>
          <section className="insight-panel">
            <p className="eyebrow">Most active localities</p>
            <h2>Where people are looking</h2>
            <div className="bar-list">
              {(data.by_locality ?? []).slice(0, 7).map((row) => (
                <div className="bar-row" key={row.locality}>
                  <span className="bar-label">{row.locality}</span>
                  <span className="bar-track">
                    <span
                      className="bar-fill"
                      style={{
                        width: `${Math.max(8, (row.count / Math.max(...(data.by_locality ?? []).map((item) => item.count), 1)) * 100)}%`,
                      }}
                    />
                  </span>
                  <span className="bar-value">{row.count}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <LoadingState />
      )}
    </>
  );
}
