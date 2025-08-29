import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CheckoutPageProps {
  setCurrentSlide: (slide: number) => void;
}

export default function CheckoutPage({ setCurrentSlide }: CheckoutPageProps) {
  const { state, clearCart } = useCart();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    classBranch: ""
  });
  const [mobileError, setMobileError] = useState("");

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: (response) => {
      clearCart();
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed successfully!",
      });
      setCurrentSlide(0); // Go back to home
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (state.items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number before submission
    if (formData.mobile.length !== 10) {
      setMobileError("Phone number must be exactly 10 digits");
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      orderId: `ORDER-${Date.now()}`,
      ...formData,
      address: "College Campus Delivery", // Default address for college delivery
      items: JSON.stringify(state.items.map(item => item.name)), // Store only product names
      total: state.total,
    };

    orderMutation.mutate(orderData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "mobile") {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '');
      
      // Limit to 10 digits
      const limitedDigits = digitsOnly.slice(0, 10);
      
      setFormData(prev => ({
        ...prev,
        [name]: limitedDigits
      }));
      
      // Validate phone number
      if (limitedDigits.length === 0) {
        setMobileError("");
      } else if (limitedDigits.length < 10) {
        setMobileError("Phone number must be 10 digits");
      } else if (limitedDigits.length === 10) {
        setMobileError("");
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="bg-arduino-blue-950 h-full flex flex-col">
      <section className="pt-20 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Checkout</h1>
            <p className="text-arduino-blue-200">Complete your order by filling out the details below</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="order-2 md:order-1">
            <h2 className="text-2xl font-semibold mb-6">Order Details</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-arduino-blue-800 border-arduino-blue-700 text-white placeholder-arduino-blue-300"
                  placeholder="Your full name"
                />
              </div>
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-400 text-xl">🏫</div>
                  <div>
                    <h3 className="font-semibold text-blue-200 mb-1">College Delivery</h3>
                    <p className="text-sm text-blue-300">
                      All deliveries will be made directly to the college campus. 
                      Please ensure you provide your correct class and branch details below.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mobile Number *</label>
                <Input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  className={`bg-arduino-blue-800 border text-white placeholder-arduino-blue-300 ${
                    mobileError ? 'border-red-500' : 'border-arduino-blue-700'
                  }`}
                  placeholder="Enter 10 digit number"
                />
                {mobileError && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <span>⚠️</span>
                    {mobileError}
                  </p>
                )}
                {formData.mobile.length === 10 && !mobileError && (
                  <p className="text-green-400 text-sm mt-1 flex items-center gap-1">
                    <span>✅</span>
                    Valid phone number
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Class/Branch *</label>
                <Input
                  type="text"
                  name="classBranch"
                  value={formData.classBranch}
                  onChange={handleChange}
                  required
                  className="bg-arduino-blue-800 border-arduino-blue-700 text-white placeholder-arduino-blue-300"
                  placeholder="e.g. ECE 3rd Year"
                />
              </div>
              <Button
                type="submit"
                disabled={orderMutation.isPending || state.items.length === 0}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {orderMutation.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </div>

          <div className="order-1 md:order-2">
            <h2 className="text-2xl font-semibold mb-6">Order Summary</h2>
            <div className="bg-arduino-blue-800/50 backdrop-blur-sm rounded-xl p-6 border border-arduino-blue-700/30">
              {state.items.length === 0 ? (
                <p className="text-arduino-blue-300">Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <span className="text-sm">{item.name} x{item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
              <hr className="border-arduino-blue-700 my-6" />
              <div className="flex justify-between items-center text-xl font-semibold">
                <span>Total Amount:</span>
                <span>₹{state.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  );
}
