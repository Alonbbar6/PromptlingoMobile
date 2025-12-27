import React from 'react';

const RefundPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-backgroundLight py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy for PromptLingo</h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: December 5, 2025</p>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed">
            This Refund Policy outlines the terms and conditions for refunds for PromptLingo's subscription services. We want to ensure a transparent and fair refund process for our users.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Refund Window</h2>
          <p className="text-gray-700 leading-relaxed">
            We offer a <strong>14-day refund window</strong> for new subscribers. If you are not satisfied with our service, you can request a full refund within 14 days of your initial purchase. This applies to your first subscription with us only.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How to Request a Refund</h2>
          <p className="text-gray-700 leading-relaxed">
            To request a refund, please email our support team at <a href="mailto:support@promptlingo.com" className="text-primary-skyBlue hover:underline">support@promptlingo.com</a>. Please include the email address associated with your account and the reason for your refund request. Refunds will be processed within <strong>5-7 business days</strong>, and the funds will be returned to your original payment method.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. No-Refund Scenarios</h2>
          <p className="text-gray-700 leading-relaxed">
            We reserve the right to deny refund requests in the following scenarios:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li><strong>Service Abuse:</strong> If we find evidence of abuse of our services, such as excessive use beyond the intended purpose of the plan, we may deny the refund request.</li>
            <li><strong>Violation of Terms of Service:</strong> If you have violated our Terms of Service, you will not be eligible for a refund.</li>
            <li><strong>After the Refund Window:</strong> Refund requests made after the 14-day refund window will not be honored.</li>
            <li><strong>Free Trial Conversions:</strong> If you have used the service beyond a certain threshold after converting from a free trial, you may not be eligible for a refund.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Pro-rated Refunds for Annual Plans</h2>
          <p className="text-gray-700 leading-relaxed">
            For annual subscription plans, we may offer a pro-rated refund if you decide to cancel your subscription before the end of the term. The pro-rated refund will be calculated based on the number of unused months remaining in your subscription. Please contact our support team to inquire about pro-rated refunds.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Chargebacks</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
            <p className="text-yellow-800">
              <strong>Important:</strong> If you initiate a chargeback with your credit card company for a payment you made to us, your account will be immediately suspended. We encourage you to contact our support team to resolve any payment issues before initiating a chargeback. Fraudulent chargeback claims will be disputed, and you may be permanently banned from using our service.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about our Refund Policy, please contact us at <a href="mailto:support@promptlingo.com" className="text-primary-skyBlue hover:underline">support@promptlingo.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;
