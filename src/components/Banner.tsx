import React from 'react';

interface BannerProps {
  title: string;
  subtitle: string;
  image: string;
  showSearchBar?: boolean;
}

const Banner: React.FC<BannerProps> = ({ 
  title, 
  subtitle, 
  image, 
  showSearchBar = false 
}) => {
  return (
    <div className="relative h-96 mb-8 rounded-3xl overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt="Banner"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {title}
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              {subtitle}
            </p>
            
            {showSearchBar && (
              <div className="flex max-w-md">
                <input
                  type="text"
                  placeholder="Search events..."
                  className="flex-1 px-4 py-3 rounded-l-xl border-0 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
                <button className="bg-primary-500 text-white px-6 py-3 rounded-r-xl hover:bg-primary-600 transition-colors duration-200 font-medium">
                  Search
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
