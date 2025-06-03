import './MapPage.css';
import Map from '../../components/Map/Map';
import { useState } from 'react';
import { Link } from 'react-router-dom';


const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
};


export default function MapPage() {
    const [showMenu, setShowMenu] = useState(false);
    const toggleMenu = () => setShowMenu(prev => !prev);
    return (
        <div className="map-page-container">
            <Map/>

            <aside className="feed-panel">
                <h2>Ostatnie zgłoszenia</h2>
                <ul className="feed-list">
                </ul>
            </aside>

            <Link to="/zgloszenie" className="report-button">!</Link>
            <div className="user-menu">
                <button className="user-icon" onClick={() => toggleMenu()}>
                    👤
                </button>
                {showMenu && (
                    <div className="user-dropdown">
                        <ul>
                            <li><Link to="/moje-konto">Moje konto</Link></li>
                            <li>
                                <button onClick={handleLogout}>Wyloguj</button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
