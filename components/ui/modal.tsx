'use client'
// Server-side Modal

import Link from "next/link";
import PayPalForm from "@/components/paypal-button";
import { CrossIcon } from "@/components/icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function Modal() {

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "error">("pending");
  const [paymentData, setPaymentData] = useState<any>(null);

  const handlePaymentSuccess = (data: any) => {
    setPaymentStatus("success");
    setPaymentData(data);
  };

  const handlePaymentError = () => {
    setPaymentStatus("error");
  };

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('show');

    const newUrl = `${pathname}?${params.toString()}`;
    const currentUrl = `${pathname}?${searchParams.toString()}`;

    if (newUrl !== currentUrl) {
      router.replace(newUrl);
    }
  }
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="p-8 border w-auto max-w-3xl shadow-lg rounded-md bg-white text-black relative">
        <div className="text-center">
          {paymentStatus === "pending"
            && <PayPalForm
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
              />}

          {paymentStatus === "success" && (
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h2>
              <p className="mb-4">Thank you for your purchase. Your premium membership is now active.</p>
              {paymentData && (
                <div className="text-left bg-gray-50 p-4 rounded mb-4">
                  <p><strong>Order ID:</strong> {paymentData.orderID}</p>
                  <p><strong>Amount:</strong> ${paymentData.amount}</p>
                </div>
              )}
            </div>
          )}

          {paymentStatus === "error" && (
            <div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Failed</h2>
              <p>We encountered an issue processing your payment. Please try again later.</p>
            </div>
          )}

          {/* Navigates back to the base URL - closing the modal */}
          <Button
            className="absolute top-4 right-4 btn-ghost size-8 p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={handleClose}
          >
            <CrossIcon className="size-full" />
          </Button>
          
        </div>
      </div>
    </div>
  );
}
