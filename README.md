# ChoresAwards TypeScript Edition

A modern, full-stack TypeScript rewrite of the ChoresAwards family chore and reward management system.

## Architecture

- **Backend**: Node.js + Express + TypeScript + SQLite
- **Frontend**: React + TypeScript + Tailwind CSS + React Router
- **Database**: SQLite (same as original Python version)

## Features

- 🔐 PIN-based authentication system
- 👨‍👩‍👧‍👦 Multi-user family management
- ✅ Chore tracking with point system
- 🎁 Rewards redemption system
- 📊 Activity logging and history
- 📱 Responsive design
- 🔒 Role-based access (admin vs regular users)

## Project Structure

```
chores-awards-ts/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # TypeScript interfaces
│   │   ├── utils/          # Database utilities
│   │   └── server.ts       # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utilities
│   ├── package.json
│   └── tailwind.config.js
└── README.md               # This file
```

## Quick Start

### Initial Setup

When you first access the application, you'll be guided through a setup wizard that will:

1. **Set Master PIN**: Create an admin PIN for system management
2. **Add Family Members**: Add people who will use the system with optional individual PINs

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy the environment file:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173`

**First Run**: On your first visit, you'll see the setup wizard. Follow the prompts to:

- Create a master PIN for admin access
- Add family members with optional individual PINs

## Authentication

The application supports two types of authentication:

- **Master PIN**: Provides full admin access to manage family members, chores, and rewards
- **Individual PINs**: Allow family members to log in and complete their assigned tasks

You can log in with either your master PIN or an individual PIN.

## API Endpoints

### Setup (First Run)

- `GET /api/setup/status` - Check if setup is needed
- `POST /api/setup/complete` - Complete initial setup
- `POST /api/setup/verify-master` - Verify master PIN

### Authentication

- `POST /api/auth/login` - Login with PIN (master or individual)

### Persons

- `GET /api/persons` - Get all family members
- `POST /api/persons` - Create new person
- `PUT /api/persons/:id` - Update person
- `DELETE /api/persons/:id` - Delete person
- `POST /api/persons/:id/reset-points` - Reset points
- `POST /api/persons/:id/bonus-points` - Award bonus points

### Chores

- `GET /api/chores` - Get all chores
- `POST /api/chores` - Create new chore
- `PUT /api/chores/:id` - Update chore
- `POST /api/chores/:id/complete` - Complete chore
- `DELETE /api/chores/:id` - Delete chore

### Rewards

- `GET /api/rewards` - Get all rewards
- `POST /api/rewards` - Create new reward
- `POST /api/rewards/:id/complete` - Redeem reward
- `DELETE /api/rewards/:id` - Delete reward

### Activity & Settings

- `GET /api/activities` - Get activity log
- `GET /api/settings` - Get app settings
- `PUT /api/settings/:key` - Update setting

## Development

### Backend Development

```bash
cd backend
npm run dev      # Start with nodemon
npm run build    # Build TypeScript
npm run start    # Start production server
```

### Frontend Development

```bash
cd frontend
npm run dev      # Start Vite dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Database

The application uses SQLite for data persistence, with the following tables:

- `persons` - Family members
- `chores` - Individual chores/tasks
- `rewards` - Available rewards
- `activity_log` - System activity history
- `app_settings` - Application configuration

## Migration from Python Version

This TypeScript version maintains API compatibility with the original Python Flask application. The database schema is identical, allowing for easy migration of existing data.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
