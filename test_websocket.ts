import WebSocket from "ws";

const WS_URL = "ws://localhost:5000/ws";
const API_URL = "http://localhost:5000/api/orders";

const ws = new WebSocket(WS_URL);

ws.on("open", async () => {
  console.log("Connected to WebSocket");

  // Create an order
  const orderData = {
    orderId: `TEST-${Date.now()}`,
    fullName: "Test User",
    address: "123 Test St",
    mobile: "1234567890",
    classBranch: "Test Branch",
    items: JSON.stringify(["Test Item 1", "Test Item 2"]),
    total: 100,
    status: "pending"
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    if (response.ok) {
      console.log("Order created successfully");
    } else {
      console.error("Failed to create order:", await response.text());
      ws.close();
    }
  } catch (error) {
    console.error("Error creating order:", error);
    ws.close();
  }
});

ws.on("message", (data) => {
  const message = JSON.parse(data.toString());
  console.log("Received WebSocket message:", message);
  if (message.type === "new_order") {
    console.log("Success: Received new_order notification");
    ws.close();
    process.exit(0);
  }
});

ws.on("error", (error) => {
  console.error("WebSocket error:", error);
  process.exit(1);
});
