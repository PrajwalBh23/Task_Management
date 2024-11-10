import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import LoginDialog from './Loginbox';
import './Styles/style.css';

const Home: React.FC = () => {
    const { user, logout } = useAuth();
    const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);
    const [isRegistering, setIsRegistering] = useState<boolean>(false);

    const handleLoginClick = () => {
        setIsRegistering(false);
        setLoginDialogOpen(true);
    };

    const handleRegisterClick = () => {
        setIsRegistering(true);
        setLoginDialogOpen(true);
    };

    const handleLogout = () => {
        logout();
    };

    const handleCloseLoginBox = () => {
        setLoginDialogOpen(false);
    };

    return (
        <div className="landing">
            <h1>Welcome To Task Management Project</h1>
            <div className="btn-group">
                {user ? (
                    <div className="display_column">
                        <span className='btn-group'>
                            {`Hello, ${user.name || 'User'} your`}
                            <a href='/task' style={{ textDecoration: 'none', color: 'white', border: '1px solid white', borderRadius: '8px', padding: '8px' }}>
                                Task
                            </a>
                        </span>
                        <button className="btn btn-outline" onClick={handleLogout}>Log out</button>
                    </div>
                ) : (
                    <>
                        <button className="btn btn-outline" onClick={handleLoginClick}>Log in</button>
                        <button className="btn btn-outline" onClick={handleRegisterClick}>Sign up</button>
                    </>
                )}
            </div>
            {loginDialogOpen && (
                <LoginDialog
                    open={loginDialogOpen}
                    handleClose={handleCloseLoginBox}
                    setOpen={setLoginDialogOpen}
                    isRegistering={isRegistering}
                />
            )}
        </div>
    );
};

export default Home;
