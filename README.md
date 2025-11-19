# G03 - Email Dashboard with Authentication

A React single-page application demonstrating secure authentication using email/password and Google OAuth, with a polished email dashboard UI.

## Features

- **Email/Password Authentication**: Secure login with form validation
- **Google OAuth Sign-In**: Redirect-based OAuth 2.0 flow
- **Token Management**: Automatic access token refresh at 80% lifetime
- **Email Dashboard**: Three-column layout (folders, email list, email detail)
- **Mock API Services**: Realistic simulation with 200-500ms delays
- **Protected Routes**: Client-side route protection
- **Responsive UI**: Built with React 19, TypeScript 5, and Tailwind CSS

## Technology Stack

- **Frontend Framework**: React 19.2.0
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.2
- **Routing**: React Router DOM 7.9.6
- **State Management**: TanStack Query 5.90.10
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS 4.1.17
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios 1.13.2

## Setup and Run Instructions

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd hcmus-awad-g03
```

2. Install dependencies:
```bash
npm install
```

3. Create environment configuration:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# API Configuration (mock service)
VITE_API_BASE_URL=http://localhost:5173/api

# Token Configuration
VITE_ACCESS_TOKEN_LIFETIME=900000  # 15 minutes in milliseconds
VITE_REFRESH_THRESHOLD=0.8         # Refresh at 80% of lifetime
```

### Running Locally

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Public Hosting URL

