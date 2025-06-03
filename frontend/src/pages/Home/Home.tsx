import { Link } from "react-router-dom";
import './Home.css';

export default function Home() {
    return (

        <div className="home-container">
            <header className="home-header">
                <h1>Kanarek AI</h1>
                <p>Twoje ostrzeżenia o kontrolerach biletów</p>
            </header>

            <main className="home-main">
                <Link to="/login" className="home-button primary">Zaloguj się</Link>
                <Link to="/register" className="home-button secondary">Zarejestruj się</Link>
                <Link to="/mapa" className="home-button map">Zobacz mapę zagrożeń</Link>
            </main>

            <footer className="home-footer">
                &copy; 2025 Kanarek.pl – powered by AI
            </footer>
        </div>
    );

}
