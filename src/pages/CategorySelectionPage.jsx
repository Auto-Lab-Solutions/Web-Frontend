import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { categories } from '../meta/menu';

const CategorySelectionPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      navigate(`/accessories/items?category=${selectedCategory.id}`);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageContainer>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2 text-text-secondary hover:text-text-primary"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <div className="text-center flex-1">
              <FadeInItem element="h1" direction="y" className="text-3xl sm:text-4xl font-bold mb-2">
                Select Category
              </FadeInItem>
              <FadeInItem element="p" direction="y" className="text-xl text-text-secondary">
                Choose the type of automotive products you need
              </FadeInItem>
            </div>
            <div className="w-20"></div> {/* Spacer for symmetry */}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-highlight-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <span className="ml-2 text-text-primary font-medium">Category</span>
              </div>
              <div className="w-12 h-0.5 bg-border-secondary"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-sm">
                  2
                </div>
                <span className="ml-2 text-text-secondary">Items</span>
              </div>
              <div className="w-12 h-0.5 bg-border-secondary"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-sm">
                  3
                </div>
                <span className="ml-2 text-text-secondary">Order</span>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
              <motion.div
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCategory?.id === category.id
                      ? 'ring-2 ring-highlight-primary bg-card-primary border-highlight-primary'
                      : 'bg-card-primary border-border-primary hover:border-border-tertiary hover:shadow-lg'
                  }`}
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent className="p-6 text-center">
                    {/* Category Image Placeholder */}
                    <div className="w-16 h-16 bg-gradient-to-br from-highlight-primary to-highlight-secondary rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-text-primary mb-2">
                      {category.name}
                    </h3>
                    
                    <p className="text-sm text-text-secondary mb-4">
                      {category.desc}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 text-xs text-text-secondary">
                      <span>{category.items.length} items available</span>
                    </div>
                    
                    {selectedCategory?.id === category.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-4"
                      >
                        <div className="w-6 h-6 bg-highlight-primary rounded-full mx-auto flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={!selectedCategory}
              className="px-8 py-3 text-lg font-semibold flex items-center space-x-2"
            >
              <span>Continue to Items</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default CategorySelectionPage;
