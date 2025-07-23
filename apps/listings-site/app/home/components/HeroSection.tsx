import PropertySearch from "./PropertySearch";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-property.jpg')", // You'll need to add this image
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              SpainDreamHome
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-2">
              Madrid Bookings
            </p>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Discover your perfect property in Spain's most beautiful locations
            </p>
          </div>

          {/* Search Component */}
          <div className="max-w-4xl mx-auto">
            <PropertySearch />
          </div>
        </div>
      </div>
    </section>
  );
}