**Live Demo**: [https://your-vercel-deployment-url.vercel.app](https://your-vercel-deployment-url.vercel.app)

### Reproducing Deployment Locally

This application can be deployed to any static hosting provider. For Vercel:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
npm run build
vercel --prod
```

3. Set environment variables in Vercel dashboard:
   - Navigate to Project Settings > Environment Variables
   - Add all variables from `.env.example`
   - Update `VITE_GOOGLE_REDIRECT_URI` to match your production URL

### Alternative Hosting Providers

**Netlify**:
```bash
npm run build
# Drag and drop the 'dist' folder to Netlify
```

**GitHub Pages**:
```bash
# Update vite.config.ts with base: '/repository-name/'
npm run build
# Deploy the 'dist' folder to gh-pages branch
```

## Token Storage and Security Considerations

### Storage Strategy

This application implements a **split token storage strategy** balancing security and usability:

#### Access Token (In-Memory Storage)
- **Storage**: React state (memory only, never persisted)
- **Lifetime**: 15 minutes
- **Rationale**:
  - Prevents XSS attacks from stealing long-lived tokens
  - Lost on page refresh, triggering automatic refresh flow
  - Minimal exposure window if compromised

#### Refresh Token (LocalStorage)
- **Storage**: `localStorage` with key `refresh_token`
- **Lifetime**: Longer-lived (typically 7-30 days, controlled by backend)
- **Rationale**:
  - Enables session persistence across page refreshes
  - Allows automatic access token renewal
  - Trade-off: More vulnerable to XSS, but cannot directly access resources

### Security Measures

1. **Automatic Token Refresh**:
   - Access tokens refresh at 80% of lifetime (12 minutes)
   - Reduces window of vulnerability
   - Graceful handling of expired tokens

2. **XSS Protection**:
   - No inline scripts in HTML
   - Content Security Policy headers (configure in hosting provider)
   - Sanitized user inputs via React's default escaping
   - Zod schema validation on all forms

3. **CSRF Protection**:
   - SameSite cookie attribute (when using real backend)
   - State parameter in OAuth flow (to be implemented with real OAuth)

4. **Token Transmission**:
   - HTTPS only in production (configure in hosting provider)
   - Bearer token in Authorization header
   - No tokens in URL parameters

### Known Limitations (Demo Mode)

Since this is a **demonstration application with mock services**:

1. **No HTTPOnly Cookies**: Real production apps should store refresh tokens in HTTPOnly cookies (requires backend)
2. **Client-Side Validation Only**: Actual validation must occur on backend
3. **Mock OAuth Flow**: Real Google OAuth requires backend token exchange
4. **No Token Rotation**: Production apps should rotate refresh tokens
5. **LocalStorage XSS Risk**: In a real app, consider:
   - Using HTTPOnly cookies (requires backend)
   - Implementing sub-resource integrity checks
   - Adding Content Security Policy headers

### Production Security Recommendations

When moving to production with a real backend:

1. **Store refresh tokens in HTTPOnly cookies** (not localStorage)
2. **Implement token rotation** on each refresh
3. **Add CSRF tokens** for state-changing operations
4. **Enable Content Security Policy** headers
5. **Use short-lived access tokens** (5-15 minutes)
6. **Implement rate limiting** on authentication endpoints
7. **Add multi-factor authentication** (MFA)
8. **Log security events** (failed logins, token refresh failures)
9. **Use secure session management** libraries
10. **Regular security audits** and dependency updates

## Third-Party Services Used

### Google OAuth Client

- **Service**: Google Identity Services (OAuth 2.0)
- **Purpose**: Alternative authentication method via Google accounts
- **Configuration**: Requires Google Cloud Console project setup
- **Setup Instructions**:
  1. Visit [Google Cloud Console](https://console.cloud.google.com)
  2. Create a new project or select existing
  3. Navigate to "APIs & Services" > "Credentials"
  4. Click "Create Credentials" > "OAuth 2.0 Client ID"
  5. Configure OAuth consent screen
  6. Add authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (development)
     - `https://your-domain.com/auth/callback` (production)
  7. Copy Client ID to `VITE_GOOGLE_CLIENT_ID` environment variable
- **Documentation**: [Google Identity Platform](https://developers.google.com/identity/protocols/oauth2)

### Hosting Provider

**Recommended**: Vercel (optimized for Vite applications)

- **Free Tier**: Sufficient for demonstration/testing
- **Features**:
  - Automatic HTTPS
  - CDN distribution
  - Environment variable management
  - Preview deployments for pull requests
- **Setup**: Connect GitHub repository, configure build settings
- **Alternative Options**:
  - Netlify (similar features, generous free tier)
  - GitHub Pages (free, but requires manual deployment)
  - Cloudflare Pages (fast global CDN)

### Development Services

- **Mock API**: Built-in mock service layer (no external dependency)
- **No Database**: All data is in-memory (resets on refresh)
- **No Backend**: Purely client-side demonstration

## Project Structure

```
hcmus-awad-g03/
├── src/
│   ├── features/
│   │   ├── auth/           # Authentication feature
│   │   │   ├── components/ # Login forms, OAuth button
│   │   │   ├── context/    # Auth context & token management
│   │   │   ├── pages/      # OAuth callback page
│   │   │   └── types/      # Auth TypeScript types
│   │   └── dashboard/      # Email dashboard feature
│   │       ├── components/ # Dashboard layout, email list, etc.
│   │       └── types/      # Email TypeScript types
│   ├── components/         # Shared UI components
│   │   ├── ui/             # Radix UI primitives
│   │   └── ProtectedRoute  # Route protection
│   ├── lib/                # Utilities & API client
│   ├── services/           # Mock API services
│   ├── types/              # Shared TypeScript types
│   ├── App.tsx             # Root component
│   ├── router.tsx          # Route configuration
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── specs/                  # Feature specifications
├── .env.example            # Environment template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # Tailwind CSS configuration
```

## Available Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run tests (configure test framework as needed)

## Mock Authentication Credentials

For testing the email/password login (mock service):

- **Email**: Any valid email format (e.g., `user@example.com`)
- **Password**: Any non-empty string (e.g., `password123`)

The mock service accepts all credentials for demonstration purposes.

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari 14+
- No IE11 support (modern browsers only)

## Contributing

This is an academic project for HCMUS Advanced Web Application Development course.

## License

Academic project - All rights reserved.

---

**Course**: Advanced Web Application Development
**Institution**: Ho Chi Minh University of Science (HCMUS)
**Group**: G03
