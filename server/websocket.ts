import { WebSocket, WebSocketServer } from "ws";
import type { Server } from "http";

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("New WebSocket connection");

    ws.on("close", () => {
      console.log("WebSocket connection closed");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });
}

export function broadcast(message: any) {
  if (!wss) {
    console.warn("WebSocket server not initialized");
    return;
  }

  const data = JSON.stringify(message);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}
