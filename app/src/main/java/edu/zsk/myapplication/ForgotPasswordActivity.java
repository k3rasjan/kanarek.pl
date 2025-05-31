package edu.zsk.myapplication;

import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class ForgotPasswordActivity extends AppCompatActivity {

    private EditText passwordInput;
    private EditText confirmPasswordInput;
    private Button resetButton;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        passwordInput = findViewById(R.id.password_input);
        confirmPasswordInput = findViewById(R.id.confirm_password_input);
        resetButton = findViewById(R.id.reset_button);

        resetButton.setOnClickListener(v -> {
            String password = passwordInput.getText().toString();
            String confirmPassword = confirmPasswordInput.getText().toString();

            if (password.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Uzupełnij oba pola", Toast.LENGTH_SHORT).show();
            } else if (!password.equals(confirmPassword)) {
                Toast.makeText(this, "Hasła się nie zgadzają", Toast.LENGTH_SHORT).show();
            } else {
                // TODO: Reset hasła przez API
                Toast.makeText(this, "Hasło zresetowane!", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
