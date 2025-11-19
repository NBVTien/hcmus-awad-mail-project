# Email Dashboard - Authentication & Token Storage

## Token Storage Strategy

This demonstration application uses a specific token storage approach for educational purposes.

### Current Implementation

**Refresh Token: localStorage**
- Stored in browser's localStorage
- Persists across browser sessions
- Allows users to remain logged in after closing the browser
- Accessible via JavaScript

**Access Token: In-Memory**
- Stored in React component state (AuthContext)
- Cleared when browser tab is closed
- Short-lived (15 minutes)
- Not accessible to other tabs

### Why This Approach?

This implementation prioritizes:
1. **User Experience**: Users don't need to re-login every time they open the app
2. **Demo Simplicity**: No backend cookie management or CORS configuration required
3. **Cross-tab Sync**: Multiple tabs can share the same refresh token

### Security Considerations

⚠️ **This approach is acceptable for demonstrations but NOT recommended for production applications.**

**Risks of localStorage for Refresh Tokens:**
- **XSS Vulnerability**: localStorage is accessible to JavaScript, making it vulnerable to Cross-Site Scripting (XSS) attacks
- **Token Theft**: If malicious scripts execute in the application context, they can steal the refresh token
- **No HTTP-only Protection**: Unlike httpOnly cookies, localStorage provides no built-in XSS protection

### Production Alternative

For production applications, use **httpOnly cookies with SameSite=Strict** attribute:

```http
Set-Cookie: refresh_token=abc123; HttpOnly; Secure; SameSite=Strict; Max-Age=604800
```

**Benefits:**
- **XSS Protection**: Cookies with HttpOnly flag are NOT accessible to JavaScript
- **CSRF Protection**: SameSite=Strict prevents cross-site request forgery attacks
- **Automatic Handling**: Browser automatically sends cookies with requests
- **Secure Transmission**: Secure flag ensures cookies are only sent over HTTPS

**Implementation Requirements:**
- Backend server must set and manage cookies
- CORS configuration for cookie-based auth
- Backend endpoint for token refresh
- Proper SSL/TLS configuration

### Additional Security Measures in This Demo

Even with localStorage, this demo implements several security best practices:

1. **Short Access Token Lifetime**: 15 minutes (reduces window of exploitation)
2. **Automatic Token Refresh**: Tokens refresh at 80% lifetime (12 minutes)
3. **Token Rotation**: New access token generated on each refresh
4. **In-Memory Access Tokens**: Access tokens never touch localStorage
5. **HTTPS Recommended**: Always use HTTPS in production to prevent token interception

### Recommended Reading

- [OWASP Token Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [OAuth 2.0 for Browser-Based Apps](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)

## Quick Start

See the main project README for installation and setup instructions.
