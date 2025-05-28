
import '../../styles/global.css';
import '../../styles/formBase.css';
import { useNavigate } from 'react-router-dom';
import FormField from '../../components/FormField/FormField.tsx';

function MyAccountPage() {
    const navigate = useNavigate();

    return (
        <>
            <button className="back-icon" onClick={() => navigate(-1)}>
                &#8249;
            </button>

            <div className="container">
                <header className="header">
                    <h1>MOJE KONTO</h1>
                </header>

                <section>
                    <form>
                        <FormField
                            label="Imię i nazwisko"
                            name="name"
                            placeholder="Jan Kowalski"
                        />
                        <FormField
                            label="Email"
                            name="email"
                            type="email"
                            placeholder="jan.kowalski@example.com"
                        />
                        <FormField
                            label="Nowe hasło"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                        />

                        <br />
                        <button type="submit" id="btn">Zapisz zmiany</button>
                    </form>
                </section>

                <section>
                    <h2>Subskrypcja</h2>
                    <p>Twoja obecna subskrypcja: <strong>Premium</strong></p>
                    <button type="button" id="btn-outline">Zarządzaj subskrypcją</button>
                </section>
            </div>
        </>
    );
}

export default MyAccountPage;
