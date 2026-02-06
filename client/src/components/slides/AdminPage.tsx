import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Order, Contact } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface AdminPageProps {
  setCurrentSlide: (slide: number) => void;
}

export default function AdminPage({ setCurrentSlide }: AdminPageProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading: ordersLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    enabled: isLoggedIn,
  });

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: isLoggedIn,
  });

  useEffect(() => {
    if (!isLoggedIn) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "new_order") {
        toast({
          title: "New Order Received!",
          description: `Order #${message.order.orderId} from ${message.order.fullName}`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      }
    };

    return () => {
      ws.close();
    };
  }, [isLoggedIn, queryClient, toast]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Status updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest("DELETE", `/api/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order deleted",
        description: "Order has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete order. Make sure it's marked as completed.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "soham11") {
      setIsLoggedIn(true);
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Invalid password",
        description: "Please enter the correct admin password.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
  };

  const handleStatusToggle = (order: Order) => {
    const newStatus = order.status === "completed" ? "pending" : "completed";
    updateStatusMutation.mutate({ orderId: order.orderId, status: newStatus });
  };

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="bg-arduino-blue-950">
        <section>
          <div className="max-w-md mx-auto px-4">
            <div className="bg-arduino-blue-800/50 backdrop-blur-sm rounded-xl p-8 border border-arduino-blue-700/30">
            <h1 className="text-3xl font-bold text-center mb-8">Admin Access</h1>
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-arduino-blue-900 border-arduino-blue-700 text-white placeholder-arduino-blue-300"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-arduino-blue-500 to-arduino-blue-600 hover:from-arduino-blue-600 hover:to-arduino-blue-700"
              >
                Login
              </Button>
            </form>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="bg-arduino-blue-950">
      <section>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 px-4">Admin Panel</h1>
          <p className="text-arduino-blue-200 px-4">Manage orders and track deliveries</p>
        </div>

        <div className="bg-arduino-blue-800/50 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-arduino-blue-700/30">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
            <h2 className="text-xl sm:text-2xl font-semibold">Admin Panel</h2>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Logout
            </Button>
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-arduino-blue-700">
              <TabsTrigger value="orders" className="data-[state=active]:bg-arduino-blue-500">Orders</TabsTrigger>
              <TabsTrigger value="contacts" className="data-[state=active]:bg-arduino-blue-500">Contact Messages</TabsTrigger>
            </TabsList>
            
            <TabsContent value="orders" className="mt-4 sm:mt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Orders Management</h3>
              {ordersLoading ? (
                <div className="text-center py-8">
                  <p className="text-arduino-blue-300">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-arduino-blue-300">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-arduino-blue-700">
                          <th className="text-left py-3 px-4">Order ID</th>
                          <th className="text-left py-3 px-4">Customer</th>
                          <th className="text-left py-3 px-4">Items</th>
                          <th className="text-left py-3 px-4">Total</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order: Order) => {
                          // Handle both old format (objects) and new format (strings)
                          let itemsText = "";
                          if (typeof order.items === 'string') {
                            try {
                              const parsedItems = JSON.parse(order.items);
                              if (Array.isArray(parsedItems)) {
                                // New format: array of strings
                                itemsText = parsedItems.join(", ");
                              } else {
                                // Old format: array of objects
                                itemsText = parsedItems.map((item: any) => `${item.name} (${item.quantity})`).join(", ");
                              }
                            } catch {
                              itemsText = order.items; // Fallback to raw string
                            }
                          } else if (Array.isArray(order.items)) {
                            // Direct array format
                            itemsText = (order.items as any[]).map((item: any) => 
                              typeof item === 'string' ? item : `${item.name} (${item.quantity})`
                            ).join(", ");
                          }
                          
                          return (
                            <tr key={order.id} className="border-b border-arduino-blue-800">
                              <td className="py-3 px-4 font-mono text-sm">{order.orderId}</td>
                              <td className="py-3 px-4">
                                <div className="font-medium">{order.fullName}</div>
                                <div className="text-sm text-arduino-blue-300">{order.mobile}</div>
                              </td>
                              <td className="py-3 px-4 text-sm max-w-xs truncate" title={itemsText}>
                                {itemsText}
                              </td>
                              <td className="py-3 px-4 font-semibold">₹{order.total}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs text-white ${
                                  order.status === "completed" ? "bg-green-600" : "bg-yellow-600"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    checked={order.status === "completed"}
                                    onCheckedChange={() => handleStatusToggle(order)}
                                    className="border-arduino-blue-600 data-[state=checked]:bg-arduino-blue-500"
                                  />
                                  {order.status === "completed" && (
                                    <Button
                                      onClick={() => handleDeleteOrder(order.orderId)}
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    >
                                      🗑️
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {orders.map((order: Order) => {
                      // Handle both old format (objects) and new format (strings)
                      let itemsText = "";
                      if (typeof order.items === 'string') {
                        try {
                          const parsedItems = JSON.parse(order.items);
                          if (Array.isArray(parsedItems)) {
                            // New format: array of strings
                            itemsText = parsedItems.join(", ");
                          } else {
                            // Old format: array of objects
                            itemsText = parsedItems.map((item: any) => `${item.name} (${item.quantity})`).join(", ");
                          }
                        } catch {
                          itemsText = order.items; // Fallback to raw string
                        }
                      } else if (Array.isArray(order.items)) {
                        // Direct array format
                        itemsText = (order.items as any[]).map((item: any) => 
                          typeof item === 'string' ? item : `${item.name} (${item.quantity})`
                        ).join(", ");
                      }
                      
                      return (
                        <div key={order.id} className="bg-arduino-blue-700/30 rounded-lg p-4 border border-arduino-blue-600/30">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="font-semibold">{order.fullName}</h4>
                              <p className="text-sm text-arduino-blue-300">{order.mobile}</p>
                              <p className="text-xs text-arduino-blue-400 font-mono break-all">{order.orderId}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">₹{order.total}</p>
                              <span className={`px-2 py-1 rounded-full text-xs text-white ${
                                order.status === "completed" ? "bg-green-600" : "bg-yellow-600"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-arduino-blue-300">Items: {itemsText}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={order.status === "completed"}
                                onCheckedChange={() => handleStatusToggle(order)}
                                className="border-arduino-blue-600 data-[state=checked]:bg-arduino-blue-500"
                              />
                              <span className="text-sm">Mark as completed</span>
                            </div>
                            {order.status === "completed" && (
                              <Button
                                onClick={() => handleDeleteOrder(order.orderId)}
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                🗑️ Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="mt-4 sm:mt-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Contact Messages</h3>
              {contactsLoading ? (
                <div className="text-center py-8">
                  <p className="text-arduino-blue-300">Loading messages...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-arduino-blue-300">No contact messages yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-arduino-blue-700">
                          <th className="text-left py-3 px-4">Sender</th>
                          <th className="text-left py-3 px-4">Message</th>
                          <th className="text-left py-3 px-4">Received At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact: Contact) => (
                          <tr key={contact.id} className="border-b border-arduino-blue-800">
                            <td className="py-3 px-4">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-arduino-blue-300">{contact.email}</div>
                            </td>
                            <td className="py-3 px-4 text-sm max-w-md">
                              <p className="whitespace-pre-wrap">{contact.message}</p>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {new Date(contact.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="lg:hidden space-y-4">
                    {contacts.map((contact: Contact) => (
                      <div key={contact.id} className="bg-arduino-blue-700/30 rounded-lg p-4 border border-arduino-blue-600/30">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold">{contact.name}</h4>
                            <p className="text-sm text-arduino-blue-300 break-all">{contact.email}</p>
                          </div>
                          <span className="text-xs text-arduino-blue-400 text-right">
                            {new Date(contact.createdAt).toLocaleDateString()} {new Date(contact.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="bg-arduino-blue-800/50 rounded p-3 mt-3">
                          <p className="text-sm whitespace-pre-wrap">{contact.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </section>
      
    </div>
  );
}
