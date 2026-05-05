// src/pages/TermsOfService.js
import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
          <div className="w-16 h-0.5 bg-red-500 mt-2 rounded-full"></div>
          <p className="text-gray-400 text-sm mt-2">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-gray-300">
          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed">
              By accessing and using ROG TV SERIES ("the Platform"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, please do not use our services.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">2. User Accounts</h2>
            <p className="text-sm leading-relaxed mb-3">
              To access certain features of the Platform, you may be required to create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">3. Content Usage</h2>
            <p className="text-sm leading-relaxed mb-3">
              All content on the Platform, including TV series, images, and videos, is protected by copyright laws.
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Content is for personal, non-commercial use only</li>
              <li>You may not download, copy, or redistribute content without permission</li>
              <li>Streaming quality may vary based on your internet connection</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">4. Prohibited Activities</h2>
            <p className="text-sm leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-sm space-y-1 ml-4">
              <li>Use the Platform for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Platform's functionality</li>
              <li>Share your account credentials with others</li>
            </ul>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">5. Termination</h2>
            <p className="text-sm leading-relaxed">
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, 
              for conduct that violates these Terms or is harmful to other users or the Platform.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">6. Changes to Terms</h2>
            <p className="text-sm leading-relaxed">
              We may modify these Terms at any time. Continued use of the Platform after changes constitutes 
              acceptance of the modified Terms.
            </p>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-white/5">
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact Us</h2>
            <p className="text-sm leading-relaxed">
              If you have any questions about these Terms, please contact us at:
              <br />
              <span className="text-red-500">support@rogtvseries.com</span>
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

export default TermsOfService;