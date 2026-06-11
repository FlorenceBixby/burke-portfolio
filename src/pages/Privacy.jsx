export default function Privacy() {
  return (
    <section style={{ maxWidth: 720, margin: '0 auto', padding: '80px 24px 120px' }}>
      <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 900, marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: '#86868B', marginBottom: 48 }}>
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div style={{ lineHeight: 1.75, color: '#3d3d3d' }}>

        <h2 style={h2}>Overview</h2>
        <p style={p}>
          The Interesting Group ("we," "us," or "our") is committed to protecting your privacy.
          This policy explains what information we collect when you visit theinterestinggroup.com,
          how we use it, and your rights regarding that information.
        </p>

        <h2 style={h2}>Information We Collect</h2>

        <h3 style={h3}>Contact Form</h3>
        <p style={p}>
          When you submit our contact form, we collect your name, email address, company name,
          phone number (optional), and any message you provide. This information is stored in
          HubSpot CRM and used solely to respond to your inquiry and manage our business relationship.
        </p>

        <h3 style={h3}>Visitor Identification</h3>
        <p style={p}>
          We use <strong>RB2B</strong>, a third-party service, to identify companies and
          individuals who visit our website. RB2B may collect your IP address and match it
          against publicly available data to identify your name, company, and LinkedIn profile.
          This data is used for outreach purposes. You can learn more about RB2B's data practices
          at <a href="https://www.rb2b.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={link}>rb2b.com/privacy-policy</a>.
        </p>

        <h3 style={h3}>Analytics</h3>
        <p style={p}>
          We use Cloudflare's built-in analytics to understand general traffic patterns (page
          views, geography, device type). No cookies are set and no personally identifiable
          information is collected for analytics purposes.
        </p>

        <h2 style={h2}>How We Use Your Information</h2>
        <ul style={ul}>
          <li>To respond to contact form submissions</li>
          <li>To follow up on potential business opportunities</li>
          <li>To improve our website and services</li>
          <li>We do not sell your personal information to third parties</li>
          <li>We do not use your information for advertising networks</li>
        </ul>

        <h2 style={h2}>Data Retention</h2>
        <p style={p}>
          Contact form submissions are retained in HubSpot CRM for as long as we have an active
          or potential business relationship. You may request deletion at any time by emailing us.
        </p>

        <h2 style={h2}>Your Rights</h2>
        <p style={p}>
          You have the right to request access to, correction of, or deletion of any personal
          information we hold about you. To exercise these rights, contact us at{' '}
          <a href="mailto:info@theinterestinggroup.com" style={link}>info@theinterestinggroup.com</a>.
        </p>

        <h2 style={h2}>Third-Party Services</h2>
        <p style={p}>This website uses the following third-party services:</p>
        <ul style={ul}>
          <li><strong>HubSpot</strong> — CRM and contact management (<a href="https://legal.hubspot.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={link}>privacy policy</a>)</li>
          <li><strong>RB2B</strong> — Website visitor identification (<a href="https://www.rb2b.com/privacy-policy" target="_blank" rel="noopener noreferrer" style={link}>privacy policy</a>)</li>
          <li><strong>Cloudflare</strong> — Hosting and analytics (<a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer" style={link}>privacy policy</a>)</li>
          <li><strong>Calendly</strong> — Meeting scheduling, if you book a call (<a href="https://calendly.com/privacy" target="_blank" rel="noopener noreferrer" style={link}>privacy policy</a>)</li>
        </ul>

        <h2 style={h2}>Contact</h2>
        <p style={p}>
          Questions about this policy? Email{' '}
          <a href="mailto:info@theinterestinggroup.com" style={link}>info@theinterestinggroup.com</a>.
        </p>

      </div>
    </section>
  )
}

const h2 = {
  fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 10, color: '#1d1d1f',
}
const h3 = {
  fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 6, color: '#1d1d1f',
}
const p = {
  marginBottom: 16,
}
const ul = {
  paddingLeft: 20, marginBottom: 16,
}
const link = {
  color: '#2d5c3d', textDecoration: 'underline',
}
