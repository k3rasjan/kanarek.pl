import '../../components/Map/Map.tsx'
import {Link } from "react-router-dom";

function Home() {
    return (
        <>
            <header>Strona główna</header>
            <section>
                <Link to="/login">Zaloguj się</Link>
                <Link to="/register">Zarejestruj się</Link>
            </section>
        </>
    )
}
export default Home
