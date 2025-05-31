package edu.zsk.myapplication;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.os.Bundle;
import android.os.Handler;
import android.util.Log;
import android.view.View;
import android.widget.*;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
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

public class MapActivity extends AppCompatActivity implements OnMapReadyCallback {

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

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8080")
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
        locations.clear();

        getLocation(loc1 -> {
            locations.add(new LocationData(loc1.getLongitude(), loc1.getLatitude(), System.currentTimeMillis() / 1000));

            new Handler().postDelayed(() -> {
                getLocation(loc2 -> {
                    locations.add(new LocationData(loc2.getLongitude(), loc2.getLatitude(), System.currentTimeMillis() / 1000));
                    sendFindVehicleRequest();
                });
            }, 2000);
        });
    }

    private void getLocation(LocationCallback callback) {
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
        FindVehicleRequest request = new FindVehicleRequest(locations);

        api.findVehicle(request).enqueue(new Callback<Vehicle>() {
            @Override
            public void onResponse(Call<Vehicle> call, Response<Vehicle> response) {
                if (response.isSuccessful() && response.body() != null) {
                    Vehicle vehicle = response.body();

                    LatLng vehicleLatLng = new LatLng(vehicle.lat, vehicle.long_);

                    runOnUiThread(() -> {
                        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(vehicleLatLng, 15));

                        new AlertDialog.Builder(MapActivity.this)
                                .setTitle("Czy to ten pojazd?")
                                .setMessage("ID: " + vehicle.id + "\nTrasa: " + vehicle.routeId)
                                .setPositiveButton("Tak", (dialog, which) -> sendReport(vehicle.id))
                                .setNegativeButton("Nie", null)
                                .show();
                    });

                } else {
                    Log.e("API", "Błąd odpowiedzi");
                }
            }

            @Override
            public void onFailure(Call<Vehicle> call, Throwable t) {
                Log.e("API", "Błąd: " + t.getMessage());
            }
        });
    }

    private void sendReport(String vehicleId) {
        ReportRequest report = new ReportRequest(vehicleId);
        api.reportVehicle(report).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                runOnUiThread(() ->
                        Toast.makeText(MapActivity.this, "Zgłoszono pojazd", Toast.LENGTH_SHORT).show());
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
            if (checkedId == -1) {
                Toast.makeText(this, "Wybierz typ pojazdu", Toast.LENGTH_SHORT).show();
                return;
            }

            String type = ((RadioButton) view.findViewById(checkedId)).getText().toString();
            String line = lineSpinner.getSelectedItem().toString();
            String count = "2"; // domyślnie 2

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
            });

        } else {

            mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(new LatLng(52.4027, 16.9124), 13));
            Toast.makeText(this, "Brak uprawnień do lokalizacji", Toast.LENGTH_SHORT).show();
        }
    }

    private interface LocationCallback {
        void onLocation(Location location);
    }
}
