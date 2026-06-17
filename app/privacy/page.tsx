import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — AI Chat Assistant",
  description: "How AI Chat Assistant collects, uses, and shares your information.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="June 17, 2026">
      <p>
        This Privacy Policy explains what information AI Chat Assistant (the
        &ldquo;Service&rdquo;) collects, how we use it, and who we share it with. By
        using the Service, you agree to the practices described here.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Account information</h3>
      <p>
        When you sign in with Google (via Firebase Authentication), we receive basic
        profile information such as your name, email address, and profile photo, plus a
        unique account identifier.
      </p>
      <h3>Chat content</h3>
      <p>
        We store the conversations you create &mdash; your messages and the AI-generated
        responses &mdash; so your chat history is available across sessions.
      </p>
      <h3>Uploaded files</h3>
      <p>
        When you attach a document or image, its contents are sent to the AI provider to
        generate a response. The file bytes are <strong>not stored</strong> by the
        Service; only your message text (and a note of the file name) is saved with the
        conversation.
      </p>
      <h3>Technical information</h3>
      <p>
        Like most web applications, our hosting and infrastructure providers may process
        limited technical data (such as IP address and basic device/browser information)
        to operate the Service securely and reliably.
      </p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To authenticate you and provide access to the Service;</li>
        <li>To generate AI responses to your messages and attachments;</li>
        <li>To store and display your chat history;</li>
        <li>To maintain, secure, and improve the Service; and</li>
        <li>To comply with legal obligations.</li>
      </ul>

      <h2>3. AI processing and third-party providers</h2>
      <p>
        To produce responses, your messages and any attachments are transmitted to
        third-party AI model providers &mdash; Anthropic (Claude) and, where configured,
        OpenAI and Groq. These providers process the content to return a response and
        handle it under their own privacy and data-use policies. We also use Google
        Firebase for authentication and for storing your chat data. We do{" "}
        <strong>not</strong> sell your personal information.
      </p>

      <h2>4. Data storage and security</h2>
      <p>
        Your account and chat data are stored in Google Firestore. We rely on industry-
        standard safeguards provided by our infrastructure partners, but no method of
        transmission or storage is completely secure, and we cannot guarantee absolute
        security.
      </p>

      <h2>5. Data retention</h2>
      <p>
        We retain your chats until you delete them or your account is removed. You can
        delete individual conversations at any time from within the app, which removes
        them from our storage.
      </p>

      <h2>6. Your choices and rights</h2>
      <ul>
        <li>
          <strong>Access &amp; deletion:</strong> You can view your chats in the app and
          delete any of them at any time.
        </li>
        <li>
          <strong>Account removal:</strong> To delete your account and associated data,
          contact us using the details below.
        </li>
        <li>
          Depending on where you live, you may have additional rights (such as access,
          correction, or deletion) under applicable privacy laws.
        </li>
      </ul>

      <h2>7. Children&rsquo;s privacy</h2>
      <p>
        The Service is not directed to children under 13, and we do not knowingly collect
        personal information from them. If you believe a child has provided us
        information, contact us so we can remove it.
      </p>

      <h2>8. International users</h2>
      <p>
        Your information may be processed in countries other than your own, including by
        our AI and infrastructure providers, where data-protection laws may differ. By
        using the Service, you consent to such processing.
      </p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be
        reflected by updating the &ldquo;Last updated&rdquo; date above. Please review
        this page periodically.
      </p>

      <h2>10. Contact</h2>
      <p>
        Questions or requests regarding your data? Contact us at{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalPage>
  );
}
