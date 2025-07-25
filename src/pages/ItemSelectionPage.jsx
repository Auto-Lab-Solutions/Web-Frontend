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
  const { updateOrderFormData } = useGlobalData();
  const [selectedItems, setSelectedItems] = useState({});
  const [category, setCategory] = useState(null);

  const categoryId = parseInt(searchParams.get('category'));

  useEffect(() => {
    if (categoryId) {
      const foundCategory = getCategoryById(categoryId);
      setCategory(foundCategory);
    }
  }, [categoryId]);

  const handleItemQuantityChange = (itemId, quantity) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (quantity > 0) {
        newItems[itemId] = quantity;
      } else {
        delete newItems[itemId];
      }
      return newItems;
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

  const handleContinue = () => {
    if (Object.keys(selectedItems).length === 0) return;

    // Prepare order data for the global context
    const orderItems = Object.entries(selectedItems).map(([itemId, quantity]) => {
      const item = category.items.find(i => i.id === parseInt(itemId));
      return {
        categoryId: category.id,
        categoryName: category.name,
        itemId: item.id,
        itemName: item.name,
        itemPrice: item.price,
        itemDesc: item.desc,
        quantity: quantity,
        totalPrice: item.price * quantity
      };
    });

    updateOrderFormData({
      categoryId: category.id,
      categoryName: category.name,
      items: orderItems,
      totalAmount: getTotalPrice()
    });

    navigate('/order-form');
  };

  const handleBack = () => {
    navigate('/accessories/categories');
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
            <div className="w-20"></div> {/* Spacer for symmetry */}
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  ✓
                </div>
                <span className="ml-2 text-text-primary font-medium">Category</span>
              </div>
              <div className="w-12 h-0.5 bg-highlight-primary"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-highlight-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <span className="ml-2 text-text-primary font-medium">Items</span>
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
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <Input
                          type="number"
                          min="0"
                          max="99"
                          value={selectedItems[item.id] || 0}
                          onChange={(e) => handleItemQuantityChange(item.id, Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 text-center"
                        />
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleItemQuantityChange(item.id, Math.min(99, (selectedItems[item.id] || 0) + 1))}
                          className="w-8 h-8 p-0"
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
          {getTotalItems() > 0 && (
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
                    {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} selected
                  </div>
                  <div className="text-xl font-bold text-highlight-primary">
                    ${getTotalPrice().toFixed(2)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Continue Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleContinue}
              disabled={getTotalItems() === 0}
              className="px-8 py-3 text-lg font-semibold flex items-center space-x-2"
            >
              <span>Continue to Order Form</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
};

export default ItemSelectionPage;
