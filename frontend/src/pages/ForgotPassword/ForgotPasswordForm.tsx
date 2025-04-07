import FormField from '../../components/FormField/FormField.tsx';
import '../../styles/global.css';
import '../../styles/formBase.css';

function ForgotPasswordForm() {
    return (
        <>
            <div className="container">
                <header className="header">
                    <h1>ZRESETUJ HASŁO</h1>
                </header>
                <section>
                    <form>
                        <FormField
                            label="Hasło"
                            type="password"
                            name="password"
                            placeholder="Wprowadź swoje nowe hasło"
                        />
                        <FormField
                            label="Powtórz hasło"
                            type="password"
                            name="password2"
                            placeholder="Wprowadź swoje nowe hasło"
                        />
                        <button type="submit" id="btn">Zresetuj hasło</button>
                    </form>
                </section>
            </div>
        </>
    );
}

export default ForgotPasswordForm;
