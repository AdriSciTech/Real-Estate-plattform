// app/ReservationDashboard/dashboard/components/NoProperty.tsx
import { useRouter } from "next/navigation";

export default function NoProperty() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-16 w-16"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Property Selected
        </h3>
        <p className="text-gray-600 mb-6">
          You haven't selected a property yet. Browse available properties to get started.
        </p>
        <button
          onClick={() => router.push("/properties")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Browse Properties
        </button>
      </div>
    </div>
  );
}