// dashboard/components/UI/MobileMenuToggle.tsx
import { Menu, X } from "lucide-react";

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileMenuToggle({ isOpen, onToggle }: MobileMenuToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md"
    >
      {isOpen ? (
        <X className="h-6 w-6 text-gray-900" />
      ) : (
        <Menu className="h-6 w-6 text-gray-900" />
      )}
    </button>
  );
}