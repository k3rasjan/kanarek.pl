import '../index.css'

function Login() {
    return (
        <>
            <header>
                <h1>WITAMY NA KANAREK.PL</h1>
            </header>
            <section>
                <form>
                    <label>
                        E-mail <br></br>
                        <input type="email" name="email" id="email" required placeholder="Wprowadź swój e-mail" />
                    </label><br></br>
                    <label>
                        Hasło <br></br>
                        <input type="password" name="password" id="password" required placeholder="Wprowadź swoje hasło"/>
                    </label><br></br>
                    <label>
                        <input type="checkbox"></input>Zapamiętaj to urządzenie
                        <a href="">Nie pamiętasz hasła?</a>
                    </label><br></br>
                    <label>
                        <button id="btn">Zaloguj</button>
                    </label>
                </form>
            </section>
        </>
    )
}

export default Login