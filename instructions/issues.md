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
- [ ] Add confirmation dialogs for destructive actions (e.g., delete).
- [ ] Provide feedback for actions like “Save” or “Clear” (e.g., toast notifications).

## ♿ Accessibility
- [ ] Add ARIA labels for interactive elements.
- [ ] Ensure keyboard navigation is supported.
- [ ] Use semantic HTML for better screen reader support.

## 📱 Responsiveness & Styling
- [ ] Confirm Bootstrap CSS loads correctly.
- [ ] Test layout across different screen sizes.
- [ ] Ensure fallback styles are in place if CDN fails.

---

Would you like this checklist exported to a file or integrated into a project management tool like Jira or Trello?