import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-backgroundLight py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy for PromptLingo</h1>
        <p className="text-sm text-gray-600 mb-8">Effective Date: December 5, 2025</p>

        <div className="prose prose-lg max-w-none">
          <p className="text-gray-700 leading-relaxed">
            This Privacy Policy describes how PromptLingo ("we," "us," or "our") collects, uses, and shares your personal information when you use our website, services, and applications (collectively, the "Service"). We are committed to protecting your privacy and ensuring that your personal data is handled in a safe and responsible manner.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            This policy is designed to comply with the General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA).
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">1. Data We Collect</h2>
          <p className="text-gray-700 leading-relaxed">
            We collect information to provide and improve our Service. The types of data we collect are:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li><strong>Personal Information:</strong> When you sign up for our Service using Google OAuth, we collect your name and email address.</li>
            <li><strong>Translation Data:</strong> We temporarily process the text you submit for translation. This data is not stored long-term unless you choose to save it.</li>
            <li><strong>Payment Information:</strong> When you subscribe to a paid plan, your payment information is processed by Stripe. We do not store your credit card numbers on our servers. We do receive information about your subscription status from Stripe.</li>
            <li><strong>Usage Metrics:</strong> We collect data about your usage of the Service, such as the number of translations you perform and timestamps of your activity.</li>
            <li><strong>Cookies and Similar Technologies:</strong> We use cookies to authenticate you, remember your preferences, and for analytics. We use JSON Web Tokens (JWT) for authentication.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">2. How We Use Your Data</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>To Provide and Maintain the Service:</strong> We use your personal information to create and manage your account, and we use your translation data to provide the translation service.</li>
            <li><strong>To Improve the Service:</strong> We analyze usage metrics to understand how our users interact with our Service.</li>
            <li><strong>To Process Payments:</strong> We use Stripe to process payments for our subscription plans.</li>
            <li><strong>To Communicate with You:</strong> We may use your email address to send you service-related announcements, updates, and promotional offers.</li>
            <li><strong>For Security and Compliance:</strong> We use your data to protect the security of our Service and to comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed">We use the following third-party services to provide our Service:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li><strong>Google OAuth:</strong> For user authentication</li>
            <li><strong>Stripe:</strong> For payment processing</li>
            <li><strong>OpenAI:</strong> To provide AI-powered translation and tone enhancement</li>
            <li><strong>ElevenLabs:</strong> To provide text-to-speech synthesis</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">4. Data Retention</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Translation Data:</strong> Automatically deleted after 30 days, unless you save it.</li>
            <li><strong>Payment Records:</strong> Retained for 7 years to comply with tax laws.</li>
            <li><strong>Account Information:</strong> Retained for as long as your account is active.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed">
            We are committed to ensuring you have control over your personal data. Depending on your location, you may have the following rights:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">GDPR Rights (for users in the European Economic Area)</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
            <li><strong>Right to Rectification:</strong> Have any inaccurate or incomplete personal data corrected.</li>
            <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request that we delete your personal data.</li>
            <li><strong>Right to Data Portability:</strong> Receive your personal data in a structured, commonly used format.</li>
            <li><strong>Right to Restrict Processing:</strong> Request that we restrict the processing of your personal data.</li>
            <li><strong>Right to Object:</strong> Object to the processing of your personal data.</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">CCPA Rights (for users in California)</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Right to Know:</strong> Know what personal information we collect, use, and disclose.</li>
            <li><strong>Right to Delete:</strong> Request the deletion of your personal information.</li>
            <li><strong>Right to Opt-Out:</strong> We do not sell your personal information.</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise any of these rights, please contact us at <a href="mailto:privacy@promptlingo.com" className="text-primary-skyBlue hover:underline">privacy@promptlingo.com</a>.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">6. Cookie Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We use cookies and similar technologies to provide and improve our Service. We use the following types of cookies:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li><strong>Strictly Necessary Cookies:</strong> Essential for authentication (JWT tokens).</li>
            <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service.</li>
            <li><strong>Preferences Cookies:</strong> Remember your settings and preferences.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">7. Data Security</h2>
          <p className="text-gray-700 leading-relaxed">
            We have implemented appropriate technical and organizational measures to protect your personal data:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mt-3">
            <li><strong>Encryption:</strong> We use encryption to protect your data in transit (TLS/SSL) and at rest.</li>
            <li><strong>Access Controls:</strong> We limit access to your personal data to authorized personnel only.</li>
            <li><strong>Regular Security Audits:</strong> We regularly review our security practices.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">8. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service is hosted in the United States. If you are accessing the Service from outside the United States, your information will be transferred to, stored, and processed in the United States. We take steps to ensure that your data is protected in accordance with this Privacy Policy and applicable laws.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">9. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service is not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">10. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Effective Date" at the top.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">11. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed">
            If you have any questions about this Privacy Policy or our data practices, please contact us at <a href="mailto:privacy@promptlingo.com" className="text-primary-skyBlue hover:underline">privacy@promptlingo.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
