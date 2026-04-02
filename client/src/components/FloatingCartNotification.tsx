import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

interface FloatingCartNotificationProps {
  isVisible: boolean;
  itemName: string;
  quantity: number;
}

export default function FloatingCartNotification({ 
  isVisible, 
  itemName, 
  quantity 
}: FloatingCartNotificationProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.5, 
            y: 50,
            x: "50vw"
          }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: "calc(50vw - 100px)"
          }}
          exit={{ 
            opacity: 0, 
            scale: 0.5, 
            y: -50,
            x: "50vw"
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg border border-green-400"
        >
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{
                repeat: 2,
                repeatType: "reverse",
                duration: 0.3
              }}
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
            <div>
              <div className="font-semibold text-sm">Added to Cart!</div>
              <div className="text-xs opacity-90">
                {quantity}x {itemName}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 