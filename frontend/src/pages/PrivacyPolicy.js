// src/pages/PrivacyPolicy.js
import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black pt-24 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-400 hover:text-red-500 text-sm mb-6 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">Privacy Policy</h1>
          <div className="w-16 h-0.5 bg-red-500 mt-2 rounded-full"></div>
          <p className="text-gray-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-300">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="text-sm leading-relaxed mb-3">
              When you use ROG TV SERIES ("the Platform"), we may collect the following information:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li><span className="text-white">Personal Information:</span> Name, email address, username</li>
              <li><span className="text-white">Usage Data:</span> Watch history, preferences, and interactions</li>
              <li><span className="text-white">Technical Data:</span> IP address, browser type, device information</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="text-sm leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Provide and maintain our services</li>
              <li>Personalize your viewing experience</li>
              <li>Improve and optimize the Platform</li>
              <li>Communicate with you about updates and promotions</li>
              <li>Protect against fraud and unauthorized access</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p className="text-sm leading-relaxed">
              We implement industry-standard security measures to protect your personal information. 
              However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">4. Cookies and Tracking</h2>
            <p className="text-sm leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, analyze usage, 
              and deliver personalized content. You can control cookie settings through your browser.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p className="text-sm leading-relaxed mb-3">
              We may use third-party services for:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Video hosting and streaming (Bunny CDN)</li>
              <li>Analytics and performance monitoring</li>
              <li>Authentication and security</li>
            </ul>
            <p className="text-sm leading-relaxed mt-3">
              These services have their own privacy policies and data handling practices.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
            <p className="text-sm leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Access your personal information</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">7. Children's Privacy</h2>
            <p className="text-sm leading-relaxed">
              Our services are not directed to children under 13. We do not knowingly collect personal information 
              from children under 13. If you believe we have collected such information, please contact us.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
              the new policy on this page and updating the "Last updated" date.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">9. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
              <br />
              <span className="text-red-500">privacy@rogtvseries.com</span>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>© {new Date().getFullYear()} ROG TV SERIES. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;