import React from 'react';

const PrivacyPolicy: React.FC = () => (
  <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
        <p className="mb-6 text-csfloat-light/70">Last updated: December 15, 2024</p>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-8 text-csfloat-light/80 leading-relaxed">
            This Privacy Policy describes how CSFloat ("we," "us," or "our") collects, uses, discloses, and safeguards your information when you visit our website, use our mobile application, or engage with our skin rental and trading services (collectively, the "Service"). By accessing or using the Service, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">1.1 Personal Information</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Account Information:</strong> Steam ID, username, email address, profile picture, and other Steam profile data</li>
            <li><strong>Identity Verification:</strong> Government-issued ID, proof of address, and other verification documents when required</li>
            <li><strong>Contact Information:</strong> Email address, phone number, and communication preferences</li>
            <li><strong>Payment Information:</strong> Payment method details, transaction history, and billing information</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">1.2 Transaction and Usage Data</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Skin Inventory:</strong> CS2 skin collections, item details, market values, and trading history</li>
            <li><strong>Rental Activity:</strong> Items rented, rental duration, return status, and rental fees</li>
            <li><strong>Trading Activity:</strong> Trade offers, transaction logs, and marketplace interactions</li>
            <li><strong>Platform Usage:</strong> Pages visited, features used, search queries, and user preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">1.3 Technical Information</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
            <li><strong>Log Data:</strong> Access times, pages viewed, error logs, and performance metrics</li>
            <li><strong>Cookies and Tracking:</strong> Session cookies, analytics cookies, and similar technologies</li>
            <li><strong>Location Data:</strong> Approximate location based on IP address for security and compliance</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Service Provision:</strong> To provide, maintain, and improve our skin rental and trading services</li>
            <li><strong>Account Management:</strong> To create and manage your account, process transactions, and handle customer support</li>
            <li><strong>Security and Fraud Prevention:</strong> To detect, prevent, and investigate fraudulent activities and security threats</li>
            <li><strong>Compliance:</strong> To comply with legal obligations, including anti-money laundering (AML) and know-your-customer (KYC) requirements</li>
            <li><strong>Communication:</strong> To send important updates, security alerts, and customer service messages</li>
            <li><strong>Analytics:</strong> To analyze usage patterns, improve user experience, and develop new features</li>
            <li><strong>Marketing:</strong> To send promotional offers and updates (with your consent)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">3. Information Sharing and Disclosure</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">3.1 Service Providers</h3>
          <p className="mb-4 text-csfloat-light/80">
            We may share your information with trusted third-party service providers who assist us in operating our platform, including:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>Payment processors and financial institutions</li>
            <li>Cloud hosting and infrastructure providers</li>
            <li>Analytics and monitoring services</li>
            <li>Customer support and communication platforms</li>
            <li>Identity verification and fraud detection services</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">3.2 Legal Requirements</h3>
          <p className="mb-4 text-csfloat-light/80">
            We may disclose your information when required by law, regulation, or legal process, including:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>Compliance with government requests and court orders</li>
            <li>Investigation of potential violations of our Terms of Service</li>
            <li>Protection of our rights, property, or safety</li>
            <li>Prevention of fraud, abuse, or illegal activities</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">3.3 Business Transfers</h3>
          <p className="mb-6 text-csfloat-light/80">
            In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the business transaction. We will notify you of any such changes and ensure appropriate protections are in place.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">4. Data Security</h2>
          <p className="mb-4 text-csfloat-light/80">
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>Encryption of data in transit and at rest using AES-256 encryption</li>
            <li>Multi-factor authentication for account access</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Secure data centers with physical and digital security controls</li>
            <li>Employee training on data protection and privacy practices</li>
            <li>Incident response procedures for security breaches</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">5. Data Retention</h2>
          <p className="mb-4 text-csfloat-light/80">
            We retain your personal information for as long as necessary to:
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>Provide our services and maintain your account</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Resolve disputes and enforce our agreements</li>
            <li>Prevent fraud and ensure platform security</li>
          </ul>
          <p className="mb-6 text-csfloat-light/80">
            Account data is typically retained for 7 years after account closure to comply with financial regulations. Transaction records may be retained longer for tax and compliance purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">6. Your Rights and Choices</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">6.1 Access and Control</h3>
          <p className="mb-4 text-csfloat-light/80">You have the right to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
            <li><strong>Restriction:</strong> Request limitation of how we process your information</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">6.2 Marketing Communications</h3>
          <p className="mb-6 text-csfloat-light/80">
            You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or updating your communication preferences in your account settings.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">6.3 Cookies and Tracking</h3>
          <p className="mb-6 text-csfloat-light/80">
            You can control cookies through your browser settings. However, disabling certain cookies may affect the functionality of our platform. We use essential cookies for security and authentication that cannot be disabled.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">7. International Data Transfers</h2>
          <p className="mb-6 text-csfloat-light/80">
            Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses and adequacy decisions where applicable.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">8. Children's Privacy</h2>
          <p className="mb-6 text-csfloat-light/80">
            Our Service is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you believe we have collected such information, please contact us immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">9. California Privacy Rights</h2>
          <p className="mb-4 text-csfloat-light/80">
            California residents have additional rights under the California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>Right to know what personal information is collected and how it's used</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">10. Changes to This Privacy Policy</h2>
          <p className="mb-6 text-csfloat-light/80">
            We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">11. Contact Us</h2>
          <p className="mb-6 text-csfloat-light/80">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us:
          </p>
          <div className="bg-csfloat-dark/30 rounded-lg p-6 mb-6">
            <p className="text-csfloat-light/80 mb-2"><strong>Email:</strong> <a href="mailto:privacy@csfloat.com" className="text-csfloat-blue hover:text-blue-400">privacy@csfloat.com</a></p>
            <p className="text-csfloat-light/80 mb-2"><strong>Support:</strong> <a href="mailto:support@csfloat.com" className="text-csfloat-blue hover:text-blue-400">support@csfloat.com</a></p>
            <p className="text-csfloat-light/80"><strong>Address:</strong> CSFloat Inc., 123 Gaming Street, Suite 456, Los Angeles, CA 90210</p>
          </div>

          <div className="mt-12 p-6 bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
            <p className="text-yellow-300 text-sm">
              <strong>Legal Notice:</strong> This Privacy Policy is provided for informational purposes and does not constitute legal advice. For specific legal concerns regarding your privacy rights, please consult with a qualified attorney. The information contained herein is current as of the date listed above and may be subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyPolicy; 