import { createContext, useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        // Only connect if a user is logged in
        if (user) {
            const token = localStorage.getItem('token'); // Grab your JWT token

            const connect = new HubConnectionBuilder()
                .withUrl("http://localhost:5129/notifications", {
                    // This securely passes the JWT to your C# Hub so it knows who is connecting
                    accessTokenFactory: () => token
                })
                .configureLogging(LogLevel.Information)
                .withAutomaticReconnect()
                .build();

            connect.start()
                .then(() => {
                    console.log("Connected to SignalR Notification Hub!");

                    // THIS IS WHERE IT LISTENS FOR YOUR BACKGROUND WORKER!
                    connect.on("ReceiveNotification", (title, message) => {
                        // Pop up a beautiful real-time toast
                        toast.success(
                            <div>
                                <strong>{title}</strong>
                                <p className="text-sm mt-1">{message}</p>
                            </div>,
                            { duration: 8000, position: 'top-right' }
                        );
                    });
                })
                .catch(err => console.error("SignalR Connection Error: ", err));

            setConnection(connect);

            // Cleanup connection when the user logs out or leaves
            return () => {
                if (connect) connect.stop();
            };
        }
    }, [user]);

    return (
        <NotificationContext.Provider value={{ connection }}>
            {children}
        </NotificationContext.Provider>
    );
};