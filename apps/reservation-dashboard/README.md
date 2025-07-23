# Reservation Dashboard

A Next.js application for managing property reservations, built with Supabase and TypeScript.

## Features

- User authentication and profiles
- Property booking requests
- Payment processing with Stripe
- Landlord management interface
- Real-time booking status updates
- Mobile-responsive design

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **UI Components**: Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase project
- Stripe account (for payments)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your configuration:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

5. Set up the database:
   - Run the SQL schema in `supabase/schema.sql` in your Supabase dashboard
   - This creates all necessary tables and RLS policies

6. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

The application uses the following main tables:

- `user_profiles` - User information and profiles
- `properties` - Property listings
- `property_owners` - Landlord information
- `booking_requests` - Property booking requests
- `reservations` - Confirmed property reservations

## API Routes

- `/api/create-checkout-session` - Stripe checkout session creation
- `/api/webhook` - Stripe webhook handler

## Key Components

- **Dashboard**: Main user interface with tabs for different features
- **Property Management**: View and book properties
- **Booking System**: Request and manage property bookings
- **Payment Flow**: Stripe integration for payments and contracts
- **Landlord Interface**: Property owner management tools

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint secret |

## Migration from Firebase

This application has been migrated from Firebase to Supabase. Key changes include:

- Firebase Auth → Supabase Auth
- Firestore → Supabase PostgreSQL
- Firebase Functions → Supabase Edge Functions (if needed)
- Real-time listeners → Supabase Realtime

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Deployment

The application can be deployed to Vercel, Netlify, or any platform that supports Next.js.

1. Connect your Git repository
2. Set environment variables in your hosting platform
3. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is proprietary and confidential.