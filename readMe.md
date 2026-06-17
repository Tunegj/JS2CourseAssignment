JS2 Course Assignment - Social App
A Single Page Application built with **VITE** & **Vanilla JS** using the Noroff Social API.

This app allows users to register, log in, create posts, edit/delete their own posts, view profiles, and follow/unfollow other users.

## LIVE SITE:

https://tunegj.github.io/JS2CourseAssignment

## Tech Stack

- Vite
- Vanilla JS (ES6 Modules)
- Noroff API v2
- Bootstrap (via npm) + Sass
- Github Pages
- Modular architecture
- Hash based Routing

---

## Features:

### Authentication

- Register with a stud.noroff.no email
- Login
- Logout
- Token + API key stored securely in LocalStorage
- Route guardds (auth & guest)

---

### Feed

- Fetch and display posts
- Search posts
- View single post
- Navigate to author profile

---

### Posts

- Create post
- Edit own post
- Delete own post
- Protected owner-only actions

---

### Profiles

- View own profile
- VIew other user profiles
- Follow/unfollow users
- Edit profile
- Create post

---

## UI, UX & Accessibility

- Responsive layout (mobile, tablet, desktop)
- Bootstrap components and utility classes
- Consistent spacing and layout systems
- Accessible form validation
- ARIA attributes for dynamic content and errors
- Keyboard navigation support
- FOcus-visible states
- defensive Url validation for imgs

---

## Architecture

src/
api/
handlers/
utils/
router.js
main.js

- Modular structure
- Separation of concerns (API, handlers, utils)
- Hash based routing for SPA behavior

## INSTALLATION

1. Clone the git repository:

- https://tunegj.github.io/JS2CourseAssignment

2. install dependencies:

- npm install

3. Run developer server:

- npm run dev

4. Run Sass watcher:

- npm run dev:sass

5. Build for production:

- npm run build
- npm run build:sass

## DEPLOYMENT

The site is deployed using **Github Pages** & **Github Actions**

- Vite.config.js configured with correct base path
- Workflow builds project and deploys

## TESTING

The following flows were tested:

- Registration
- Login/Logout
- Create/Edit/Delete post
- Follow/Unfollow
- Profile editing
- Route guards
- Refresh behavior when logged in/out
- Github Pages production build

## AI USE

AI (ChatGPT) was used for:

- debugging assistance
- Worflow configuration guidance
- Architecture review and refactoring suggestions

See `AI_LOG.md` for detailed usage information

---
