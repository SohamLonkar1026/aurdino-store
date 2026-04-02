import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Check, ShoppingCart } from "lucide-react";
import { Product } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import FloatingCartNotification from "./FloatingCartNotification";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFloatingNotification, setShowFloatingNotification] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    // Add item to cart
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
    }, quantity);
    
    // Show success animation
    setShowSuccess(true);
    setShowFloatingNotification(true);
    setQuantity(1);
    
    // Reset states after animation
    setTimeout(() => {
      setIsAdding(false);
      setShowSuccess(false);
    }, 1500);
    
    // Hide floating notification after 3 seconds
    setTimeout(() => {
      setShowFloatingNotification(false);
    }, 3000);
  };

  // Use consistent design for all products
  return (
    <motion.div 
      className="bg-arduino-blue-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-arduino-blue-700/30 hover:bg-arduino-blue-800/70 transition-all relative overflow-hidden"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="text-center mb-4">
        <div className="text-2xl sm:text-3xl mb-3">{product.icon}</div>
        <h3 className="font-semibold text-xs sm:text-sm mb-2 leading-tight">{product.name}</h3>
        {product.originalPrice && (
          <div className="mb-2">
            <span className="text-xs text-arduino-blue-400 line-through">₹{product.originalPrice}</span>
          </div>
        )}
        <p className="text-lg sm:text-xl font-bold text-arduino-blue-300 mb-3">₹{product.price}</p>
        {product.description && (
          <p className="text-xs text-arduino-blue-300 mb-2">{product.description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-arduino-blue-600 rounded-lg text-sm">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-1 text-white hover:bg-arduino-blue-700 rounded-l-lg transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="px-2 sm:px-3 py-1 bg-arduino-blue-700 text-white min-w-[2rem] text-center text-xs sm:text-sm">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="p-1 text-white hover:bg-arduino-blue-700 rounded-r-lg transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          {showSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-1.5 px-3 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Check className="w-3 h-3" />
              Added!
            </motion.div>
          ) : (
            <motion.div
              key="button"
              initial={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="flex-1 bg-arduino-blue-500 hover:bg-arduino-blue-600 text-xs sm:text-sm py-1.5 relative overflow-hidden"
              >
                <AnimatePresence>
                  {isAdding && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      style={{
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                        animation: 'shimmer 0.8s ease-in-out'
                      }}
                    />
                  )}
                </AnimatePresence>
                <span className="flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" />
                  {isAdding ? 'Adding...' : 'Add'}
                </span>
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <FloatingCartNotification
        isVisible={showFloatingNotification}
        itemName={product.name}
        quantity={quantity}
      />
    </motion.div>
  );
}
