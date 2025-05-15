// Server-side Modal

import Link from "next/link";
import PayPalFromTutorial from "@/components/paypal-button";
import { CrossIcon } from "@/components/icons";

export function Modal() {

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="p-8 border w-auto max-w-3xl shadow-lg rounded-md bg-white text-black relative">
        <div className="text-center">
          <PayPalFromTutorial></PayPalFromTutorial>

          {/* Navigates back to the base URL - closing the modal */}
          <Link
            href="/"
            className="absolute top-4 right-4 btn-ghost size-8 p-1 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <CrossIcon className="size-full" />
          </Link>
          
        </div>
      </div>
    </div>
  );
}
