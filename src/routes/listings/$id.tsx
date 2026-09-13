import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, CheckCircle2, MapPin, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ErrorState, LoadingState, PageFrame, SectionIntro } from "@/components/ivy-app";
import { formatDate, formatPrice, ivyRequest, readStoredSession, titleCase, type IvySession, type Listing } from "@/lib/ivy";

export const Route = createFileRoute("/listings/$id")({
  component: ListingDetail,
  head: () => ({
    meta: [
      { title: "Listing detail · Ivy Homes" },
      { name: "description", content: "View property details, pricing, area, and seller information for a Gurgaon listing." },
      { property: "og:title", content: "Listing detail · Ivy Homes" },
      { property: "og:description", content: "View property details, pricing, area, and seller information for a Gurgaon listing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ListingDetail() {
  const { id } = Route.useParams();
  const [session, setSession] = useState<IvySession | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = readStoredSession();
    setSession(stored);
    if (!stored) return;
    void ivyRequest<Listing>(`/v1/listings/${encodeURIComponent(id)}`, stored)
      .then(setListing)
      .catch((reason: Error) => setError(reason.message));
    void ivyRequest<{ results: Listing[] }>("/v1/saved", stored)
      .then((data) => setSaved(data.results.some((item) => item.listing_id === id)))
      .catch(() => undefined);
  }, [id]);

  if (!session) return <LoginPrompt />;
  if (error) return <PageFrame session={session}><ErrorState message={error} /></PageFrame>;
  if (!listing) return <PageFrame session={session}><LoadingState /></PageFrame>;

  const toggleSaved = async () => {
    try {
      await ivyRequest(`/v1/saved${saved ? `/${encodeURIComponent(id)}` : ""}`, session, {
        method: saved ? "DELETE" : "POST",
        body: saved ? undefined : JSON.stringify({ listing_id: id }),
      });
      setSaved((value) => !value);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to update saved listings.");
    }
  };

  return <PageFrame session={session} active="listings">
    <div className="detail-hero">
      <div className="detail-visual"><div><span className="source-tag">{listing.website}</span><div className="price">{formatPrice(listing.price)}</div></div></div>
      <div className="detail-copy">
        <Link to="/" search={{ view: "listings" }} className="text-link"><ArrowLeft size={14} /> Back to homes</Link>
        <p className="eyebrow" style={{ marginTop: 28 }}>{titleCase(listing.property_type)} · {listing.bedroom} bedroom</p>
        <h1>{listing.apartment_name}</h1>
        <p className="intro-copy"><MapPin size={15} /> {titleCase(listing.locality)}, Gurgaon</p>
        <div className="detail-specs">
          <div className="detail-spec"><span>Carpet area</span><strong>{listing.carpet_area.toLocaleString("en-IN")} sq ft</strong></div>
          <div className="detail-spec"><span>Bathrooms</span><strong>{listing.bathroom}</strong></div>
          <div className="detail-spec"><span>Floor</span><strong>{listing.floor} of {listing.total_floors}</strong></div>
          <div className="detail-spec"><span>Furnishing</span><strong>{titleCase(listing.furnishing)}</strong></div>
          <div className="detail-spec"><span>Listed</span><strong>{formatDate(listing.posted_at)}</strong></div>
          <div className="detail-spec"><span>Verification</span><strong>{listing.is_verified ? "Verified" : "Unverified"}</strong></div>
        </div>
        <Button onClick={toggleSaved} variant={saved ? "secondary" : "default"}><Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved to your list" : "Save this home"}</Button>
      </div>
    </div>
    <section className="detail-description"><p className="eyebrow">About this home</p><p>{listing.description}</p><div className="card-foot"><span>{listing.posted_by === "owner" ? "Listed by owner" : `Listed by ${listing.posted_by}`}</span><span><CheckCircle2 size={14} /> {listing.posted_by_name}</span><span><Share2 size={14} /> {listing.listing_id}</span></div></section>
  </PageFrame>;
}

function LoginPrompt() {
  return <div className="login-page"><div className="login-story"><div className="brand">Ivy <em>Homes</em></div><div className="story-copy"><p className="eyebrow">Private property search</p><h1>Find your next place in Gurgaon.</h1><p>Sign in to browse live listings and keep your shortlist with you.</p></div></div><div className="login-panel"><div className="login-form"><h2>Sign in first</h2><p>Your saved homes and property details are available after you sign in.</p><Link to="/" className="text-link">Go to sign in</Link></div></div></div>;
}