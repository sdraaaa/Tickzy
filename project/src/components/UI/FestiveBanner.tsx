import React from 'react';
import { Sparkles, Music, Users } from 'lucide-react';

interface FestiveBannerProps {
  title?: string;
  subtitle?: string;
  image?: string;
}

const FestiveBanner: React.FC<FestiveBannerProps> = ({
  title = "🎉 Welcome to Tickzy!",
  subtitle = "Discover amazing events happening around you",
  image = "https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1200"
}) => {
  return (
    <div className="relative bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 mb-8 overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%227%22%20cy%3D%227%22%20r%3D%225%22/%3E%3Ccircle%20cx%3D%2253%22%20cy%3D%2253%22%20r%3D%225%22/%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%223%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <Sparkles className="w-6 h-6 text-yellow-300 mr-2" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                {title}
              </h1>
            </div>
            <p className="text-primary-100 text-lg mb-6 max-w-2xl">
              {subtitle}
            </p>
            
            {/* Stats */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-white/90">
                <Music className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">1,200+ Events</span>
              </div>
              <div className="flex items-center text-white/90">
                <Users className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">50K+ Happy Users</span>
              </div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                  <Music className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FestiveBanner;