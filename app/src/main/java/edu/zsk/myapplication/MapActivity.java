package edu.zsk.myapplication;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.*;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;


import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.maps.*;
import com.google.android.gms.maps.model.*;
import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.ArrayList;
import java.util.List;

import java.util.HashMap;
import java.util.Map;

import retrofit2.*;
import retrofit2.converter.gson.GsonConverterFactory;

import android.content.Intent;

import edu.zsk.myapplication.VehicleResponse;

public class MapActivity extends AppCompatActivity implements OnMapReadyCallback {

    private Handler vehicleRefreshHandler = new Handler();
    private Runnable vehicleRefreshRunnable;
    private BitmapDescriptor getResizedIcon(int drawableId, int width, int height) {
        Bitmap imageBitmap = BitmapFactory.decodeResource(getResources(), drawableId);
        Bitmap scaledBitmap = Bitmap.createScaledBitmap(imageBitmap, width, height, false);
        return BitmapDescriptorFactory.fromBitmap(scaledBitmap);
    }

    private boolean isTram(String routeId) {
        try {
            int route = Integer.parseInt(routeId);
            return route >= 1 && route <= 100;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    private final Map<String, LatLng> stationCoordinates = new HashMap<String, LatLng>() {{
        put("Rondo Kaponiera", new LatLng(52.4064, 16.9115));
        put("Most Teatralny", new LatLng(52.4101, 16.9183));
        put("Dworzec Główny", new LatLng(52.4000, 16.9128));
        put("Os. Lecha", new LatLng(52.3969, 17.0041));
        put("Górczyn", new LatLng(52.3856, 16.9004));
    }};

    private GoogleMap mMap;
    private FusedLocationProviderClient fusedLocationClient;
    private final List<LocationData> locations = new ArrayList<>();
    private InspectorApi api;

    private String lastSelectedStop = "";
    private String lastSelectedLine = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://192.168.1.48:8080/api/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        api = retrofit.create(InspectorApi.class);

        Button reportButton = findViewById(R.id.report_button);
        reportButton.setOnClickListener(v -> showReportDialog());

        setupStationSearch();

        SupportMapFragment mapFragment = (SupportMapFragment)
                getSupportFragmentManager().findFragmentById(R.id.map_fragment);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }
        findViewById(R.id.user_button).setOnClickListener(v -> {
            PopupMenu popup = new PopupMenu(this, v);
            popup.getMenu().add("Moje konto");
            popup.getMenu().add("Ustawienia");
            popup.getMenu().add("Wyloguj");

            popup.setOnMenuItemClickListener(item -> {
                switch (item.getTitle().toString()) {
                    case "Moje konto":
                        startActivity(new Intent(this, MyAccountActivity.class));
                        return true;
                    case "Wyloguj":
                        Toast.makeText(this, "Wylogowano", Toast.LENGTH_SHORT).show();
                        return true;
                    case "Ustawienia":
                        startActivity(new Intent(this, SettingsActivity.class));
                        return true;
                    default:
                        return false;
                }
            });
            popup.show();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
                        != PackageManager.PERMISSION_GRANTED) {
                    ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, 100);
                }
            }

        });
    }

    private void setupStationSearch() {
        AutoCompleteTextView input = findViewById(R.id.station_search_input);

        String[] stations = stationCoordinates.keySet().toArray(new String[0]);
        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_dropdown_item_1line, stations);
        input.setAdapter(adapter);

        input.setOnItemClickListener((parent, view, position, id) -> {
            String selected = adapter.getItem(position);
            LatLng coords = stationCoordinates.get(selected);
            if (coords != null && mMap != null) {
                mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(coords, 15));
            } else {
                Toast.makeText(this, "Nie znaleziono przystanku", Toast.LENGTH_SHORT).show();
            }
        });
    }

    private void checkVehicleProcess() {
        Log.d("DEBUG", "Rozpoczynam checkVehicleProcess");
        locations.clear();

        getLocation(loc1 -> {
            locations.add(new LocationData(loc1.getLongitude(), loc1.getLatitude(), System.currentTimeMillis() / 1000));

            new Handler().postDelayed(() -> {
                getLocation(loc2 -> {
                    locations.add(new LocationData(loc2.getLongitude(), loc2.getLatitude(), System.currentTimeMillis() / 1000));
                    Log.d("API", "Próbuję wysłać request do find-vehicle");
                    sendFindVehicleRequest();
                });
            }, 2000);
        });
    }

    private void getLocation(LocationCallback callback) {
        Log.d("DEBUG", "getLocation called");
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) != PackageManager.PERMISSION_GRANTED) {

            ActivityCompat.requestPermissions(this,
                    new String[]{
                            Manifest.permission.ACCESS_FINE_LOCATION,
                            Manifest.permission.ACCESS_COARSE_LOCATION
                    }, 1);
            return;
        }
        fusedLocationClient.getLastLocation()
                .addOnSuccessListener(location -> {
                    if (location != null) {
                        callback.onLocation(location);
                    } else {
                        Toast.makeText(this, "Brak lokalizacji", Toast.LENGTH_SHORT).show();
                    }
                });
    }

    private void sendFindVehicleRequest() {
        Log.d("DEBUG", "sendFindVehicleRequest started");
        FindVehicleRequest request = new FindVehicleRequest(locations);

        api.findVehicle(request).enqueue(new Callback<VehicleResponse>() {
            @Override
            public void onResponse(Call<VehicleResponse> call, Response<VehicleResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Log.d("DEBUG", "Odpowiedź API: code = " + response.code());
                    Vehicle vehicle = response.body().data;

                    LatLng vehicleLatLng = new LatLng(vehicle.lat, vehicle.long_);

                    runOnUiThread(() -> {
                        Log.d("DEBUG", "Pokaż dialog potwierdzenia");

                        new AlertDialog.Builder(MapActivity.this)
                                .setTitle("Czy to ten pojazd?")
                                .setMessage("ID: " + vehicle.id + "\nTrasa: " + vehicle.routeId)
                                .setPositiveButton("Tak", (dialog, which) -> {
                                    Log.d("DEBUG", "Użytkownik kliknął TAK – wysyłanie reportu");
                                    sendReport(vehicle.id);
                                })
                                .setNegativeButton("Nie", (dialog, which) -> {
                                    Log.d("DEBUG", "Użytkownik kliknął NIE");
                                })
                                .show();
                    });

                } else {
                    Log.e("API", "Błąd odpowiedzi: " + response.code());
                    try {
                        Log.e("API", "Błąd treść: " + response.errorBody().string());
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }
            }

            @Override
            public void onFailure(Call<VehicleResponse> call, Throwable t) {
                Log.e("API", "Błąd: " + t.getMessage());
            }
        });
    }

    private void sendReport(String vehicleId) {
        Log.d("DEBUG", "sendReport() called");
        ReportRequest report = new ReportRequest(vehicleId);

        api.reportVehicle(report).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                Log.d("DEBUG", "Report wysłany pomyślnie");
                runOnUiThread(() -> {
                    Toast.makeText(MapActivity.this, "Zgłoszono pojazd", Toast.LENGTH_SHORT).show();
                    showKanarNotification(lastSelectedStop, lastSelectedLine);
                });
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                runOnUiThread(() ->
                        Toast.makeText(MapActivity.this, "Błąd zgłoszenia", Toast.LENGTH_SHORT).show());
            }
        });
    }

    private void showReportDialog() {
        BottomSheetDialog dialog = new BottomSheetDialog(this);
        View view = getLayoutInflater().inflate(R.layout.bottom_report_dialog, null);
        dialog.setContentView(view);

        RadioGroup typeGroup = view.findViewById(R.id.vehicle_type_group);
        Spinner lineSpinner = view.findViewById(R.id.line_spinner);
        Button submit = view.findViewById(R.id.submit_report_button);

        loadLinesIntoSpinner(lineSpinner);

        submit.setOnClickListener(v -> {
            int checkedId = typeGroup.getCheckedRadioButtonId();
            lastSelectedStop = ((AutoCompleteTextView) findViewById(R.id.station_search_input)).getText().toString();
            lastSelectedLine = lineSpinner.getSelectedItem().toString();
            if (checkedId == -1) {
                Toast.makeText(this, "Wybierz typ pojazdu", Toast.LENGTH_SHORT).show();
                return;
            }

            String type = ((RadioButton) view.findViewById(checkedId)).getText().toString();
            String line = lineSpinner.getSelectedItem().toString();
            String count = "2";

            Toast.makeText(this, "Zgłoszono: " + type + " " + line + ", kanarów: " + count, Toast.LENGTH_SHORT).show();

            dialog.dismiss();
            checkVehicleProcess();
        });

        dialog.show();
    }

    private void loadLinesIntoSpinner(Spinner spinner) {
        List<String> lines = new ArrayList<>();
        lines.add("1");
        lines.add("5");
        lines.add("6");
        lines.add("12");
        lines.add("18");
        lines.add("201");

        ArrayAdapter<String> adapter = new ArrayAdapter<>(this, android.R.layout.simple_spinner_dropdown_item, lines);
        spinner.setAdapter(adapter);
        setupStationSearch();
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;


        if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED) {

            fusedLocationClient.getLastLocation().addOnSuccessListener(location -> {
                if (location != null) {
                    LatLng userLocation = new LatLng(location.getLatitude(), location.getLongitude());
                    mMap.animateCamera(CameraUpdateFactory.newLatLngZoom(userLocation, 15));
                } else {

                    mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(52.4027, 16.9124), 13));
                    Toast.makeText(this, "Nie udało się pobrać lokalizacji", Toast.LENGTH_SHORT).show();
                }
                fetchAndDisplayAllVehicles();
            });

        } else {

            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(52.4027, 16.9124), 13));
            Toast.makeText(this, "Brak uprawnień do lokalizacji", Toast.LENGTH_SHORT).show();
            fetchAndDisplayAllVehicles();

        }
        vehicleRefreshRunnable = () -> {
            fetchAndDisplayAllVehicles();
            vehicleRefreshHandler.postDelayed(vehicleRefreshRunnable, 30000);
        };
        vehicleRefreshHandler.postDelayed(vehicleRefreshRunnable, 30000);
    }
    private void fetchAndDisplayAllVehicles() {
        if (mMap == null) {
            Log.w("MAP", "Mapa jeszcze niegotowa – pominięto odświeżenie");
            return;
        }

        mMap.clear();
        api.getAllVehicles().enqueue(new Callback<VehicleListResponse>() {
            @Override
            public void onResponse(Call<VehicleListResponse> call, Response<VehicleListResponse> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<Vehicle> vehicles = response.body().data;
                    BitmapDescriptor tramIcon = getResizedIcon(R.drawable.tram_icon, 64, 64);
                    BitmapDescriptor busIcon = getResizedIcon(R.drawable.bus_icon, 64, 64);
                    for (Vehicle vehicle : vehicles) {
                        LatLng position = new LatLng(vehicle.lat, vehicle.long_);

                        BitmapDescriptor icon = isTram(vehicle.routeId) ? tramIcon : busIcon;

                        mMap.addMarker(new MarkerOptions()
                                .position(position)
                                .title("Linia " + vehicle.routeId + " (ID: " + vehicle.id + ")")
                                .icon(icon));
                    }
                } else {
                    Log.e("API", "Błąd odpowiedzi (pojazdy): " + response.code());
                }
            }

            @Override
            public void onFailure(Call<VehicleListResponse> call, Throwable t) {
                Log.e("API", "Błąd: " + t.getMessage());
            }
        });
    }


    private void showKanarNotification(String stop, String line) {
        Log.d("DEBUG", "Notification triggered for stop: " + stop + ", line: " + line);
        NotificationManager manager = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        String channelId = "kanar_alert_channel";

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    channelId, "Kanar Alert", NotificationManager.IMPORTANCE_HIGH);
            channel.setDescription("Powiadomienia o kanarach");
            manager.createNotificationChannel(channel);
        }
        if (stop == null || stop.trim().isEmpty()) stop = "nieznanym przystanku";
        if (line == null || line.trim().isEmpty()) line = "nieznanej linii";
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, channelId)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("🚨 UWAGA KANAR!")
                .setContentText("UWAGA na " + stop + " w " + line + " KANAR!")
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setDefaults(NotificationCompat.DEFAULT_ALL)
                .setAutoCancel(true);

        manager.notify(1, builder.build());
    }

    private interface LocationCallback {
        void onLocation(Location location);
    }
    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (vehicleRefreshHandler != null && vehicleRefreshRunnable != null) {
            vehicleRefreshHandler.removeCallbacks(vehicleRefreshRunnable);
        }
    }
}


