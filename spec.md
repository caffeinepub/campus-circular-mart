# Specification

## Summary
**Goal:** Build Campus Circular Mart, a college second-hand marketplace where authenticated students can post, browse, and manage listings for items like textbooks, electronics, clothing, and more.

**Planned changes:**
- Implement Internet Identity authentication; unauthenticated users can browse but are prompted to log in when posting or contacting sellers
- Backend Motoko actor with a listing data model (title, description, price, category, imageId, seller principal, display name, timestamp) and CRUD operations with ownership-enforced deletion
- Browse/Home page with a responsive card grid, real-time search bar, and category filter chips (All, Textbooks, Electronics, Clothing, Furniture, Stationery, Other)
- Post Listing form page (authenticated only) with fields for title, description, price, category, and photo upload, with validation
- Listing Detail page showing full listing info and a Contact Seller button that reveals seller details for authenticated users
- My Listings page (authenticated only) showing the user's own listings with delete functionality
- Responsive Navbar with logo, navigation links (Browse, Post a Listing, My Listings), login/logout button, and hamburger menu on mobile
- Warm campus-friendly theme: campus green primary color, cream/tan backgrounds, rounded cards with subtle shadows, distinct category badge colors

**User-visible outcome:** Students can browse second-hand campus listings without logging in, and after authenticating via Internet Identity they can post new listings with photos, view full listing details and contact sellers, and manage or delete their own listings — all within a clean, mobile-responsive campus marketplace UI.
