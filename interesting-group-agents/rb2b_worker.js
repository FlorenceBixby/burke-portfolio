/**
 * RB2B → Apollo + HubSpot Pipe
 * Cloudflare Worker deployed at: theinterestinggroup.com/webhook/rb2b
 *
 * RB2B identifies US website visitors and POSTs their profile here.
 * ARIA then creates them as warm leads in Apollo and HubSpot.
 *
 * Deploy: wrangler deploy rb2b_worker.js --name rb2b-pipe
 * Secrets: APOLLO_API_KEY, HUBSPOT_API_KEY (set via wrangler secret put)
 */

export default {
  async fetch(request, env) {
    // Only accept POSTs to /webhook/rb2b
    const url = new URL(request.url);
    if (request.method !== "POST" || !url.pathname.startsWith("/webhook/rb2b")) {
      return new Response("Not found", { status: 404 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Bad JSON", { status: 400 });
    }

    // RB2B payload fields
    const {
      first_name,
      last_name,
      email,
      linkedin_url,
      company,
      title,
      page_url,
      page_title,
    } = body;

    // Skip if no email (can't do anything without it)
    if (!email) {
      return new Response(JSON.stringify({ status: "skipped", reason: "no_email" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse UTM campaign from page URL if present
    let utm_campaign = "";
    try {
      if (page_url) {
        const pageUrlObj = new URL(page_url);
        utm_campaign = pageUrlObj.searchParams.get("utm_campaign") || "";
      }
    } catch {}

    const results = { email, apollo: null, hubspot: null, utm_campaign, errors: [] };

    // ── 1. Create/update contact in Apollo ────────────────────────────────────
    try {
      const apolloPayload = {
        first_name,
        last_name,
        email,
        title,
        organization_name: company,
        linkedin_url,
        label_names: ["Website Visitor", "Warm Lead"],
      };

      const apolloResp = await fetch("https://api.apollo.io/api/v1/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": env.APOLLO_API_KEY,
        },
        body: JSON.stringify(apolloPayload),
      });

      const apolloData = await apolloResp.json();
      results.apollo = apolloData.contact?.id || apolloData.error || apolloResp.status;
    } catch (e) {
      results.errors.push(`Apollo: ${e.message}`);
    }

    // ── 2. Create contact + deal in HubSpot ───────────────────────────────────
    try {
      // Find or create contact
      const hsContactPayload = {
        properties: {
          email,
          firstname: first_name,
          lastname: last_name,
          jobtitle: title,
          company,
          hs_lead_status: "NEW",
          lifecyclestage: "lead",
          tig_lead_source: "website_visitor",
          tig_page_visited: page_url || "",
          tig_linkedin: linkedin_url || "",
          tig_utm_campaign: utm_campaign || "",
        },
      };

      const hsResp = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.HUBSPOT_API_KEY}`,
        },
        body: JSON.stringify(hsContactPayload),
      });

      const hsData = await hsResp.json();
      const contactId = hsData.id;
      results.hubspot = contactId || hsData.message;

      // Create a deal linked to this contact
      if (contactId) {
        const dealPayload = {
          properties: {
            dealname: `${first_name} ${last_name} @ ${company} — Inbound`,
            pipeline: "default",
            dealstage: "appointmentscheduled",
            hs_lead_status: "NEW",
            description: `Visited: ${page_url || "theinterestinggroup.com"}\nSource: RB2B website visitor identification`,
          },
          associations: [
            {
              to: { id: contactId },
              types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 3 }],
            },
          ],
        };

        await fetch("https://api.hubapi.com/crm/v3/objects/deals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${env.HUBSPOT_API_KEY}`,
          },
          body: JSON.stringify(dealPayload),
        });
      }
    } catch (e) {
      results.errors.push(`HubSpot: ${e.message}`);
    }

    // ── 3. Log to console (visible in Cloudflare dashboard) ──────────────────
    console.log(
      `RB2B visitor: ${first_name} ${last_name} @ ${company} <${email}> | Apollo: ${results.apollo} | HS: ${results.hubspot}`
    );

    return new Response(JSON.stringify({ status: "ok", ...results }), {
      headers: { "Content-Type": "application/json" },
    });
  },
};
