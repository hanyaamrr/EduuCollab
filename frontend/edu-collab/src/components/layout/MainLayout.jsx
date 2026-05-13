import { Outlet } from 'react-router-dom';
import BottomDockNav from './BottomDockNav';

const MainLayout = () => {
    return (
        <div className="min-h-screen pb-24">
            <Outlet />

            <BottomDockNav />
        </div>
    );
};

export default MainLayout;