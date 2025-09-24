import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import useProgressBarScroll from '../hooks/useProgressBarScroll';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, ArrowRight, Plus, Minus, ShoppingCart } from 'lucide-react';
import { categories, getCategoryById } from '../meta/menu';
import { useMobileInputStyling } from '../hooks/useMobileOptimization';
import BackArrow from '../components/common/BackArrow';

const ItemSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const { orderFormData, updateOrderFormData } = useGlobalData();
  
  // State for the component
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [showAdded, setShowAdded] = useState(false);
  
  // Initialize progress bar scroll hook (step 2 of 4)
  const { containerRef, stepRefs } = useProgressBarScroll(2, 4);

  // Apply mobile input optimizations
  useMobileInputStyling();

  // Initialize with existing items from the current category (if any)
  useEffect(() => {
    // Load existing cart items
    if (orderFormData && orderFormData.items) {
      setSelectedItems(orderFormData.items);
      
      // Check if we already have items from this category
      if (categoryId) {
        const existingItemsFromCategory = orderFormData.items
          .filter(item => item.categoryId === parseInt(categoryId))
          .reduce((acc, item) => {
            acc[item.itemId] = item.quantity;
            return acc;
          }, {});
          
        setQuantities(existingItemsFromCategory);
      }
    }
    
    if (categoryId) {
      const foundCategory = getCategoryById(parseInt(categoryId));
      setCurrentCategory(foundCategory);
    }
  }, [categoryId, orderFormData]);

  const handleItemQuantityChange = (itemId, quantity) => {
    // Update local state
    setQuantities(prev => {
      const newItems = { ...prev };
      if (quantity > 0) {
        newItems[itemId] = quantity;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
    
    // Update global state immediately
    if (currentCategory) {
      const numericItemId = parseInt(itemId);
      updateOrderDataWithCurrentSelection(numericItemId, quantity);
    }
  };
  
  // Helper function to update order data with current selection
  const updateOrderDataWithCurrentSelection = (changedItemId, newQuantity) => {
    if (!currentCategory) return;
    
    // Get the changed item details
    const changedItem = currentCategory.items.find(i => i.id === changedItemId);
    if (!changedItem) return;
    
    // Create a copy of the current cart items
    let updatedCartItems = [...selectedItems];
    
    // Find if the item already exists in the cart
    const existingItemIndex = updatedCartItems.findIndex(
      item => item.categoryId === currentCategory.id && item.itemId === changedItemId
    );
    
    if (existingItemIndex >= 0) {
      // Item exists in cart, update its quantity or remove it
      if (newQuantity > 0) {
        updatedCartItems[existingItemIndex] = {
          ...updatedCartItems[existingItemIndex],
          quantity: newQuantity,
          totalPrice: changedItem.price * newQuantity
        };
      } else {
        // Remove the item if quantity is 0
        updatedCartItems = updatedCartItems.filter((_, index) => index !== existingItemIndex);
      }
    } else if (newQuantity > 0) {
      // Item doesn't exist in cart, add it
      updatedCartItems.push({
        categoryId: currentCategory.id,
        categoryName: currentCategory.name,
        itemId: changedItemId,
        itemName: changedItem.name,
        itemPrice: changedItem.price,
        itemDesc: changedItem.desc,
        quantity: newQuantity,
        totalPrice: changedItem.price * newQuantity
      });
    }
    
    // Calculate new total amount
    const newTotalAmount = updatedCartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Update local state
    setSelectedItems(updatedCartItems);
    setTotalAmount(newTotalAmount);
    
    // Update global state
    updateOrderFormData({
      items: updatedCartItems,
      totalAmount: newTotalAmount
    });
  };

  const getTotalItems = () => {
    return Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!currentCategory) return 0;
    return Object.entries(quantities).reduce((total, [itemId, quantity]) => {
      const item = currentCategory.items.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getTotalCartPrice = () => {
    if (!selectedItems || selectedItems.length === 0) return 0;
    return selectedItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleContinue = () => {
    // Save current selection and navigate to cart
    if (saveCurrentCategoryItems()) {
      navigate('/cart');
    }
  };

  const handleBack = () => {
    // Save current selection before navigating back
    saveCurrentCategoryItems();
    navigate('/accessories/categories');
  };

  // Save current category items to global state
  const saveCurrentCategoryItems = () => {
    // Since we're now updating the global state in real-time with handleItemQuantityChange,
    // this function only needs to check if there are any items selected and return true/false
    return Object.keys(quantities).length > 0;
  };

  if (!currentCategory) {
    return (
      <PageContainer>
        <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Category not found</h2>
            <Button onClick={() => navigate('/accessories/categories')}>
              Go back to categories
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

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
                {currentCategory.name}
              </FadeInItem>
              <FadeInItem element="p" direction="y" className="text-base sm:text-xl text-text-secondary">
                Select items and quantities for your order
              </FadeInItem>
            </div>
            <div className="hidden sm:block w-20"></div> {/* Spacer for symmetry on larger screens */}
          </div>

          {/* Progress Indicator */}
          <div ref={containerRef} className="flex items-center justify-center mb-12 overflow-x-auto pb-2 -mx-4 px-6 sm:px-8 scrollbar-thin scrollbar-thumb-border-secondary hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
            <div className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 md:space-x-4 px-8 xs:px-10 sm:px-12 py-2 bg-background-secondary rounded-lg shadow-sm min-w-[800px]">
              <div ref={stepRefs.current[0]} id="step-1" className="flex items-center cursor-pointer whitespace-nowrap pl-6 xs:pl-4" onClick={() => {
                saveCurrentCategoryItems();
                navigate('/accessories/categories');
              }}>
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                  ✓
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium hover:text-highlight-primary">Category</span>
              </div>
              <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-highlight-primary"></div>
              <div ref={stepRefs.current[1]} id="step-2" className="flex items-center whitespace-nowrap">
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-highlight-primary text-white rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm font-semibold shadow-sm">
                  2
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-primary font-medium">Items</span>
              </div>
              <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-border-secondary"></div>
              <div ref={stepRefs.current[2]} id="step-3" className="flex items-center cursor-pointer whitespace-nowrap" onClick={() => {
                saveCurrentCategoryItems();
                navigate('/order-form');
              }}>
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm shadow-sm">
                  3
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-secondary hover:text-highlight-primary">Details</span>
              </div>
              <div className="w-4 xs:w-6 sm:w-8 md:w-12 h-0.5 bg-border-secondary"></div>
              <div ref={stepRefs.current[3]} id="step-4" className="flex items-center cursor-pointer whitespace-nowrap pr-6 xs:pr-4" onClick={() => {
                saveCurrentCategoryItems();
                navigate('/order-confirmation');
              }}>
                <div className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-[10px] xs:text-xs sm:text-sm shadow-sm">
                  4
                </div>
                <span className="ml-1 xs:ml-1 sm:ml-2 text-xs xs:text-sm sm:text-base text-text-secondary hover:text-highlight-primary">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {currentCategory.items.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.02 }}
                className="h-full"
              >
                <Card className="bg-card-primary border-border-primary hover:border-border-tertiary hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Item Image Placeholder */}
                    <div className="w-full h-32 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-4xl font-bold text-gray-500">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text-primary mb-2">
                        {item.name}
                      </h3>
                      
                      <p className="text-sm text-text-secondary mb-4">
                        {item.desc}
                      </p>
                      
                      <div className="text-xl font-bold text-highlight-primary mb-4">
                        ${item.price}
                      </div>
                    </div>
                    
                    {/* Quantity Controls */}
                    <div className="flex flex-wrap items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 my-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.max(0, (quantities[item.id] || 0) - 1))}
                          disabled={!quantities[item.id]}
                          className="w-8 h-8 p-0 border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          value={quantities[item.id] || 0}
                          onChange={(e) => handleItemQuantityChange(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-12 sm:w-16 text-center font-medium"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.min(99, (quantities[item.id] || 0) + 1))}
                          className="w-8 h-8 p-0 border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {quantities[item.id] && (
                        <div className="text-sm font-semibold text-text-primary mt-2 sm:mt-0">
                          AUD {(item.price * quantities[item.id]).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary and Continue */}
          {(getTotalItems() > 0 || Object.keys(quantities).length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card-primary border border-border-primary rounded-lg p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-highlight-primary" />
                  <span className="text-lg font-semibold">Order Summary</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-text-secondary">
                    {Object.keys(quantities).length} item{Object.keys(quantities).length > 1 ? 's' : ''} in cart
                  </div>
                </div>
              </div>

              {/* Price breakdown - simplified to only show total */}
              <div className="mt-3 pt-3 border-t border-border-secondary">
                {/* Total cart value */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-highlight-primary">AUD {getTotalCartPrice().toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Buttons */}
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={() => {
                // Save current selection before navigating to categories
                saveCurrentCategoryItems();
                navigate('/accessories/categories');
              }}
              variant="outline"
              className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold flex items-center justify-center border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add Items from Other Categories</span>
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={getTotalItems() === 0}
              className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-semibold flex items-center justify-center bg-highlight-primary text-text-tertiary hover:bg-highlight-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span>Go to Cart</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          {/* Back Button */}
          <div className="flex justify-start mt-6">
            <motion.button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-card-primary/50 rounded-lg transition-all duration-200 group backdrop-blur-sm shadow-sm hover:shadow border border-border-secondary"
              whileHover={{ x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Go back to categories
            </motion.button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default ItemSelectionPage;
