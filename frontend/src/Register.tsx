function Register(){
    return (
        <>
            <header>
                <h1>
                    UTWÓRZ KONTO
                </h1>
            </header>
            <section>
                <form>
                    <label>
                        Nazwa użytkownika <br/>
                        <input type="text" name="accname" id="accname" required
                               placeholder="Wprowadź nazwę użytkownika"/>
                    </label>
                    <label>
                        E-mail <br></br>
                        <input type="email" name="email" id="email" required placeholder="Wprowadź swój e-mail"/>
                    </label><br></br>
                    <label>
                        Hasło <br></br>
                        <input type="password" name="password" id="password" required
                               placeholder="Wprowadź swoje hasło"/>
                    </label><br></br>
                    <label>
                        Powtórz hasło <br></br>
                        <input type="password" name="password2" id="password2" required
                               placeholder="Powtórz hasło"/>
                    </label><br></br>
                    <label>
                        <button id="btn">STWÓRZ KONTO</button>
                    </label>
                </form>
                <div>
                    <p>Posiadasz już konto?</p>
                    <a href="Login.tsx">Zaloguj się</a>
                </div>
            </section>
        </>
    )
}
export default Register;