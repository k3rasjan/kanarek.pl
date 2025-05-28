import { useState } from "react";
import "./ReportPage.css";
import { useNavigate } from "react-router-dom";


export default function ReportPage() {
    const navigate = useNavigate();

    const [stop, setStop] = useState("");
    const [line, setLine] = useState("");
    const [count, setCount] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log({ stop, line, count });
        // TODO: wyślij do API
    };

    return (
        <div className="report-wrapper">
            <button className="back-icon" onClick={() => navigate(-1)}>&#8249;</button>

            <form onSubmit={handleSubmit} className="report-form">
                <h1>Zgłoś kanara</h1>

                <label>
                    Przystanek
                    <input
                        type="text"
                        placeholder="Gorczyn PKM"
                        value={stop}
                        onChange={(e) => setStop(e.target.value)}
                    />
                </label>

                <label>
                    Linia
                    <input
                        type="text"
                        placeholder="17"
                        value={line}
                        onChange={(e) => setLine(e.target.value)}
                    />
                </label>

                <label>
                    Ilość
                    <input
                        type="number"
                        placeholder="2"
                        value={count}
                        onChange={(e) => setCount(e.target.value)}
                    />
                </label>

                <button type="submit">Wyślij zgłoszenie</button>
            </form>
        </div>
    );
}