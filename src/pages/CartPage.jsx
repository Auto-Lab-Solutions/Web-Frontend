import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGlobalData } from '../components/contexts/GlobalDataContext';
import PageContainer from '../components/common/PageContainer';
import FadeInItem from '../components/common/FadeInItem';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, ArrowRight, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { Input } from '../components/ui/input';
import { getCategoryById, getItemById } from '../meta/menu';

const CartPage = () => {
  const navigate = useNavigate();
  const { orderFormData, updateOrderFormData } = useGlobalData();
  const [cartItems, setCartItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Initialize cart items from global state
  useEffect(() => {
    if (orderFormData && orderFormData.items) {
      setCartItems(orderFormData.items);
      
      // Initialize quantities state for easy updates
      const quantityMap = {};
      orderFormData.items.forEach(item => {
        const key = `${item.categoryId}-${item.itemId}`;
        quantityMap[key] = item.quantity;
      });
      
      setQuantities(quantityMap);
      setTotalAmount(orderFormData.totalAmount || 0);
    } else {
      // If there are no items, initialize as empty array
      setCartItems([]);
      setQuantities({});
      setTotalAmount(0);
    }
  }, [orderFormData]);

  // Group items by category
  const itemsByCategory = cartItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = {
        categoryId: item.categoryId,
        categoryName: item.categoryName,
        items: []
      };
    }
    acc[item.categoryId].items.push(item);
    return acc;
  }, {});

  const handleQuantityChange = (categoryId, itemId, newQuantity) => {
    const key = `${categoryId}-${itemId}`;
    
    // Update quantities state
    setQuantities(prev => ({
      ...prev,
      [key]: Math.max(0, newQuantity)
    }));
    
    // Update cart items with new quantity
    const updatedItems = cartItems.map(item => {
      if (item.categoryId === categoryId && item.itemId === itemId) {
        return {
          ...item,
          quantity: Math.max(0, newQuantity),
          totalPrice: item.itemPrice * Math.max(0, newQuantity)
        };
      }
      return item;
    }).filter(item => item.quantity > 0); // Remove items with quantity 0
    
    setCartItems(updatedItems);
    
    // Calculate new total
    const newTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotalAmount(newTotal);
    
    // Update global state
    updateOrderFormData({
      ...orderFormData,
      items: updatedItems,
      totalAmount: newTotal
    });
  };

  const handleRemoveItem = (categoryId, itemId) => {
    const updatedItems = cartItems.filter(
      item => !(item.categoryId === categoryId && item.itemId === itemId)
    );
    
    setCartItems(updatedItems);
    
    // Calculate new total
    const newTotal = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    setTotalAmount(newTotal);
    
    // Update global state
    updateOrderFormData({
      ...orderFormData,
      items: updatedItems,
      totalAmount: newTotal
    });
  };

  const handleAddMoreItems = () => {
    navigate('/accessories/categories');
  };

  const handleProceedToCheckout = () => {
    navigate('/order-form');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // If cart is empty, redirect to categories
  useEffect(() => {
    let isMounted = true;
    
    // Check if cart is empty
    if (isMounted && cartItems.length === 0) {
      // Navigate to categories page with a short delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        if (isMounted) {
          navigate('/accessories/categories');
        }
      }, 300);
      
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [cartItems, navigate]);

  return (
    <PageContainer>
      <div className="bg-background-primary text-text-primary min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
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
                Your Cart
              </FadeInItem>
              <FadeInItem element="p" direction="y" className="text-xl text-text-secondary">
                Review and update your selected items
              </FadeInItem>
            </div>
            <div className="w-20"></div> {/* Spacer for symmetry */}
          </div>

          {/* Cart Contents */}
          <div className="space-y-8 mb-12">
            {Object.values(itemsByCategory).map((category) => (
              <Card key={category.categoryId} className="bg-card-primary border-border-primary">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-text-primary">{category.categoryName}</h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/accessories/items?category=${category.categoryId}`)}
                      className="text-highlight-primary border-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                    >
                      Edit Items
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {category.items.map((item) => {
                      const itemKey = `${item.categoryId}-${item.itemId}`;
                      const currentQuantity = quantities[itemKey] || item.quantity;
                      
                      return (
                        <div 
                          key={item.itemId}
                          className="flex items-center justify-between p-4 bg-background-secondary rounded-lg border border-border-secondary"
                        >
                          <div className="flex-1">
                            <h3 className="font-medium text-text-primary">{item.itemName}</h3>
                            <p className="text-sm text-text-secondary">{item.itemDesc}</p>
                            <p className="text-sm font-medium text-highlight-primary">${item.itemPrice.toFixed(2)} each</p>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8 border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                                onClick={() => handleQuantityChange(item.categoryId, item.itemId, currentQuantity - 1)}
                                disabled={currentQuantity <= 1}
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              
                              <Input
                                type="number"
                                min="1"
                                value={currentQuantity}
                                onChange={(e) => handleQuantityChange(
                                  item.categoryId, 
                                  item.itemId, 
                                  parseInt(e.target.value) || 0
                                )}
                                className="w-16 text-center font-medium"
                              />
                              
                              <Button
                                variant="outline"
                                size="icon"
                                className="w-8 h-8 border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-200"
                                onClick={() => handleQuantityChange(item.categoryId, item.itemId, currentQuantity + 1)}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="text-right min-w-[100px]">
                              <div className="font-semibold text-text-primary">
                                ${(item.itemPrice * currentQuantity).toFixed(2)}
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              onClick={() => handleRemoveItem(item.categoryId, item.itemId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Cart Summary */}
          <Card className="mb-8 bg-card-primary border-border-primary">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-border-secondary">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-highlight-primary">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleAddMoreItems}
              className="flex items-center justify-center border-highlight-primary text-highlight-primary hover:bg-highlight-primary/10 transition-all duration-300 px-6 py-3 text-lg font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add More Items</span>
            </Button>
            
            <Button
              onClick={handleProceedToCheckout}
              className="flex items-center justify-center bg-highlight-primary text-text-tertiary hover:bg-highlight-primary/90 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 px-6 py-3 text-lg font-semibold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default CartPage;
