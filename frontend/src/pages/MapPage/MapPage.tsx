import './MapPage.css';
import Map from '../../components/Map/Map';
import { useState } from 'react';

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

            <button className="report-button" title="Zgłoś kontrolę">!</button>
            <div className="user-menu">
                <button className="user-icon" onClick={() => toggleMenu()}>
                    👤
                </button>
                {showMenu && (
                    <div className="user-dropdown">
                        <ul>
                            <li><a href="#">Moje konto</a></li>
                            <li><a href="#">Wyloguj</a></li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
