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

import retrofit2.*;
import retrofit2.converter.gson.GsonConverterFactory;

public class MapActivity extends AppCompatActivity implements OnMapReadyCallback {

    private GoogleMap mMap;
    private FusedLocationProviderClient fusedLocationClient;
    private final List<LocationData> locations = new ArrayList<>();
    private InspectorApi api;
    private Button checkButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_map);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);

        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("http://10.0.2.2:8080") // emulator -> localhost
                .addConverterFactory(GsonConverterFactory.create())
                .build();
        api = retrofit.create(InspectorApi.class);

        // Przycisk sprawdzający pojazd
        checkButton = findViewById(R.id.checkVehicleButton);
        checkButton.setOnClickListener(v -> checkVehicleProcess());

        // Przycisk zgłoszenia (!)
        Button reportButton = findViewById(R.id.report_button);
        reportButton.setOnClickListener(v -> showReportDialog());

        // Fragment mapy
        SupportMapFragment mapFragment = (SupportMapFragment)
                getSupportFragmentManager().findFragmentById(R.id.map_fragment);
        if (mapFragment != null) {
            mapFragment.getMapAsync(this);
        }
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
                        mMap.addMarker(new MarkerOptions()
                                .position(vehicleLatLng)
                                .title("Pojazd ID: " + vehicle.id));
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
        EditText lineInput = view.findViewById(R.id.line_number_input);
        EditText inspectorInput = view.findViewById(R.id.inspector_count_input);
        Button submit = view.findViewById(R.id.submit_report_button);

        submit.setOnClickListener(v -> {
            String type = "";
            int checkedId = typeGroup.getCheckedRadioButtonId();
            if (checkedId != -1) {
                type = ((RadioButton) view.findViewById(checkedId)).getText().toString();
            }

            String line = lineInput.getText().toString();
            String count = inspectorInput.getText().toString();

            if (type.isEmpty() || line.isEmpty() || count.isEmpty()) {
                Toast.makeText(this, "Uzupełnij wszystkie pola", Toast.LENGTH_SHORT).show();
                return;
            }

            // (Opcjonalnie) Wyślij dane do API – TODO: możesz dodać własne zgłoszenie tu

            Toast.makeText(this,
                    "Zgłoszono: " + type + " " + line + ", kanarów: " + count,
                    Toast.LENGTH_SHORT).show();

            dialog.dismiss();

            // ✅ WYWOŁAJ "checkVehicleProcess" automatycznie po zgłoszeniu
            checkVehicleProcess();
        });

        dialog.show();
    }

    @Override
    public void onMapReady(@NonNull GoogleMap googleMap) {
        mMap = googleMap;
        LatLng poznan = new LatLng(52.4027, 16.9124);
        mMap.moveCamera(CameraUpdateFactory.newLatLngZoom(poznan, 13));

        mMap.addMarker(new MarkerOptions()
                .position(poznan)
                .title("Centrum Poznania"));
    }

    private interface LocationCallback {
        void onLocation(Location location);
    }
}
