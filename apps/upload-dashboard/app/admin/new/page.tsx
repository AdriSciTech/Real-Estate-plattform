//my-app\app\admin\new\page.tsx

import AuthGuard from "@/components/AuthGuard";
import PropertyForm from "@/components/PropertyForm/PropertyForm";

export default function NewPropertyPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PropertyForm />
        </div>
      </div>
    </AuthGuard>
  );
}
