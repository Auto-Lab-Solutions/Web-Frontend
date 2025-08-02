import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import useProgressBarScroll from '../hooks/useProgressBarScroll';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ArrowRight, Plus, ShoppingCart } from 'lucide-react';
import { categories } from '../meta/menu';
import { useMobileInputStyling } from '../hooks/useMobileOptimization';
import BackArrow from '../components/common/BackArrow';

const CategorySelectionPage = () => {
  const navigate = useNavigate();
  const { orderFormData } = useGlobalData();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  
  // Initialize progress bar scroll hook (step 1 of 4)
  const { containerRef, stepRefs } = useProgressBarScroll(1, 4);
  
  // Check if there are already items in the cart
  useEffect(() => {
    if (orderFormData && orderFormData.items) {
      setCartItemCount(orderFormData.items.length);
    }
  }, [orderFormData]);

  // Apply mobile input optimizations
  useMobileInputStyling();

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handleContinue = () => {
    if (selectedCategory) {
      navigate(`/accessories/items?category=${selectedCategory.id}`);
    }
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageContainer>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20 relative">
        <BackArrow to={handleBack} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8">
            <div className="hidden">
              {/* Back button moved to bottom */}
            </div>
            <div className="text-center flex-1 mb-4 sm:mb-0">
              <FadeInItem element="h1" direction="y" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                Select Category
              </FadeInItem>
              <FadeInItem element="p" direction="y" className="text-base sm:text-xl text-text-secondary">
                Choose categories for your automotive products
              </FadeInItem>
            </div>
            <div className="hidden sm:block w-20"></div> {/* Spacer for symmetry on larger screens */}
          </div>

          {/* Progress Indicator */}
          <div ref={containerRef} className="flex items-center justify-center mb-12 overflow-x-auto pb-2 -mx-4 px-6 sm:px-8 scrollbar-thin scrollbar-thumb-border-secondary hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 px-8 xs:px-10 sm:px-12 py-2 bg-background-secondary rounded-lg shadow-sm min-w-[800px]">
              <div ref={stepRefs?.current[0] || null} id="step-1" className="flex items-center cursor-pointer whitespace-nowrap pl-6 xs:pl-4">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-highlight-primary text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                  1
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium">Category</span>
              </div>
              <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-highlight-primary"></div>
              <div ref={stepRefs?.current[1] || null} id="step-2" className="flex items-center cursor-pointer whitespace-nowrap" onClick={() => navigate('/accessories/items')}>
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm shadow-sm">
                  2
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-secondary hover:text-highlight-primary">Items</span>
              </div>
              <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-border-secondary"></div>
              <div ref={stepRefs?.current[2] || null} id="step-3" className="flex items-center cursor-pointer whitespace-nowrap" onClick={() => navigate('/order-form')}>
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm shadow-sm">
                  3
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-secondary hover:text-highlight-primary">Details</span>
              </div>
              <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-border-secondary"></div>
              <div ref={stepRefs?.current[3] || null} id="step-4" className="flex items-center cursor-pointer whitespace-nowrap pr-6 xs:pr-4" onClick={() => navigate('/order-confirmation')}>
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm shadow-sm">
                  4
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-secondary hover:text-highlight-primary">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="mb-6 text-center">
            <p className="text-text-secondary italic">
              You can select items from multiple categories. After adding items from one category, you can return here to add more.
            </p>
          </div>
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

          {/* Continue and View Cart Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleContinue}
              disabled={!selectedCategory}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold flex items-center justify-center bg-highlight-primary text-text-tertiary hover:bg-highlight-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Select Items from this Category</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {cartItemCount > 0 && (
              <Button
                onClick={handleViewCart}
                variant="outline"
                className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold flex items-center justify-center border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-300"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span>View Cart ({cartItemCount})</span>
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default CategorySelectionPage;
