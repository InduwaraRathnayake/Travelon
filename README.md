# Travelon Web App

Travelon is a comprehensive event management platform designed for small event organizers and creators. It provides an intuitive web-based dashboard that connects seamlessly with a mobile app, enabling organizers to manage events while reaching travelers and local audiences.

## 🎬 Demo

[![Travelon Demo Video](https://img.shields.io/badge/▶️-Watch%20Demo%20Video-red?style=for-the-badge)](https://dms.uom.lk/s/Qy8rXe6E2qXXMaY)

**Watch the full demo:** [https://dms.uom.lk/s/Qy8rXe6E2qXXMaY](https://dms.uom.lk/s/Qy8rXe6E2qXXMaY)

## 🚀 Features

### 1. Organizer Dashboard
- Web-based dashboard designed for small event organizers and creators
- Simple and intuitive interface requiring minimal technical knowledge
- Comprehensive analytics and event management tools

### 2. Event Management
Organizers can:
- Create new events with detailed information
- Edit existing event details and descriptions
- Upload images and manage event media
- Handle multiple events from one centralized platform

### 3. Admin Controls
- Admin users can monitor platform activity
- Manage users, organizers, and reported content
- Ensure smooth platform operation and quality control
- Access to comprehensive system analytics

### 4. Ticketing & Attendance Management
- Manage ticket availability and event capacity
- Track attendance and engagement for each event
- Handle payment processing and revenue tracking
- Generate detailed financial reports

### 5. Visibility & Promotion
- Events published through the web app become visible to mobile users instantly
- Help organizers reach a wider audience including travelers and locals
- Event boost features for enhanced visibility

### 6. Secure Authentication
- Firebase Authentication for admin and organizer login
- Secure access to dashboards and sensitive data

### 7. Scalable & Secure Backend
- Firebase Firestore for scalable data handling
- Encrypted data storage and HTTPS communication
- Reliable and secure infrastructure

### 8. Role-Based Access Control
- Different access levels for admins, organizers, and users
- Prevent unauthorized actions and improve security
- Granular permission management

## 🛠 Technology Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API (serverless) using Firebase Firestore, Authentication.
- **Charts**: Recharts for analytics visualization
- **UI Components**: Custom components with Lucide React icons
- **Styling**: Tailwind CSS with responsive design

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/              # Admin dashboard pages
│   ├── api/                # API routes and endpoints
│   ├── auth/               # Authentication pages
│   ├── hooks/              # Custom React hooks
│   └── organizer/          # Organizer dashboard pages
├── components/
│   ├── landing/            # Landing page components
│   ├── layout/             # Layout components
│   └── ui/                 # Reusable UI components
├── db/                     # Firebase configuration
├── hooks/                  # Global custom hooks
└── lib/                    # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun
- Firebase project setup

### Installation

1. Clone the repository:
```bash
git clone https://github.com/InduwaraRathnayake/Travelon.git
cd travelon
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎯 Usage

### For Organizers
1. Sign up for an organizer account
2. Complete your profile setup
3. Create and manage events through the dashboard
4. Track analytics and revenue
5. Manage payments and attendee information

### For Admins
1. Access admin dashboard with admin credentials
2. Monitor platform activity and user management
3. Review and moderate content
4. Access system-wide analytics and reports

## 📱 Mobile Integration

This web app works in conjunction with the Travelon mobile application, where:
- Events created on the web platform are instantly visible to mobile users(Travellers)
- Travelers can discover and book events through the mobile app
- Real-time synchronization between web and mobile platforms

**For more informations visit: [Travelon Mobile](https://github.com/PathumiRanasinghe/Travelon-mobile)**

## 🚢 Deployment

The application is hosted and deployed using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) .

## 📄 License

This project is licensed under the **MIT License**.

---

## 👥 Contributors

- [Induwara Rathnayake](https://github.com/InduwaraRathnayake)
- [Shanthisha Jayathunga](https://github.com/ShanthishaShyamana)
- [Sanuji Samarakoon](https://github.com/sanujis)
- [Pathumi Ranasinghe](https://github.com/PathumiRanasinghe)
- [Chehan Dissanayake](https://github.com/nchehan)
