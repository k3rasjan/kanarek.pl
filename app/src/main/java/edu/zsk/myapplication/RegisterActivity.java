package edu.zsk.myapplication;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;

public class RegisterActivity extends AppCompatActivity {

    private EditText usernameInput, emailInput, passwordInput, password2Input;
    private Button registerButton;
    private TextView loginRedirect;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_register);

        usernameInput = findViewById(R.id.username_input);
        emailInput = findViewById(R.id.email_input);
        passwordInput = findViewById(R.id.password_input);
        password2Input = findViewById(R.id.password2_input);
        registerButton = findViewById(R.id.register_button);
        loginRedirect = findViewById(R.id.login_link);

        registerButton.setOnClickListener(v -> {
            String username = usernameInput.getText().toString();
            String email = emailInput.getText().toString();
            String password = passwordInput.getText().toString();
            String password2 = password2Input.getText().toString();

            if (username.isEmpty() || email.isEmpty() || password.isEmpty() || password2.isEmpty()) {
                Toast.makeText(this, "Uzupełnij wszystkie pola", Toast.LENGTH_SHORT).show();
            } else if (!password.equals(password2)) {
                Toast.makeText(this, "Hasła się nie zgadzają", Toast.LENGTH_SHORT).show();
            } else {
                // TODO: wysłanie danych do API
                Toast.makeText(this, "Rejestracja zakończona sukcesem", Toast.LENGTH_SHORT).show();
            }
        });

        loginRedirect.setOnClickListener(v -> {
            Intent intent = new Intent(RegisterActivity.this, LoginActivity.class);
            startActivity(intent);
        });
    }
}