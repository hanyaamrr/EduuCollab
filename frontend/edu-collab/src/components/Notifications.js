function Notifications() {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        notificationConnection.start()
        .then(() => {
            console.log("Connected to NotificationHub");
            notificationConnection.on(
                "ReceiveNotification",
                (title, message) => {
                    setNotifications(prev => [
                        ...prev,
                        {title, message, time: new Date()}
                    ]);
                }
            );
        })
        .catch(error => console.error("SignalR Error: ", error));

        return () => {
            notificationConnection.off("ReceiveNotification");
        };
    }, []);

    return (
        <div>
            <h2>Notifications</h2>
            {notifications.length === 0 && <p>No notifications yet.</p>}
            <ul>
                {notifications.map((n, index) => (
                    <li key={index}>
                        <strong>{n.title}</strong>
                        <br />
                        {n.message}
                        <br />
                        <small>{n.time.toLocaleTimeString()}</small>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Notifications;