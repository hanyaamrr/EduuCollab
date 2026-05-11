import * as signalR from "@microsoft/signalr";

const notificationConnection = new signalR.HubConnectionBuilder()
    .withUrl("https://localhost:5001/hubs/notifications", {
        accessTokenFactory: () => {
            return localStorage.getItem("token");
        }
    })
    .withAutomaticReconnect()
    .build();

export default notificationConnection;