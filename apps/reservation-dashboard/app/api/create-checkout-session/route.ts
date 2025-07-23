import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
// import { db } from '@/firebase'; // Adjust import path to match your project structure
// import { doc, updateDoc } from 'firebase/firestore';

// Define the expected request body structure
interface CheckoutRequestBody {
  bookingId: string;
  propertyTitle: string;
  depositAmount: string;
}

export async function POST(request: NextRequest) {
  try {
    // Initialize Stripe with the SECRET key
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing Stripe secret key');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Stripe secret key' },
        { status: 500 }
      );
    }
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16', // Specify the API version
    });
    
    // Parse the request body
    const body = await request.json() as CheckoutRequestBody;
    const { bookingId, propertyTitle, depositAmount } = body;
    
    // Log the received data for debugging
    console.log('Creating checkout session for:', { bookingId, propertyTitle, depositAmount });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Reservation for ${propertyTitle}`,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: Math.round(parseFloat(depositAmount) * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Keep redirecting to payment page with success flag
      success_url: `${request.headers.get('origin')}/payment/${bookingId}/reservation?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/payment/${bookingId}/reservation`,
      metadata: {
        bookingId,
      },
    });
    console.log('Checkout session created with ID:', session.id);
    
    // Placeholder: Mock Firebase update operation
    try {
      console.log(`Mock: Updating booking ${bookingId} with Stripe session ID:`, {
        stripeSessionId: session.id,
        paymentStatus: 'pending',
        updatedAt: new Date().toISOString()
      });
      
      // Simulate async database operation
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log(`Mock: Successfully updated booking ${bookingId} with stripe session ID`);
    } catch (dbError) {
      console.error('Mock: Error updating booking with Stripe session ID:', dbError);
      // Continue anyway - this is not critical for payment processing
    }
    
    // Return the session ID to the client
    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}