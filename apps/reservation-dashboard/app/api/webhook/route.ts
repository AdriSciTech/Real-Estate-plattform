import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { db } from '@/firebase'; // Adjust import path to match your project structure
// import { doc, getDoc, updateDoc } from 'firebase/firestore';

// This handler will process Stripe webhook events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Missing Stripe webhook secret');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('Missing Stripe secret key');
    return NextResponse.json({ error: 'Stripe secret missing' }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
  });

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract the booking ID from metadata
        const bookingId = session.metadata?.bookingId;
        
        if (!bookingId) {
          console.error('No booking ID in session metadata');
          return NextResponse.json({ error: 'No booking ID found' }, { status: 400 });
        }
        
        console.log(`Processing webhook for completed checkout session: ${session.id}, booking: ${bookingId}`);
        
        // Placeholder: Mock Firebase operations
        console.log(`Mock: Retrieving booking ${bookingId} from database`);
        
        // Simulate booking data
        const bookingData = {
          propertyId: 'mock-property-123',
          userId: 'mock-user-123',
          status: 'pending',
          createdAt: new Date().toISOString()
        };
        
        // Simulate async database operation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get property details if needed
        let propertyData = {};
        
        // Placeholder: Mock property details retrieval
        if (bookingData.propertyId) {
          try {
            console.log(`Mock: Fetching property details for ${bookingData.propertyId}`);
            
            // Simulate property data
            propertyData = {
              rooms: "3",
              bathrooms: "2",
              size: "100m²",
            };
            
            // Simulate async operation
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (err) {
            console.error(`Mock: Error fetching property details: ${err}`);
            // Continue anyway as this is not critical
          }
        }
        
        // Prepare the update data
        const bookingUpdateData = {
          paymentStatus: 'completed',
          paymentDate: new Date().toISOString(),
          stripePaymentId: session.payment_intent as string,
          status: 'reserved', // CRITICAL: Must be exactly "reserved" (lowercase)
          updatedAt: new Date().toISOString(),
          // Include property details if available
          ...propertyData
        };
        
        console.log(`Updating booking ${bookingId} with:`, bookingUpdateData);
        
        // Placeholder: Mock booking update
        console.log(`Mock: Updating booking ${bookingId} with:`, bookingUpdateData);
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Placeholder: Mock property status update
        try {
          const propertyId = bookingData.propertyId;
          if (propertyId) {
            console.log(`Mock: Updating property ${propertyId} status to reserved`);
            
            // Simulate property update
            console.log(`Mock: Property update data:`, {
              status: "reserved",
              reservedBy: bookingData.userId || null,
              reservationDate: new Date().toISOString(),
              bookingId: bookingId
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            console.log(`Mock: Property ${propertyId} status updated successfully`);
          }
        } catch (propertyError) {
          console.error(`Mock: Error updating property status: ${propertyError}`);
          // Continue anyway - we've already updated the booking
        }
        
        console.log(`Payment completed for booking ${bookingId}`);
        break;
      }
      
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        
        if (bookingId) {
          console.log(`Mock: Processing expired session for booking ${bookingId}`);
          
          // Simulate booking data
          const bookingData = {
            propertyId: 'mock-property-123',
            status: 'pending'
          };
          
          // Mock update operation
          console.log(`Mock: Updating booking ${bookingId} with:`, {
            paymentStatus: 'expired',
            updatedAt: new Date().toISOString()
          });
          
          await new Promise(resolve => setTimeout(resolve, 100));
            
          // Placeholder: Mock property status reset
          if (bookingData.propertyId) {
            try {
              console.log(`Mock: Checking property ${bookingData.propertyId} status`);
              
              // Simulate property status check and update
              const mockPropertyData = { status: "reserved", bookingId: bookingId };
              
              if (mockPropertyData.status === "reserved" && 
                  mockPropertyData.bookingId === bookingId) {
                console.log(`Mock: Resetting property ${bookingData.propertyId} to available`);
                console.log(`Mock: Property update:`, {
                  status: "available",
                  reservedBy: null,
                  reservationDate: null,
                  bookingId: null
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log(`Mock: Property ${bookingData.propertyId} status reset to available`);
              }
            } catch (err) {
              console.error("Mock: Error updating property after session expiry:", err);
            }
          }
          
          console.log(`Payment session expired for booking ${bookingId}`);
        }
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const bookingId = paymentIntent.metadata?.bookingId;
        
        if (bookingId) {
          console.log(`Mock: Processing failed payment for booking ${bookingId}`);
          
          // Simulate booking data
          const bookingData = {
            propertyId: 'mock-property-123',
            status: 'pending'
          };
          
          // Mock update operation
          console.log(`Mock: Updating booking ${bookingId} with:`, {
            paymentStatus: 'failed',
            paymentError: paymentIntent.last_payment_error?.message || 'Payment failed',
            updatedAt: new Date().toISOString()
          });
          
          await new Promise(resolve => setTimeout(resolve, 100));
            
          // Placeholder: Mock property status reset after payment failure
          if (bookingData.propertyId) {
            try {
              console.log(`Mock: Checking property ${bookingData.propertyId} status after payment failure`);
              
              // Simulate property status check and update
              const mockPropertyData = { status: "reserved", bookingId: bookingId };
              
              if (mockPropertyData.status === "reserved" && 
                  mockPropertyData.bookingId === bookingId) {
                console.log(`Mock: Resetting property ${bookingData.propertyId} to available after payment failure`);
                console.log(`Mock: Property update:`, {
                  status: "available",
                  reservedBy: null,
                  reservationDate: null,
                  bookingId: null
                });
                
                await new Promise(resolve => setTimeout(resolve, 100));
                console.log(`Mock: Property ${bookingData.propertyId} status reset to available`);
              }
            } catch (err) {
              console.error("Mock: Error updating property after payment failure:", err);
            }
          }
          
          console.log(`Payment failed for booking ${bookingId}`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}