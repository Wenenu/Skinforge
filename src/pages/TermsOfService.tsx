import React from 'react';

const TermsOfService: React.FC = () => (
  <div className="min-h-screen pt-16 bg-gradient-to-b from-csfloat-darker to-black">
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-csfloat-dark/50 backdrop-blur-sm border border-csfloat-gray/20 rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
        <p className="mb-6 text-csfloat-light/70">Last updated: December 15, 2024</p>
        
        <div className="prose prose-invert max-w-none">
          <p className="mb-8 text-csfloat-light/80 leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the CSFloat website, mobile application, and skin rental and trading services (collectively, the "Service"). By accessing or using the Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, do not use the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">1. Acceptance of Terms</h2>
          <p className="mb-6 text-csfloat-light/80">
            By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">2. Eligibility and Account Requirements</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">2.1 Age Requirements</h3>
          <p className="mb-4 text-csfloat-light/80">
            You must be at least 18 years old or the age of majority in your jurisdiction to use the Service. By using the Service, you represent and warrant that you meet these requirements and have the legal capacity to enter into these Terms.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">2.2 Account Registration</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>You must provide accurate, current, and complete information when creating an account</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You must notify us immediately of any unauthorized use of your account</li>
            <li>You may not create multiple accounts or share your account with others</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">2.3 Identity Verification</h3>
          <p className="mb-6 text-csfloat-light/80">
            We may require identity verification for certain transactions or account features. You agree to provide accurate verification documents and information when requested. Failure to complete verification may result in account restrictions or termination.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">3. Skin Rental and Trading Services</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">3.1 Rental Services</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Rental Terms:</strong> All rentals are subject to availability and our approval</li>
            <li><strong>Rental Period:</strong> Items must be returned within the agreed rental period</li>
            <li><strong>Item Condition:</strong> Items must be returned in the same condition as received</li>
            <li><strong>Late Returns:</strong> Late returns may result in additional fees or account suspension</li>
            <li><strong>Damage/Loss:</strong> You are responsible for any damage or loss during the rental period</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">3.2 Trading Services</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Trade Offers:</strong> All trade offers are subject to our review and approval</li>
            <li><strong>Market Prices:</strong> Prices are determined by market conditions and may fluctuate</li>
            <li><strong>Trade Completion:</strong> Trades are final once completed and cannot be reversed</li>
            <li><strong>Fraud Prevention:</strong> We may hold trades for review to prevent fraud</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">3.3 Prohibited Items</h3>
          <p className="mb-4 text-csfloat-light/80">The following items are prohibited from rental or trading:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li>Items obtained through fraud, theft, or other illegal means</li>
            <li>Items that violate Steam's Terms of Service</li>
            <li>Items with inappropriate or offensive names or descriptions</li>
            <li>Items that are part of ongoing investigations or disputes</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">4. Payment and Fees</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">4.1 Payment Methods</h3>
          <p className="mb-4 text-csfloat-light/80">
            We accept various payment methods including credit cards, debit cards, and digital wallets. All payments must be made through our approved payment processors.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">4.2 Fees and Charges</h3>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Rental Fees:</strong> Based on item value and rental duration</li>
            <li><strong>Trading Fees:</strong> Percentage-based fees on completed trades</li>
            <li><strong>Processing Fees:</strong> Additional fees for payment processing</li>
            <li><strong>Late Fees:</strong> Charges for late returns or overdue payments</li>
            <li><strong>Currency:</strong> All fees are charged in USD unless otherwise specified</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">4.3 Refunds and Cancellations</h3>
          <p className="mb-6 text-csfloat-light/80">
            Refunds are provided at our discretion and subject to our refund policy. Rental fees are generally non-refundable unless the service is unavailable due to our error. Trading fees are non-refundable once trades are completed.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">5. Prohibited Conduct</h2>
          <p className="mb-4 text-csfloat-light/80">You agree not to:</p>
          <ul className="list-disc pl-6 mb-6 space-y-2 text-csfloat-light/80">
            <li><strong>Illegal Activities:</strong> Use the Service for any unlawful purpose or in violation of applicable laws</li>
            <li><strong>Fraud:</strong> Engage in fraud, deception, or misrepresentation</li>
            <li><strong>Manipulation:</strong> Attempt to manipulate prices, markets, or other users</li>
            <li><strong>Unauthorized Access:</strong> Gain unauthorized access to accounts, systems, or data</li>
            <li><strong>Automation:</strong> Use bots, scripts, or automated methods without permission</li>
            <li><strong>Harassment:</strong> Harass, abuse, or threaten other users</li>
            <li><strong>Spam:</strong> Send unsolicited messages or advertisements</li>
            <li><strong>Malware:</strong> Upload or transmit viruses, malware, or harmful code</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">6. Intellectual Property</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">6.1 Our Intellectual Property</h3>
          <p className="mb-4 text-csfloat-light/80">
            The Service and its content, including but not limited to text, graphics, logos, software, and design, are owned by CSFloat or its licensors and are protected by intellectual property laws.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">6.2 License to Use</h3>
          <p className="mb-6 text-csfloat-light/80">
            We grant you a limited, non-exclusive, non-transferable license to use the Service for its intended purpose. You may not copy, modify, distribute, or create derivative works without our written consent.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">7. Disclaimers and Limitations</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">7.1 Service Availability</h3>
          <p className="mb-4 text-csfloat-light/80">
            The Service is provided "as is" and "as available" without warranties of any kind. We do not guarantee uninterrupted access or error-free operation.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">7.2 Market Risks</h3>
          <p className="mb-4 text-csfloat-light/80">
            Skin values can fluctuate significantly. We are not responsible for any losses due to market changes or item devaluation.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">7.3 Third-Party Services</h3>
          <p className="mb-6 text-csfloat-light/80">
            We are not responsible for the actions, content, or policies of third-party services, including Steam, payment processors, or other platforms.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">8. Limitation of Liability</h2>
          <p className="mb-6 text-csfloat-light/80">
            To the fullest extent permitted by law, CSFloat and its affiliates, officers, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or use, arising out of or related to your use of the Service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">9. Indemnification</h2>
          <p className="mb-6 text-csfloat-light/80">
            You agree to indemnify, defend, and hold harmless CSFloat and its affiliates, officers, employees, and agents from any claims, damages, liabilities, costs, or expenses (including reasonable attorneys' fees) arising from your use of the Service, violation of these Terms, or infringement of any rights of another party.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">10. Account Termination</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">10.1 Termination by You</h3>
          <p className="mb-4 text-csfloat-light/80">
            You may terminate your account at any time by contacting our support team. All outstanding obligations must be fulfilled before termination.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">10.2 Termination by Us</h3>
          <p className="mb-4 text-csfloat-light/80">
            We may suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any other reason at our sole discretion.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">10.3 Effect of Termination</h3>
          <p className="mb-6 text-csfloat-light/80">
            Upon termination, your right to use the Service will immediately cease. We may retain certain information as required by law or for legitimate business purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">11. Dispute Resolution</h2>
          
          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">11.1 Informal Resolution</h3>
          <p className="mb-4 text-csfloat-light/80">
            Before pursuing formal dispute resolution, we encourage you to contact our support team to attempt informal resolution of any issues.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">11.2 Arbitration</h3>
          <p className="mb-4 text-csfloat-light/80">
            Any disputes arising out of or relating to these Terms or the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
          </p>

          <h3 className="text-xl font-semibold mt-8 mb-4 text-csfloat-light">11.3 Class Action Waiver</h3>
          <p className="mb-6 text-csfloat-light/80">
            You agree to waive any right to participate in class actions or jury trials. All disputes must be resolved on an individual basis.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">12. Governing Law</h2>
          <p className="mb-6 text-csfloat-light/80">
            These Terms are governed by and construed in accordance with the laws of the State of California, United States, without regard to its conflict of law principles. The United Nations Convention on Contracts for the International Sale of Goods does not apply to these Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">13. Severability</h2>
          <p className="mb-6 text-csfloat-light/80">
            If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that these Terms will otherwise remain in full force and effect.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">14. Changes to Terms</h2>
          <p className="mb-6 text-csfloat-light/80">
            We may update these Terms from time to time. We will notify you of any material changes by posting the new Terms on our website and updating the "Last updated" date. Your continued use of the Service after such changes constitutes acceptance of the updated Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-6 text-white">15. Contact Information</h2>
          <p className="mb-6 text-csfloat-light/80">
            If you have any questions about these Terms, please contact us:
          </p>
          <div className="bg-csfloat-dark/30 rounded-lg p-6 mb-6">
            <p className="text-csfloat-light/80 mb-2"><strong>Email:</strong> <a href="mailto:legal@csfloat.com" className="text-csfloat-blue hover:text-blue-400">legal@csfloat.com</a></p>
            <p className="text-csfloat-light/80 mb-2"><strong>Support:</strong> <a href="mailto:support@csfloat.com" className="text-csfloat-blue hover:text-blue-400">support@csfloat.com</a></p>
            <p className="text-csfloat-light/80"><strong>Address:</strong> CSFloat Inc., 123 Gaming Street, Suite 456, Los Angeles, CA 90210</p>
          </div>

          <div className="mt-12 p-6 bg-yellow-900/20 border-l-4 border-yellow-500 rounded">
            <p className="text-yellow-300 text-sm">
              <strong>Legal Notice:</strong> These Terms of Service are provided for informational purposes and do not constitute legal advice. For specific legal concerns, please consult with a qualified attorney. The information contained herein is current as of the date listed above and may be subject to change.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default TermsOfService; 