package edu.zsk.myapplication;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.*;
import androidx.appcompat.app.AppCompatActivity;

public class SettingsActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "AppSettings";
    private static final String KEY_NOTIFICATIONS_ENABLED = "notifications_enabled";

    private Switch notificationsSwitch;
    private SharedPreferences sharedPreferences;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_settings);

        sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);

        notificationsSwitch = findViewById(R.id.notifications_switch);
        boolean isEnabled = sharedPreferences.getBoolean(KEY_NOTIFICATIONS_ENABLED, true);
        notificationsSwitch.setChecked(isEnabled);

        notificationsSwitch.setOnCheckedChangeListener((buttonView, isChecked) -> {
            sharedPreferences.edit().putBoolean(KEY_NOTIFICATIONS_ENABLED, isChecked).apply();
            Toast.makeText(this, isChecked ? "Powiadomienia włączone" : "Powiadomienia wyłączone", Toast.LENGTH_SHORT).show();
        });

        Button changeLocationBtn = findViewById(R.id.change_location_button);
        changeLocationBtn.setOnClickListener(v -> {
            Toast.makeText(this, "Tu można dodać wybór lokalizacji domyślnej", Toast.LENGTH_SHORT).show();
        });

        Button clearDataBtn = findViewById(R.id.clear_data_button);
        clearDataBtn.setOnClickListener(v -> {
            sharedPreferences.edit().clear().apply();
            Toast.makeText(this, "Dane wyczyszczone", Toast.LENGTH_SHORT).show();
            notificationsSwitch.setChecked(true);
        });

        Button backBtn = findViewById(R.id.back_button);
        backBtn.setOnClickListener(v -> finish());
    }
}
