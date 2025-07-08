import React from 'react';
import { Music, Gamepad2, Briefcase, Heart, Camera, Trophy } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    { id: 'all', name: 'All Events', icon: null },
    { id: 'music', name: 'Music', icon: Music },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2 },
    { id: 'business', name: 'Business', icon: Briefcase },
    { id: 'lifestyle', name: 'Lifestyle', icon: Heart },
    { id: 'arts', name: 'Arts', icon: Camera },
    { id: 'sports', name: 'Sports', icon: Trophy },
  ];

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white rounded-2xl shadow-soft mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
              isSelected
                ? 'bg-primary-500 text-white shadow-lg'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-primary-500'
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span>{category.name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;