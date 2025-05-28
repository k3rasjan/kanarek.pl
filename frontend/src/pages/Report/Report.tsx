import FormField from '../../components/FormField/FormField.tsx';
import '../../styles/global.css';
import '../../styles/formBase.css';

function Report(){
    return (
        <>
            <div className="container">
                <header className="header">
                    <h1>ZGŁOŚ KANARA</h1>
                </header>
                <section>
                    <form>
                        <FormField
                            label="Przystanek"
                            type="text"
                            name="Przystanek"
                            placeholder="?"/>
                        <FormField
                            label="Linia"
                            type="text"
                            name="Linia"
                            placeholder="?"/>
                        <FormField
                            label="Ilosć"
                            type="number"
                            name="ilosc"
                            placeholder="2"
                        />
                        <button type="submit" id="btn">Wyślij zgłoszenie</button>
                    </form>
                </section>
            </div>
        </>
    )
}
export default Report