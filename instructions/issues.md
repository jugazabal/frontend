Here’s a checklist based on the issues found on the `http://localhost:3001/blogs` page:

---

# ✅ Blog Page QA Checklist

## 🔒 Subresource Integrity
- [x] Ensure the `integrity` attribute matches the actual hash of the CDN resource.
- [x] Include `crossorigin="anonymous"` when using SRI.
- [x] Confirm CDN version matches the expected file.

## 📝 Content Management
- [x] Prevent duplicate blog entries.
- [x] Validate blog uniqueness before saving.
- [x] Provide clear labels or explanations for blog statuses (e.g., “Important”, “Regular”).

## 🔍 Filtering & Search
- [x] Add filters by keyword, date, or tags.
- [x] Ensure “Created by me” filter works correctly.
- [x] Consider adding sorting options (e.g., newest, most liked).

## ⚠️ User Actions
- [x] Add confirmation dialogs for destructive actions (e.g., delete).
- [x] Provide feedback for actions like “Save” or “Clear” (e.g., toast notifications).

## ♿ Accessibility
- [x] Add ARIA labels for interactive elements.
- [x] Ensure keyboard navigation is supported.
- [x] Use semantic HTML for better screen reader support.

## 📱 Responsiveness & Styling
- [x] Confirm Bootstrap CSS loads correctly.
- [x] Test layout across different screen sizes.
- [x] Ensure fallback styles are in place if CDN fails.

# ✅ 404 Error Fix Checklist for http://127.0.0.1:5173/blogs

## 🔍 Problem Summary
The page is showing a `404 (Not Found)` error in the DevTools Console, indicating that the requested resource `/blogs` could not be found by the server.

---

## 🛠 Checklist to Fix the Issue on http://127.0.0.1:5173/blogs

### 🧭 Server-Side Routing
- [ ] Verify that the backend server has a route defined for `/blogs`.
- [ ] If using an API, ensure the endpoint is correctly defined (e.g., `/api/blogs`).
- [ ] Confirm that the server is running and accessible at the expected port.

### 🌐 Frontend Configuration
- [ ] Check if the frontend is using client-side routing (e.g., React Router).
- [ ] Ensure the server is configured to serve `index.html` for unknown routes.
- [ ] For Vite, add fallback routing in `vite.config.js`:
  ```js
  export default defineConfig({
    server: {
      fs: {
        strict: false
      }
    },
    build: {
      rollupOptions: {
        input: '/index.html'
      }
    }
  });

