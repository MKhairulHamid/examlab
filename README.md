# Cloud Exam Lab - React Exam Preparation App

A modern, offline-first exam preparation platform built with React, Vite, Zustand, and Supabase.

## 🚀 Features

- **Offline-First Architecture** - Work without internet, sync when connected
- **Instant Loading** - Cache-first approach for blazing fast performance
- **Cross-Device Sync** - Continue where you left off on any device
- **Real Exam Simulation** - Practice with timed, realistic exam scenarios
- **Auto-Save Progress** - Never lose your progress, saves every answer
- **PWA Support** - Install as an app on any device
- **Study Materials** - Detailed explanations for every question
- **Performance Tracking** - Track your progress and identify weak areas

## 📦 Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **Supabase** - Backend and authentication
- **IndexedDB** - Local storage for large data
- **Service Workers** - Offline support

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account (for backend)

### Installation

1. **Install dependencies:**

```bash
npm install
```

2. **Create environment file:**

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_APP_URL=http://localhost:5173
```

3. **Set up Supabase:**

Run the SQL schema from `../supabase-schema.sql` in your Supabase SQL editor to create the necessary tables.

### Development

```bash
npm run dev
```

This will start the development server at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
cloud-exam-lab/
├── public/
│   ├── manifest.json          # PWA manifest
│   └── sw.js                   # Service worker
├── src/
│   ├── components/
│   │   └── auth/              # Authentication components
│   ├── pages/                 # Page components
│   ├── stores/                # Zustand stores
│   ├── services/              # API and storage services
│   ├── hooks/                 # Custom React hooks
│   ├── utils/                 # Utility functions
│   ├── App.jsx                # Root component
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## 🔄 Offline-First Architecture

### Data Flow

```
User Action → Local Storage (instant) → Background Queue → Supabase → Other Devices
     ↓                                                           ↓
  UI Updates                                         Sync Indicator (optional)
```

### Storage Strategy

- **LocalStorage**: Quick access data (profiles, progress metadata)
- **IndexedDB**: Large data (question sets, exam attempts)
- **Supabase**: Source of truth, cross-device sync

### Conflict Resolution

When data conflicts exist between local and remote:
- **Rule**: Latest timestamp wins
- Local changes are never lost
- Background sync happens automatically

## 🎯 Key Features

### Authentication
- Email/password login and signup
- Password reset functionality
- User profile with country detection
- Persistent sessions

### Exam Taking
- Load questions instantly from IndexedDB
- Auto-save every answer immediately
- Timer with pause on tab switch
- Question navigation grid
- Study materials for each question
- Swipe gestures support (future)

### Progress Tracking
- Real-time progress saving
- Cross-device continuity
- Exam history and results
- Performance analytics

### Offline Support
- 100% functional offline
- Background sync when online
- No data loss
- Seamless transition between online/offline

## 🔧 Configuration

### Tailwind Colors

Custom colors defined in `tailwind.config.js`:
- Primary: `#0A2540`
- Accent: `#00D4AA`
- Secondary: `#1A3B5C`

### Cache Expiry

Defined in `src/utils/constants.js`:
- Exams: 24 hours
- Question sets: 24 hours
- Profile: 1 hour
- Progress: 1 hour

## 🧪 Testing

### Test Offline Mode
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Verify all features work

### Test Sync
1. Make changes offline
2. Go back online
3. Verify sync indicator
4. Check Supabase for synced data

### Test Cross-Device
1. Login on one device
2. Make progress
3. Login on another device
4. Verify progress is synced

## 📱 PWA Installation

The app can be installed as a Progressive Web App:
1. Open the app in a supported browser
2. Look for the install prompt
3. Click "Install" or "Add to Home Screen"
4. The app will work offline after installation

## 🚀 Performance

Target metrics:
- Initial Load: < 1s (from cache)
- Background Sync: < 5s (non-blocking)
- Answer Save: < 10ms (local storage)
- Question Navigation: < 50ms
- Offline Mode: 100% functional

## 🐛 Troubleshooting

### App won't load
- Check if `.env` file exists and has correct Supabase credentials
- Clear browser cache and reload
- Check browser console for errors

### Sync not working
- Verify internet connection
- Check Supabase credentials
- Open browser DevTools → Application → Service Workers
- Check sync queue status in console

### Data not saving
- Check browser storage quotas
- Clear old cached data
- Verify Supabase connection

## 📝 Migration from Old App

If migrating from the HTML version:
1. Existing Supabase database works as-is
2. User accounts are preserved
3. Exam data remains unchanged
4. Users need to login again (sessions don't transfer)

## 🤝 Contributing

This is a refactored version of the exam-prep-test application.
Key improvements:
- Modern React architecture
- Offline-first design
- Better state management
- Improved performance
- Enhanced UX

## 📄 License

Private project - All rights reserved

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

