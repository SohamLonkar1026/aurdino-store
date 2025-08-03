import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export default function Cart({ isOpen, onClose, onCheckout }: CartProps) {
  const { state, removeItem, updateQuantity } = useCart();

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Cart Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-arduino-blue-900 z-50 transform transition-transform duration-300 shadow-2xl ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 border-b border-arduino-blue-800">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Shopping Cart</h2>
            <button 
              onClick={onClose}
              className="text-arduino-blue-300 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto max-h-[calc(100vh-200px)]">
          {state.items.length === 0 ? (
            <p className="text-arduino-blue-300 text-center">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3 border-b border-arduino-blue-800 last:border-b-0">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-arduino-blue-300 text-sm">₹{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-arduino-blue-800 rounded">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-arduino-blue-300 hover:text-white text-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 text-white text-sm min-w-[2rem] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-arduino-blue-300 hover:text-white text-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-arduino-blue-800">
          <div className="mb-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total: ₹{state.total}</span>
            </div>
          </div>
          <Button 
            onClick={() => {
              if (onCheckout) {
                onCheckout();
              }
              onClose();
            }}
            disabled={state.items.length === 0}
            className="w-full bg-gradient-to-r from-arduino-blue-500 to-arduino-blue-600 hover:from-arduino-blue-600 hover:to-arduino-blue-700"
          >
            Checkout
          </Button>
        </div>
      </div>
    </>
  );
}
