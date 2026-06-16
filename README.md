# AI Chat Assistant

A modern, ChatGPT-style AI chat app built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Firebase Auth + Firestore**, and the **Anthropic Claude API**. Dark-mode-first glassmorphism UI, animated gradient background, Framer Motion animations, Markdown rendering, and a clean provider architecture so OpenAI can be added later.

![stack](https://img.shields.io/badge/Next.js-14-black) ![ts](https://img.shields.io/badge/TypeScript-5-blue) ![claude](https://img.shields.io/badge/Claude-Opus%204.8-7c3aed)

---

## ✨ Features

- 🔐 Google sign-in (Firebase Auth) + protected `/chat` route
- 💬 Create / select / delete conversations, stored in Firestore
- 🧠 AI responses from Anthropic **Claude** (`claude-opus-4-8`)
- 🏷️ Auto-generated chat titles from the first message
- 📜 Previous chat history in a collapsible sidebar (mobile-responsive)
- 📝 Markdown rendering + copy button on assistant messages
- ⌨️ Enter to send, Shift+Enter for newline, disabled-while-loading
- 🎬 Smooth Framer Motion animations + typing indicator + auto-scroll
- 🔌 Provider-based AI layer — drop in OpenAI later with one file
- 🔒 `ANTHROPIC_API_KEY` is **server-only** (never sent to the browser)

---

## 🗂️ Project Structure

```
ai-chat-assistant/
├── app/
│   ├── layout.tsx              # Root layout, AuthProvider + Toaster
│   ├── page.tsx                # Redirects to /chat or /login
│   ├── globals.css             # Tailwind + glassmorphism + animations
│   ├── login/page.tsx          # Google sign-in page
│   ├── chat/page.tsx           # Protected chat page (orchestrator)
│   └── api/chat/route.ts       # POST → Claude (server-side)
├── components/
│   ├── auth/ProtectedRoute.tsx
│   ├── chat/ChatSidebar.tsx
│   ├── chat/ChatWindow.tsx
│   ├── chat/ChatInput.tsx
│   ├── chat/MessageBubble.tsx
│   ├── chat/TypingIndicator.tsx
│   ├── chat/EmptyChatState.tsx
│   └── ui/Button.tsx
├── context/AuthContext.tsx     # Auth state provider
├── lib/
│   ├── firebase.ts             # Firebase init (client)
│   ├── auth.ts                 # signIn / logout / onAuthChange
│   ├── firestore.ts            # Chat + message CRUD
│   └── ai/
│       ├── provider.ts         # generateAIResponse({ messages, provider })
│       └── claude.ts           # Claude adapter (model + max_tokens here)
├── types/chat.ts
├── firestore.rules
└── .env.local.example
```

---

## 1. Install dependencies

```bash
npm install
```

This installs everything in `package.json`, including:

```bash
npm install firebase @anthropic-ai/sdk framer-motion lucide-react react-markdown remark-gfm sonner
```

> Uses **Sonner** for toasts (swap for `react-hot-toast` if you prefer).

---

## 2. Firebase setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. **Authentication** → **Get started** → **Sign-in method** → enable **Google** → save.
3. **Firestore Database** → **Create database** → start in **production mode**.
4. **Project Settings** (gear icon) → **Your apps** → **Web app** (`</>`) → register the app and copy the `firebaseConfig` values.
5. Paste those values into `.env.local` (see step 4 below).
6. **Firestore → Rules** → paste the contents of [`firestore.rules`](firestore.rules) → **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/chats/{chatId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
         match /messages/{messageId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
       }
     }
   }
   ```

7. **Authentication → Settings → Authorized domains**: add `localhost` (already there) and your Vercel domain after deploying.

---

## 3. Anthropic API key setup

1. Sign in at [console.anthropic.com](https://console.anthropic.com/).
2. **Settings → API Keys → Create Key**.
3. Copy the key (starts with `sk-ant-…`) into `ANTHROPIC_API_KEY` in `.env.local`.

The key is read **only** inside `app/api/chat/route.ts` → `lib/ai/claude.ts` on the server. It is never exposed to the client (no `NEXT_PUBLIC_` prefix).

---

## 4. Environment variables

Copy the example and fill it in:

```bash
cp .env.local.example .env.local
```

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

ANTHROPIC_API_KEY=sk-ant-...
AI_PROVIDER=claude
```

---

## 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`, sign in with Google, then land on `/chat`.

---

## 6. Deploy to Vercel

1. Push the repo to GitHub.
2. [vercel.com](https://vercel.com/) → **New Project** → import the repo (framework auto-detects **Next.js**).
3. **Settings → Environment Variables** → add all 6 `NEXT_PUBLIC_FIREBASE_*` vars **and** `ANTHROPIC_API_KEY` + `AI_PROVIDER`.
4. **Deploy**.
5. Back in Firebase → **Authentication → Settings → Authorized domains** → add your `*.vercel.app` domain.

---

## 🔌 Adding OpenAI later

The AI layer is provider-agnostic. To add OpenAI:

1. `lib/ai/openai.ts` → export `generateOpenAIResponse(messages)`.
2. In `lib/ai/provider.ts`, add `"openai"` to the `AIProvider` union and a `case "openai":` branch.
3. Set `AI_PROVIDER=openai` (and add `OPENAI_API_KEY`).

No UI or API-route changes needed — everything goes through `generateAIResponse({ messages, provider })`.

---

## 🛠️ Common errors & fixes

| Error | Cause | Fix |
|---|---|---|
| `auth/unauthorized-domain` | Domain not whitelisted | Add the domain under Firebase → Auth → Settings → Authorized domains |
| `auth/popup-blocked` | Browser blocked the popup | Allow popups, or retry the click |
| `Missing or insufficient permissions` | Firestore rules not published / signed out | Publish `firestore.rules`; ensure the user is signed in |
| `Server is missing ANTHROPIC_API_KEY` | Env var not set | Add `ANTHROPIC_API_KEY` to `.env.local` (restart dev server) |
| `401 authentication_error` from Claude | Invalid/expired key | Regenerate the key in the Anthropic console |
| `404 not_found_error` (model) | Wrong model id | Keep `CLAUDE_MODEL = "claude-opus-4-8"` in `lib/ai/claude.ts` |
| Env vars `undefined` after editing | Next caches env at boot | Stop and restart `npm run dev` |
| Firebase `app/duplicate-app` | Re-init on HMR | Already handled via `getApps()` in `lib/firebase.ts` |
| Google avatar not loading | Remote host not allowed | Already allowed in `next.config.mjs` (`lh3.googleusercontent.com`) |

---

## 🔒 Security notes

- `ANTHROPIC_API_KEY` is used **only** server-side in the API route — never in client components.
- Firebase web config is public by design; user data is protected by the Firestore rules (only the owner can read/write their chats).
- All AI calls go through `/api/chat`, so the model and key stay on the server.
