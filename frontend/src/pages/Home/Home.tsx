import '../../components/Map/Map.tsx'
import {Link } from "react-router-dom";

function Home() {
    return (
        <>
            <header>Strona główna</header>
            <section>
                <Link to="/login">Zaloguj się</Link><br/>
                <Link to="/register">Zarejestruj się</Link><br/>
                <Link to='/zglos-kanara'>Zgłoś kanarka!11!!!!!!!!!!!!</Link>
            </section>
        </>
    )
}
export default Home
