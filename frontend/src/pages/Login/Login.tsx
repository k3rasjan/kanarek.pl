import styles from  './Login.module.css';
import '../../styles/global.css';
import '../../styles/formBase.css'
import { Link } from "react-router-dom";
import FormField from '../../components/FormField/FormField.tsx';

function Login() {
    return (
        <>
            <div className="container">
                <header className="header">
                    <h1>WITAMY NA KANAREK.PL</h1>
                </header>

                <section>
                    <form>
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

                        <div className={styles.checkboxRow}>
                            <label>
                                <input type="checkbox"/> Zapamiętaj to urządzenie
                            </label>
                            <Link to="/przywroc-haslo">Nie pamiętasz hasła?</Link>
                        </div>
                        <br/>
                        <button type="submit" id="btn">Zaloguj</button>
                    </form>
                </section>
            </div>
        </>
    );
}

export default Login;
