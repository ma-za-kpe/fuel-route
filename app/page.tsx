// Generated from the crew's page by trusted code (T-0914); edit the page, not this file.
import Link from "next/link";
import facts from "@/app/content.json";

export default function Page() {
  return (
    <>
      <meta name="description" content="Fuel Route is a concept product for logistics and real estate teams and customers in Ethiopia, shown as a demonstration. Read the StartupTribunal research behind the concept." />
      <meta property="og:title" content={"Fuel Route — Concept for Logistics and Real Estate in Ethiopia"} />
      <meta property="og:description" content="A concept product for logistics and real estate teams and customers in Ethiopia, shown as a demonstration. Read the StartupTribunal research behind the concept." />
      <title>
        Fuel Route — Concept for Logistics and Real Estate in Ethiopia
      </title>
      <header className="site-header">
        {"\n"}
        <div className="wrap header-inner">
          {"\n"}
          <Link className="brand" href="/">
            {"\n"}
            <svg className="brand-mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              {"\n"}
              <circle cx="16" cy="16" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"></circle>
              {"\n"}
              <path d="M16 6 L21 20 L16 16 L11 20 Z" fill="currentColor"></path>
              {"\n"}
            </svg>
            {"\n"}
            <span className="brand-name">
              Fuel Route
            </span>
            {"\n"}
          </Link>
          {"\n"}
          <nav className="site-nav" aria-label="Primary">
            {"\n"}
            <Link href="/" aria-current="page">
              Create Homepage (Identity and Navigation)
            </Link>
            {"\n"}
            <Link href="/research">
              Create Research Page (Problem, Status, and Source)
            </Link>
            {"\n"}
          </nav>
          {"\n"}
        </div>
        {"\n"}
      </header>
      {"\n"}
      <main className="wrap">
        {"\n"}
        <section className="intro">
          {"\n"}
          <p className="kicker">
            Concept product
          </p>
          {"\n"}
          <h1>
            Fuel Route
          </h1>
          {"\n"}
          <p className="lede">
            A concept product for logistics and real estate teams and customers in Ethiopia, shown as a demonstration.
          </p>
          {"\n"}
          <p className="status-note">
            This is a demonstration site for a fictional business.
          </p>
          {"\n"}
          <p className="cta-row">
            <Link className="cta" href="/research">
              Read the StartupTribunal research behind this concept
            </Link>
          </p>
          {"\n"}
        </section>
        {"\n"}
        <section className="section" id="offer" aria-labelledby="offer-title">
          {"\n"}
          <h2 id="offer-title">
            Offer and Pricing
          </h2>
          {"\n"}
          <div className="facts">
            {"\n"}
            <p className="fact">
              {facts.F1}
              .
            </p>
            {"\n"}
            <p className="fact">
              {facts.F2}
              .
            </p>
            {"\n"}
          </div>
          {"\n"}
        </section>
        {"\n"}
        <section className="section" id="hours" aria-labelledby="hours-title">
          {"\n"}
          <h2 id="hours-title">
            Opening Hours
          </h2>
          {"\n"}
          <p className="note">
            This is a demonstration site for a fictional business, so it does not publish opening hours.
          </p>
          {"\n"}
        </section>
        {"\n"}
        <section className="section" id="location" aria-labelledby="location-title">
          {"\n"}
          <h2 id="location-title">
            Location
          </h2>
          {"\n"}
          <p className="note">
            This is a demonstration site for a fictional business, so it does not publish a physical location.
          </p>
          {"\n"}
        </section>
        {"\n"}
      </main>
      {"\n"}
      <footer className="site-footer">
        {"\n"}
        <div className="wrap footer-inner">
          {"\n"}
          <p className="footer-brand">
            Fuel Route
          </p>
          {"\n"}
          <nav className="site-nav footer-nav" aria-label="Footer">
            {"\n"}
            <Link href="/" aria-current="page">
              Create Homepage (Identity and Navigation)
            </Link>
            {"\n"}
            <Link href="/research">
              Create Research Page (Problem, Status, and Source)
            </Link>
            {"\n"}
          </nav>
          {"\n"}
          <p className="footer-note">
            A concept product for logistics and real estate teams and customers in Ethiopia, shown as a demonstration. A demonstration site for a fictional business.
          </p>
          {"\n"}
        </div>
        {"\n"}
      </footer>
    </>
  );
}
