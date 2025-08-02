import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, ArrowRight, Plus, Minus, ShoppingCart } from 'lucide-react';
import { categories, getCategoryById } from '../meta/menu';

const ItemSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { orderFormData, updateOrderFormData } = useGlobalData();
  const [selectedItems, setSelectedItems] = useState({});
  const [category, setCategory] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [currentCartItems, setCurrentCartItems] = useState([]);

  const categoryId = parseInt(searchParams.get('category'));

  // Initialize with existing items from the current category (if any)
  useEffect(() => {
    // Load existing cart items
    if (orderFormData && orderFormData.items) {
      setCurrentCartItems(orderFormData.items);
      setCartItemsCount(orderFormData.items.length);
      
      // Check if we already have items from this category
      if (categoryId) {
        const existingItemsFromCategory = orderFormData.items
          .filter(item => item.categoryId === categoryId)
          .reduce((acc, item) => {
            acc[item.itemId] = item.quantity;
            return acc;
          }, {});
          
        setSelectedItems(existingItemsFromCategory);
      }
    }
    
    if (categoryId) {
      const foundCategory = getCategoryById(categoryId);
      setCategory(foundCategory);
    }
  }, [categoryId, orderFormData]);

  const handleItemQuantityChange = (itemId, quantity) => {
    // Update local state
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (quantity > 0) {
        newItems[itemId] = quantity;
      } else {
        delete newItems[itemId];
      }
      return newItems;
    });
    
    // Update global state immediately
    if (category) {
      const numericItemId = parseInt(itemId);
      updateOrderDataWithCurrentSelection(numericItemId, quantity);
    }
  };
  
  // Helper function to update order data with current selection
  const updateOrderDataWithCurrentSelection = (changedItemId, newQuantity) => {
    if (!category) return;
    
    // Get the changed item details
    const changedItem = category.items.find(i => i.id === changedItemId);
    if (!changedItem) return;
    
    // Create a copy of the current cart items
    let updatedCartItems = [...currentCartItems];
    
    // Find if the item already exists in the cart
    const existingItemIndex = updatedCartItems.findIndex(
      item => item.categoryId === category.id && item.itemId === changedItemId
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
        categoryId: category.id,
        categoryName: category.name,
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
    setCurrentCartItems(updatedCartItems);
    setCartItemsCount(updatedCartItems.length);
    
    // Update global state
    updateOrderFormData({
      items: updatedCartItems,
      totalAmount: newTotalAmount
    });
  };

  const getTotalItems = () => {
    return Object.values(selectedItems).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    if (!category) return 0;
    return Object.entries(selectedItems).reduce((total, [itemId, quantity]) => {
      const item = category.items.find(i => i.id === parseInt(itemId));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  };

  const getTotalCartPrice = () => {
    if (!currentCartItems || currentCartItems.length === 0) return 0;
    return currentCartItems.reduce((total, item) => total + item.totalPrice, 0);
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
    return Object.keys(selectedItems).length > 0;
  };

  if (!category) {
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
                {category.name}
              </FadeInItem>
              <FadeInItem element="p" direction="y" className="text-xl text-text-secondary">
                Select items and quantities for your order
              </FadeInItem>
            </div>
            {cartItemsCount > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate('/cart')}
                className="flex items-center space-x-2 text-highlight-primary border-highlight-primary hover:bg-highlight-primary/10 transition-all duration-300"
              >
                <ShoppingCart className="w-4 h-4 mr-1" />
                <span>Cart ({cartItemsCount})</span>
              </Button>
            )}
            {cartItemsCount === 0 && <div className="w-20"></div>} {/* Spacer for symmetry */}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-3 sm:space-x-4 px-4 py-2 bg-background-secondary rounded-lg shadow-sm">
              <div className="flex items-center cursor-pointer" onClick={() => {
                saveCurrentCategoryItems();
                navigate('/accessories/categories');
              }}>
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                  ✓
                </div>
                <span className="ml-2 text-text-primary font-medium hover:text-highlight-primary">Category</span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-highlight-primary"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-highlight-primary text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-sm">
                  2
                </div>
                <span className="ml-2 text-text-primary font-medium">Items</span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-border-secondary"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-sm shadow-sm">
                  3
                </div>
                <span className="ml-2 text-text-secondary">Details</span>
              </div>
              <div className="w-8 sm:w-12 h-0.5 bg-border-secondary"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-border-secondary text-text-secondary rounded-full flex items-center justify-center text-sm shadow-sm">
                  4
                </div>
                <span className="ml-2 text-text-secondary">Confirmation</span>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {category.items.map((item) => (
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.max(0, (selectedItems[item.id] || 0) - 1))}
                          disabled={!selectedItems[item.id]}
                          className="w-8 h-8 p-0 border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          value={selectedItems[item.id] || 0}
                          onChange={(e) => handleItemQuantityChange(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 text-center font-medium"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.min(99, (selectedItems[item.id] || 0) + 1))}
                          className="w-8 h-8 p-0 border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {selectedItems[item.id] && (
                        <div className="text-sm font-semibold text-text-primary">
                          ${(item.price * selectedItems[item.id]).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Summary and Continue */}
          {(getTotalItems() > 0 || cartItemsCount > 0) && (
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
                    {cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} in cart
                  </div>
                </div>
              </div>

              {/* Price breakdown - simplified to only show total */}
              <div className="mt-3 pt-3 border-t border-border-secondary">
                {/* Total cart value */}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-highlight-primary">${getTotalCartPrice().toFixed(2)}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => {
                // Save current selection before navigating to categories
                saveCurrentCategoryItems();
                navigate('/accessories/categories');
              }}
              variant="outline"
              className="px-6 py-3 text-lg font-semibold flex items-center border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add Items from Other Categories</span>
            </Button>
            
            <Button
              onClick={handleContinue}
              disabled={getTotalItems() === 0}
              className="px-6 py-3 text-lg font-semibold flex items-center bg-highlight-primary text-text-tertiary hover:bg-highlight-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span>Go to Cart</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default ItemSelectionPage;
