"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

interface PayPalFormProps {
  onPaymentSuccess?: (data: any) => void;
  onPaymentError?: () => void;
}

const cartItems: CartItem[] = [
  {
    id: 1,
    name: "Donation for Premium membership",
    price: 5.00,
    quantity: 1,
  }
];

export default function PayPalForm({ onPaymentSuccess, onPaymentError }: PayPalFormProps) {
  const router = useRouter();
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const SHIPPING_COST = 0.00;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paypalError, setPaypalError] = useState("");

  // Calculate subtotal and total
  useEffect(() => {
    const calculatedSubtotal = cartItems.reduce((acc, item) =>
      acc + (item.price * item.quantity), 0,
    );
    setSubtotal(calculatedSubtotal);
    setTotal(calculatedSubtotal + SHIPPING_COST);
  }, []);

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: total.toFixed(2),
            currency_code: 'USD',
          },
          description: `Donation for Premium membership`,
        },
      ],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
    try {
      const order = await actions.order.get();
      // console.log('PayPalForm onApprove: payment successful:');
      // console.log(order);

      // Extract payer information from PayPal response
      const payerName = order.payer?.name?.given_name || '';
      const payerEmail = order.payer?.email_address || '';

      const paymentData = {
        name: payerName,
        email: payerEmail,
        amount: total.toFixed(2),
        orderID: data.orderID,
      };

      console.log('Sending paymentData to API:', paymentData);

      // Send payment data to our API
      const response = await fetch('/api/paypal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      console.log('paymentData API response:', response);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PayPal API error response:', errorText);
        throw new Error('Payment processing failed');
      }

      const result = await response.json();
      // alert('Payment processed successfully!');
      console.log('Payment processed successfully:');
      console.log(result);

      // Call the success callback with payment data
      if (onPaymentSuccess) {
        onPaymentSuccess({
          ...paymentData,
          captureID: result.data.captureID,
          captureStatus: result.data.captureStatus
        });
      }

    } catch (error) {
      console.error('Payment failed:', error);
      setPaypalError('Payment failed. Please try again.');

      // Call the error callback
      if (onPaymentError) {
        onPaymentError();
      }

    } finally {
      setIsProcessing(false);
    }
  };

  const onError = (err: any) => {
    console.error('PayPal error:', err);
    setPaypalError('An error occurred with PayPal. Please try again.');

    // Call the error callback
    if (onPaymentError) {
      onPaymentError();
    }
  };
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Premium membership</h2>
      <p className="text-left">
        You are about to purchase test membership for <b>1 month</b>, that will give you ability to use our <b>most advanced features</b> and up to <b>500 daily chat messages</b>.
        <br/>This is only to showcase our chatbot capabilities and is <b>not a real membership</b> and comes with no guarantee. Functionality may change without previous notice.
        <br/>Please consider this purchase <b>a donation</b> to our team.
      </p>

      <div className="space-y-2 mb-6">
        <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="mb-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
          <span>Processing your payment...</span>
        </div>
      )}

      {/* Error Message */}
      {paypalError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
          {paypalError}
        </div>
      )}

      {/* PayPal Button */}
      <PayPalScriptProvider options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency: 'USD',
        intent: 'capture',
      }}>
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          style={{ layout: "vertical" }}
          disabled={isProcessing}
        />
      </PayPalScriptProvider>

      <p className="text-xs text-gray-500 text-center">
        By completing this purchase, you agree to our terms and conditions.
      </p>
    </div>
  );
}
