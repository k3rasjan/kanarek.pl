import './MapPage.css';
import Map from '../../components/Map/Map';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const mockReports = [
    {
        id: 1,
        location: [52.3925, 16.9357] as [number, number],
        description: 'Kanar na Górczynie',
        timestamp: '2025-05-22 12:30',
    },
    {
        id: 2,
        location: [52.3991, 16.9234] as [number, number],
        description: 'Kanar na Hetmańskiej',
        timestamp: '2025-05-22 12:10',
    },
];

const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
};


export default function MapPage() {
    const [showMenu, setShowMenu] = useState(false);
    const toggleMenu = () => setShowMenu(prev => !prev);
    return (
        <div className="map-page-container">
            <Map reports={mockReports}/>

            <aside className="feed-panel">
                <h2>Ostatnie zgłoszenia</h2>
                <ul className="feed-list">
                    {mockReports.map((report) => (
                        <li key={report.id}>
                            <strong>{report.description}</strong>
                            <br/>
                            <small>{report.timestamp}</small>
                        </li>
                    ))}
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
