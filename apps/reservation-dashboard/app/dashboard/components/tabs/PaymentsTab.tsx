// app/dashboard/components/tabs/PaymentsTab.tsx
"use client";

import { CreditCard } from "lucide-react";
import { PropertyData } from "../../../types";

interface PaymentsTabProps {
  property: PropertyData | null;
  formatPrice: (price: string) => string;
  setActiveTab: (
    tab: "dashboard" | "payments" | "profile" | "roommates"
  ) => void;
}

export default function PaymentsTab({
  property,
  formatPrice,
  setActiveTab,
}: PaymentsTabProps) {
  // Calculate deposit amount (30% of total)
  const calculateDeposit = (price: string) => {
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "€0.00";
    return `€${(numPrice * 0.3).toFixed(2)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Payment Information</h2>

      {property ? (
        <div>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-700 mb-2">Booking Summary</h3>
            <div className="flex justify-between items-center">
              <p className="text-gray-700">{property.title}</p>
              <p className="font-medium">
                {property.displayPrice || formatPrice(property.price)}
              </p>
            </div>
          </div>

          <form>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="card"
                      className="h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <label
                      htmlFor="card"
                      className="flex items-center cursor-pointer"
                    >
                      <CreditCard size={20} className="mr-2 text-gray-500" />
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>

                  <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="bank"
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="bank"
                      className="flex items-center cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                      </svg>
                      <span>Bank Transfer</span>
                    </label>
                  </div>

                  <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 flex items-center space-x-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      id="paypal"
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="paypal"
                      className="flex items-center cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-gray-500"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.64.64 0 0 1 .632-.539h6.993c2.243 0 3.85.477 4.78 1.42.879.912 1.228 2.369 1.033 4.318-.077.786-.252 1.607-.521 2.433-.27.827-.623 1.623-1.046 2.358a6.696 6.696 0 0 1-1.547 1.808c-.574.477-1.232.862-1.954 1.144-.722.282-1.534.423-2.424.423H7.662a.642.642 0 0 0-.633.539l-.902 5.118a.086.086 0 0 1-.085.072 4.55 4.55 0 0 1-.071 0l.105-.591Z" />
                        <path d="M18.111 7.268c-.426 2.728-2.553 4.409-5.539 4.409h-1.33a.641.641 0 0 0-.632.539l-.774 4.274a.641.641 0 0 1-.632.539h-2.53a.641.641 0 0 1-.632-.74L8.696 3.72a.64.64 0 0 1 .632-.539h5.089c1.616 0 2.766.345 3.412 1.025.604.634.829 1.617.676 2.95l-.394.112Z" />
                      </svg>
                      <span>PayPal</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0000 0000 0000 0000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MM/YY"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Payment Amount</h3>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentAmount"
                      id="deposit"
                      className="h-4 w-4 text-blue-600"
                      defaultChecked
                    />
                    <label
                      htmlFor="deposit"
                      className="ml-3 flex flex-1 justify-between cursor-pointer"
                    >
                      <span>Deposit (30%)</span>
                      <span className="font-medium">
                        {calculateDeposit(property.price)}
                      </span>
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="paymentAmount"
                      id="full"
                      className="h-4 w-4 text-blue-600"
                    />
                    <label
                      htmlFor="full"
                      className="ml-3 flex flex-1 justify-between cursor-pointer"
                    >
                      <span>Full Payment</span>
                      <span className="font-medium">
                        {property.displayPrice || formatPrice(property.price)}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Confirm Payment
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            No booking found. Please select a property first.
          </p>
          <button
            onClick={() => setActiveTab("dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
