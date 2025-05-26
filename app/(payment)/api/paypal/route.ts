import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { logPayPal, updateUserToPremium } from "@/lib/db/queries";
import { auth } from '@/app/(auth)/auth';
import { redirect } from "next/navigation";

interface PaymentData {
  name: string;
  email: string;
  amount: string;
  orderID: string;
}

const PAYPAL_API_URL = process.env.PAYPAL_API_URL || 'https://sandbox.paypal.com';

async function getPayPalAccessToken() {
  try {
    const auth = Buffer.from(`${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString('base64');
    // console.log(`getPayPalAccessToken: ${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`);
    // console.log(`PAYPAL_API_URL: ${PAYPAL_API_URL}`);
    const response = await fetch(PAYPAL_API_URL + '/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    const data = await response.json();

    if (data.error) {
      console.error('Error getting PayPal access token:', data.error_description);
      throw new Error(data.error_description);
    }
    
    return data.access_token;
  } catch (error) {
    console.error('Error requesting PayPal access token:', error);
    throw error;
  }
}

async function capturePayPalOrder(orderID: string, accessToken: string) {
  try {
    const ppOrderCaptureEndpoint = `${PAYPAL_API_URL}/v2/checkout/orders/${orderID}/capture`;
    
    console.log(`Capturing order ${orderID} with token ${accessToken.substring(0, 10)}... at ${ppOrderCaptureEndpoint}`);
    const response = await fetch(ppOrderCaptureEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    // console.log('Capture response:');
    // console.log(response);

    const data = await response.json();
    
    console.log('Returning capture response data:');
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const data: PaymentData = await request.json();
    console.log('PayPal endpoint received payment data:', data);
    // region Validate the payment data
    if (!data.name || !data.email || !data.amount || !data.orderID) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }
    // endregion Validate the payment data
    
    // region Get current user session
    const session = await auth();
    if (!session) {
      console.error('User not logged in while attempting PayPal payment');
      throw new Error('User not logged in while attempting PayPal payment');
    }
    // endregion Get current user session
    
    // region Get the PayPal access token
    const accessToken = await getPayPalAccessToken();
    // console.log('PayPal endpoint got PayPal access token (' + typeof accessToken + '): ' + accessToken);
    // endregion Get the PayPal access token
    
    // Capture the payment
    const captureData = await capturePayPalOrder(data.orderID, accessToken);
    console.log('PayPal capture response:', captureData);

    await logPayPal(data, session.user.id);
    
    // Check if capture was successful
    if (captureData.status !== 'COMPLETED') {
      console.log(`Invalid capture status: ${captureData.status}`);
      return NextResponse.json(
        { error: `Payment capture failed with status: ${captureData.status}` },
        { status: 400 },
      );
    }
    
    await updateUserToPremium(session.user.id);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Payment captured successfully',
        data: {
          name: data.name,
          email: data.email,
          amount: data.amount,
          orderID: data.orderID,
          captureID: captureData.id,
          captureStatus: captureData.status,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Payment API endpoint' },
    { status: 200 },
  );
}
