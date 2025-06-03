import { useState, useEffect } from "react";
import "./ReportPage.css";
import { useNavigate } from "react-router-dom";

type Location = {
  lat: number;
  long: number;
  timestamp: number;
};

type Vehicle = {
  id: string;
  tripId: string;
  routeId: string;
  long: number;
  lat: number;
  directionId: string;
  hasInspector: boolean;
};

export default function ReportPage() {
    const navigate = useNavigate();
    const [detectedVehicle, setDetectedVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState<'initial' | 'locating' | 'detecting' | 'submitting'>('initial');
    const [error, setError] = useState<string | null>(null);

    const getCurrentLocation = (): Promise<Location> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        long: position.coords.longitude,
                        timestamp: Date.now()
                    });
                },
                (error) => {
                    reject(error);
                }
            );
        });
    };

    const findVehicle = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setLoadingStep('locating');

            const firstLocation = await getCurrentLocation();
            setLoadingStep('detecting');
            await new Promise(resolve => setTimeout(resolve, 2000));

            const secondLocation = await getCurrentLocation();

            const response = await fetch('http://localhost:8080/api/inspector/find-vehicle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    locations: [firstLocation, secondLocation]
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setDetectedVehicle(data.data);
            } else {
                setError(data.message || 'Nie udało się znaleźć pojazdu');
            }
        } catch (err) {
            setError('Wystąpił błąd podczas wykrywania pojazdu');
            console.error(err);
        } finally {
            setIsLoading(false);
            setLoadingStep('initial');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!detectedVehicle) return;

        try {
            setIsLoading(true);
            setLoadingStep('submitting');
            setError(null);

            const response = await fetch('http://localhost:8080/api/inspector/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vehicleId: detectedVehicle.id
                })
            });

            if (response.ok) {
                navigate('/mapa', { 
                    state: { 
                        focusVehicle: {
                            lat: detectedVehicle.lat,
                            long: detectedVehicle.long
                        }
                    }
                });
            } else {
                setError('Wystąpił błąd podczas wysyłania zgłoszenia');
            }
        } catch (err) {
            setError('Wystąpił błąd podczas wysyłania zgłoszenia');
            console.error(err);
        } finally {
            setIsLoading(false);
            setLoadingStep('initial');
        }
    };

    useEffect(() => {
        findVehicle();
    }, []);

    const getLoadingMessage = () => {
        switch (loadingStep) {
            case 'locating':
                return 'Pobieranie lokalizacji...';
            case 'detecting':
                return 'Wykrywanie pojazdu...';
            case 'submitting':
                return 'Wysyłanie zgłoszenia...';
            default:
                return 'Ładowanie...';
        }
    };

    return (
        <div className="report-wrapper">
            <button className="back-icon" onClick={() => navigate(-1)}>&#8249;</button>

            <form onSubmit={handleSubmit} className="report-form">
                <h1>Zgłoś kanara</h1>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">{getLoadingMessage()}</p>
                    </div>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : detectedVehicle ? (
                    <>
                        <div style={{ marginBottom: '1rem' }}>
                            <p><strong>Linia:</strong> {detectedVehicle.routeId}</p>
                            <p><strong>Kierunek:</strong> {detectedVehicle.directionId}</p>
                        </div>
                        <button type="submit">Potwierdź zgłoszenie</button>
                    </>
                ) : (
                    <p>Nie znaleziono pojazdu</p>
                )}
            </form>
        </div>
    );
}