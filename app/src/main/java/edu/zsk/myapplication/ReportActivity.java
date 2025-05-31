package edu.zsk.myapplication;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class ReportActivity extends AppCompatActivity {

    private EditText stopInput, lineInput, countInput;
    private Button submitButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_report);

        stopInput = findViewById(R.id.stop_input);
        lineInput = findViewById(R.id.line_input);
        countInput = findViewById(R.id.count_input);
        submitButton = findViewById(R.id.submit_button);

        findViewById(R.id.back_button).setOnClickListener(v -> finish());

        submitButton.setOnClickListener(v -> {
            String stop = stopInput.getText().toString();
            String line = lineInput.getText().toString();
            String count = countInput.getText().toString();

            if (stop.isEmpty() || line.isEmpty() || count.isEmpty()) {
                Toast.makeText(this, "Uzupełnij wszystkie pola", Toast.LENGTH_SHORT).show();
            } else {
                // TODO: Wyślij dane do API
                Toast.makeText(this, "Zgłoszenie wysłane!", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
