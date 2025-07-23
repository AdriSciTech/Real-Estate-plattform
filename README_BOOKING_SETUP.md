# Booking System Setup Guide

## Overview

The booking system consists of two applications:
1. **Listings Site** - Where users browse properties (default port 3000)
2. **Reservation Dashboard** - Where users complete bookings (port 3001)

## How to Run Both Applications

### Step 1: Start the Reservation Dashboard (Port 3001)

Open a new PowerShell/Terminal window and navigate to the reservation dashboard:

```bash
cd "C:\adrian_programming\rental plattform for students startup\apps\reservation-dashboard\ReservationDashboard"
```

Install dependencies (first time only):
```bash
npm install
```

Start the reservation dashboard on port 3001:

**Windows (PowerShell):**
```powershell
$env:PORT=3001; npm run dev
```

**Or use the batch file:**
```bash
start-dashboard.bat
```

**Mac/Linux:**
```bash
PORT=3001 npm run dev
```

The reservation dashboard will be available at: `http://localhost:3001`

### Step 2: Start the Listings Site (Port 3000)

Open another PowerShell/Terminal window and navigate to the listings site:

```bash
cd "C:\adrian_programming\rental plattform for students startup\apps\listings-site\listings-plattform"
```

Install dependencies (first time only):
```bash
npm install
```

Start the listings site:
```bash
npm run dev
```

The listings site will be available at: `http://localhost:3000`

## How the Booking Flow Works

1. **User browses properties** on the listings site (http://localhost:3000)
2. **User clicks "Request Booking"** on a property card or property details page
3. **Property data is stored** in localStorage with all necessary details
4. **New tab opens** with the reservation dashboard (http://localhost:3001/dashboard)
5. **Reservation dashboard retrieves** the property data from localStorage
6. **User completes the booking** in the reservation dashboard

## Data Transfer Method

The system uses a dual approach for maximum reliability:

1. **LocalStorage**: Complete property data is stored under the key `selectedProperty`
2. **URL Parameters**: Property ID is passed as `propertyId` for quick reference

### Property Data Structure

```javascript
{
  id: "property-id",
  title: "Property Title",
  address: "Full Address",
  city: "City Name",
  price: "850",
  displayPrice: "€850",
  priceFrequency: "month",
  bedrooms: "2",
  bathrooms: "1",
  size: "75 m²",
  propertyType: "Apartment",
  featuredImage: "https://...",
  images: ["https://...", ...],
  available: true,
  description: "Property description...",
  // ... additional fields
}
```

## Troubleshooting

### Issue: "This site can't be reached"

**Solution**: Make sure the reservation dashboard is running on port 3001

### Issue: Property data not showing in reservation dashboard

**Solution**: 
1. Check browser console for errors
2. Verify localStorage has `selectedProperty` key
3. Make sure both apps are running

### Issue: Port 3001 is already in use

**Solution**: 
1. Find the process using the port: `netstat -ano | findstr :3001`
2. Kill the process or use a different port
3. Update the port in both PropertyCard1 and ContactSection components

## Production Deployment

For production, update the reservation dashboard URLs in:
- `/components/PropertyCard1/PropertyCard.tsx`
- `/app/properties/[id]/components/ContactSection.tsx`

Replace `http://localhost:3001` with your actual production domain.

## Environment Variables

Make sure both applications have their `.env.local` files configured with:
- Supabase credentials
- API keys
- Other necessary environment variables

## Support

If you encounter any issues:
1. Check that both applications are running
2. Verify the ports are correct (3000 for listings, 3001 for reservations)
3. Check browser console for JavaScript errors
4. Ensure localStorage is not blocked by browser settings