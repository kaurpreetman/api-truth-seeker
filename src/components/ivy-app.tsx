import { Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, Building2, ChevronDown, Compass, Home, LogOut, Menu, Search, Sparkles, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { clearStoredSession, initials, type IvySession } from "@/lib/ivy";

export const navItems = [
  { key: "listings", label: "For sale", icon: Home },
  { key: "rentals", label: "Rentals", icon: Compass },
  { key: "projects", label: "Projects", icon: Building2 },
  { key: "saved", label: "Saved", icon: Bookmark },
  { key: "insights", label: "Insights", icon: Sparkles },
] as const;

export type NavKey = (typeof navItems)[number]["key"];

export function AppHeader({ session, active }: { session: IvySession; active?: NavKey }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const signOut = () => {
    clearStoredSession();
    navigate({ to: "/" });
  };
  return (
    <header className="app-header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Ivy Homes home">
          <span className="brand-mark"><Building2 size={18} strokeWidth={2.4} /></span>
          <span>Ivy <em>Homes</em></span>
        </Link>
        <nav className={`main-nav ${open ? "is-open" : ""}`}>
          {navItems.map(({ key, label, icon: Icon }) => (
            <Link key={key} to="/" search={{ view: key }} className={active === key ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <div className="account-chip">
            <span className="avatar">{initials(session.email)}</span>
            <span className="account-email">{session.email}</span>
            <ChevronDown size={15} />
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out"><LogOut size={17} /></Button>
          <Button variant="ghost" size="icon" className="menu-button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
    </header>
  );
}

export function PageFrame({ session, active, children }: { session: IvySession; active?: NavKey; children: ReactNode }) {
  return <div className="app-page"><AppHeader session={session} active={active} /><main>{children}</main><footer className="app-footer"><span>IVY HOMES / GURGAON</span><span>Live property data · Updated continuously</span></footer></div>;
}

export function SectionIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="section-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="intro-copy">{description}</p></div>{action}</div>;
}

export function LoadingState({ label = "Loading live property data" }: { label?: string }) {
  return <div className="loading-state"><span className="loading-dot" /><span>{label}</span></div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return <div className="error-state"><p>{message}</p>{onRetry ? <Button variant="outline" onClick={onRetry}>Try again</Button> : null}</div>;
}

export function SearchIcon() { return <Search size={17} />; }
