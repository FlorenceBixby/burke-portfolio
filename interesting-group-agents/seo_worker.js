/**
 * SEO Injection Worker — theinterestinggroup.com
 *
 * Intercepts every HTML response and injects:
 *   - Meta description
 *   - Canonical tag
 *   - Open Graph tags (Facebook, LinkedIn, iMessage previews)
 *   - Twitter Card tags
 *   - JSON-LD LocalBusiness schema (Google rich results)
 *
 * Also serves:
 *   - /sitemap.xml  — dynamic sitemap
 *   - /robots.txt   — upgraded with sitemap pointer
 *
 * Deploy: wrangler deploy --config wrangler-seo.toml
 */

const SITE = {
  url:         "https://theinterestinggroup.com",
  name:        "The Interesting Group",
  owner:       "Burke Ruder",
  tagline:     "Technology Vendor Advisor — Buda, TX",
  description: "Burke Ruder helps Texas businesses cut costs on telecom, cloud, CCaaS, and cybersecurity contracts — at no cost to you. Paid by the vendors, working for you. Serving Austin, Buda, and Central Texas.",
  email:       "burke@theinterestinggroup.com",
  city:        "Buda",
  state:       "TX",
  zip:         "78610",
  country:     "US",
  geo:         { lat: 30.0849, lng: -97.8411 },
  services:    [
    "Technology Vendor Advisory",
    "Telecom Contract Consulting",
    "Cloud Solutions Advisory",
    "CCaaS Advisory",
    "Cybersecurity Vendor Consulting",
    "Business Phone Systems",
    "Internet Service Optimization",
  ],
  areaServed:  ["Buda TX", "Austin TX", "Round Rock TX", "San Marcos TX", "Central Texas"],
  sameAs:      [
    "https://www.linkedin.com/in/burkeruder",
  ],
};

// ── Page-specific meta overrides ─────────────────────────────────────────────
const PAGE_META = {
  "/": {
    title:       `${SITE.name} | ${SITE.tagline}`,
    description: SITE.description,
  },
  // Add more routes as the site grows:
  // "/contact": { title: "Contact Burke Ruder | The Interesting Group", description: "..." },
};

function getMeta(pathname) {
  return PAGE_META[pathname] || PAGE_META["/"];
}

// ── JSON-LD schema ────────────────────────────────────────────────────────────
function buildSchema(pathname) {
  const base = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": SITE.name,
    "description": SITE.description,
    "url": SITE.url,
    "email": SITE.email,
    "founder": {
      "@type": "Person",
      "name": SITE.owner,
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": SITE.city,
      "addressRegion": SITE.state,
      "postalCode": SITE.zip,
      "addressCountry": SITE.country,
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude":  SITE.geo.lat,
      "longitude": SITE.geo.lng,
    },
    "areaServed": SITE.areaServed.map(area => ({
      "@type": "AdministrativeArea",
      "name": area,
    })),
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Technology Advisory Services",
      "itemListElement": SITE.services.map(s => ({
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": s },
      })),
    },
    "sameAs": SITE.sameAs,
    "priceRange": "Free to clients — vendor-compensated",
  };
  return JSON.stringify(base);
}

// ── HTMLRewriter handlers ─────────────────────────────────────────────────────
class HeadInjector {
  constructor(pathname) {
    this.pathname = pathname;
  }

  element(el) {
    const meta  = getMeta(this.pathname);
    const canon = `${SITE.url}${this.pathname === "/" ? "" : this.pathname}`;

    const tags = `
  <!-- SEO: injected by Cloudflare Worker -->
  <meta name="description" content="${meta.description}">
  <link rel="canonical" href="${canon}">

  <!-- Open Graph -->
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="${canon}">
  <meta property="og:site_name"   content="${SITE.name}">
  <meta property="og:title"       content="${meta.title}">
  <meta property="og:description" content="${meta.description}">

  <!-- Twitter / X Card -->
  <meta name="twitter:card"        content="summary">
  <meta name="twitter:title"       content="${meta.title}">
  <meta name="twitter:description" content="${meta.description}">

  <!-- JSON-LD LocalBusiness Schema -->
  <script type="application/ld+json">${buildSchema(this.pathname)}</script>

  <!-- RB2B Visitor Identification -->
  <script>
    !function(key){
      if(window.reb2b)return;
      window.reb2b={loaded:true};
      var s=document.createElement("script");
      s.async=true;
      s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";
      document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);
    }("46DJ4HGR9K61");
  </script>
  <!-- /SEO -->`;

    el.prepend(tags, { html: true });
  }
}

// Ensure title tag is set correctly (overwrite if stale)
class TitleRewriter {
  constructor(pathname) {
    this.pathname = pathname;
  }
  element(el) {
    const meta = getMeta(this.pathname);
    el.setInnerContent(meta.title);
  }
}

// ── Sitemap ───────────────────────────────────────────────────────────────────
function sitemapResponse() {
  const today = new Date().toISOString().split("T")[0];
  const pages = ["/", "/contact"].map(path => `
  <url>
    <loc>${SITE.url}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : "0.8"}</priority>
  </url>`).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

// ── Robots.txt ────────────────────────────────────────────────────────────────
function robotsResponse() {
  const body = `User-agent: *
Disallow:

Sitemap: ${SITE.url}/sitemap.xml
`;
  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}

// ── Main fetch handler ────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Serve sitemap
    if (url.pathname === "/sitemap.xml") {
      return sitemapResponse();
    }

    // Serve upgraded robots.txt
    if (url.pathname === "/robots.txt") {
      return robotsResponse();
    }

    // Pass request to origin
    let response;
    try {
      response = await fetch(request);
    } catch (e) {
      return new Response("Origin unreachable", { status: 502 });
    }

    // Only transform HTML responses
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    // Inject SEO tags into <head> and fix <title>
    return new HTMLRewriter()
      .on("head",  new HeadInjector(url.pathname))
      .on("title", new TitleRewriter(url.pathname))
      .transform(response);
  },
};
