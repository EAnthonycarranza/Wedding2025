# Wedding 2025 - Full Stack Web Application

A comprehensive, guest-centric wedding platform built to provide a seamless experience for attendees. The application features a secure RSVP system, interactive travel guides for San Antonio, integrated lodging recommendations (Airbnb & Hotels), and a high-performance photo gallery with bulk download capabilities.

## 🚀 Technologies Used

### Frontend
- **React (v18)**: Core UI framework for component-based architecture.
- **Material UI (MUI)**: Primary design system used for responsive layouts, modals, and interactive elements.
- **React-Leaflet**: Open-source mapping library used to display venues, lodging, and tourist attractions.
- **JSZip & File-Saver**: Client-side libraries for zipping and downloading high-resolution gallery images.
- **React-Slick**: Carousel component for property and venue showcases.

### Backend
- **Node.js & Express**: Scalable server architecture handling API routing and security.
- **JSON Web Tokens (JWT)**: Secure authentication for family-specific RSVP access and Guest Mode.
- **MongoDB & Mongoose**: Database used for storing RSVP data and caching external API results.
- **Google Cloud Suite**:
  - **Cloud Storage (GCS)**: Hosting high-resolution gallery and asset images.
  - **Sheets API**: Real-time syncing of RSVP responses for administrative tracking.
- **Helmet & Rate-Limit**: Security middleware to protect against common web vulnerabilities and brute-force attempts.

---

## 🛠️ How the Code Was Built: Architectural Highlights

### 1. Secure Authentication Flow
The application uses a custom authentication system that differentiates between **Family Members** and **Guests**. 
- When a user logs in via a token or password, the server generates a JWT containing specific payloads like `familyName` and `familyCount`.
- **Implementation Detail**: Middlewares on the backend intercept requests to RSVP endpoints. If the JWT identifies the user as a "Guest," the server returns a `403 Forbidden` status, preventing unauthorized database writes while still allowing them to browse the travel and gallery sections.

### 2. The Travel & Lodging Engine
Originally designed to use live APIs (Airbnb & OSRM), the system was refactored into a high-fidelity "Demo Mode" to ensure performance and reliability without external dependencies.
- **Mock Data Layer**: We built a data-injection layer that mimics the exact schema of the Airbnb and Hotel APIs. This allows the UI components to remain "API-ready" while serving local data.
- **Dynamic Styling**: Components like `Airbnb.js` use conditional borders and typography (e.g., Airbnb Red vs. Hotel Blue) to maintain visual hierarchy and branding even after removing heavy image assets.

### 3. Server-Side Image Proxying
One of the most complex modules is the bulk photo download feature.
- **The Process**: The frontend fetches multiple high-resolution images from Google Cloud Storage, processes them through `JSZip`, and triggers a download.
- **The Proxy**: To avoid CORS issues, we implemented a custom proxy endpoint (`/api/proxy-image`). The server uses `axios` with a `responseType: 'stream'` to pipe data directly from GCS to the client, acting as a secure bridge that satisfies browser security policies.

---

## 🧩 Challenges & Solutions

### Challenge: CORS Restrictions on Bulk Downloads
**Problem**: When trying to fetch images from the Google Cloud Storage bucket to create a `.zip` file, the browser blocked the requests because the `Access-Control-Allow-Origin` header was missing from the GCS response.
**Solution**: Built a backend proxy. Instead of the browser asking GCS for the image, it asks our Express server. The server (which is not restricted by CORS) fetches the image and "streams" it back to the React frontend. This allowed us to successfully gather all binary data into a single zip file.

### Challenge: Visual Fidelity Without Assets
**Problem**: Moving to a demo version meant removing many specific listing images to keep the application lightweight and avoid broken links.
**Solution**: We transitioned the design language from **Image-Centric** to **Typography-Centric**. We used MUI `Cards` with distinct `border-left` accents, added `InfoIcons` for travel data, and utilized modern CSS gradients (`linear-gradient`) to ensure the pages looked polished and "full" without needing dozens of external photos.

### Challenge: Managing Asynchronous Progress
**Problem**: Downloading 20+ high-resolution photos (totaling ~200MB) takes time. Without feedback, users thought the "Download All" button was broken.
**Solution**: We implemented a `Backdrop` state machine.
- `downloading`: A boolean that triggers a full-screen blurred overlay.
- `downloadProgress`: An integer that updates after each successful `fetch`.
- **Result**: The user sees a real-time counter (e.g., "Downloading 5 of 21...") which provides immediate visual confirmation of the background process.

---

## 📦 Deployment
The application is optimized for **Heroku**.
- **Build Process**: Uses a `heroku-postbuild` script to navigate into the `/client` directory, install dependencies, and run `npm run build`.
- **Static Serving**: The Express server handles the final React build through `express.static`, ensuring a single unified URL for both the API and the UI.
