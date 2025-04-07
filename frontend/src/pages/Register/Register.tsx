import { Link } from "react-router-dom";
import FormField from '../../components/FormField/FormField.tsx';
import '../../styles/global.css';
import '../../styles/formBase.css';

function Register() {
    return (
        <>
            <div className="container">
                <header className="header">
                    <h1>UTWÓRZ KONTO</h1>
                </header>
                <section>
                    <form>
                        <FormField
                            label="Nazwa użytkownika"
                            name="accname"
                            placeholder="Wprowadź nazwę użytkownika"
                        />
                        <FormField
                            label="E-mail"
                            type="email"
                            name="email"
                            placeholder="Wprowadź swój e-mail"
                        />
                        <FormField
                            label="Hasło"
                            type="password"
                            name="password"
                            placeholder="Wprowadź swoje hasło"
                        />
                        <FormField
                            label="Powtórz hasło"
                            type="password"
                            name="password2"
                            placeholder="Powtórz hasło"
                        />
                        <button type="submit" id="btn">STWÓRZ KONTO</button>
                    </form>
                    <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: '1rem' }}>
                        Posiadasz już konto? <Link to="/Login">Zaloguj się</Link>
                    </p>
                </section>
            </div>
        </>
    );
}

export default Register;
