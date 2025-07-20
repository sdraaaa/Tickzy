import React from 'react';

interface FestiveBannerProps {
  title?: string;
  subtitle?: string;
  image?: string;
}

const FestiveBanner: React.FC<FestiveBannerProps> = ({
  title = "Welcome to Tickzy",
  subtitle = "Discover and host unforgettable events around you",
  image = "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200", // Default event banner image
}) => {
  return (
    <div
      className="relative w-full h-[450px] rounded-2xl overflow-hidden mb-10 shadow-lg"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Black overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />

      {/* Centered Content */}
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center text-center px-4 md:px-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {title}
        </h1>
        <p className="text-lg text-white/90 max-w-2xl">
          {subtitle}
        </p>
      </div>
    </div>
  );
};

export default FestiveBanner;
