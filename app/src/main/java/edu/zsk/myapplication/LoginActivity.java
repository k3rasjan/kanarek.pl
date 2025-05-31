package edu.zsk.myapplication;

import android.os.Bundle;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import android.content.Intent;
import android.widget.Toast;

public class LoginActivity extends AppCompatActivity {

    private EditText emailInput, passwordInput;
    private CheckBox rememberMe;
    private Button loginButton;
    private TextView forgotPasswordLink;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        emailInput = findViewById(R.id.email_input);
        passwordInput = findViewById(R.id.password_input);
        rememberMe = findViewById(R.id.remember_checkbox);
        loginButton = findViewById(R.id.login_button);
        forgotPasswordLink = findViewById(R.id.forgot_password_link);

        loginButton.setOnClickListener(v -> {
            String email = emailInput.getText().toString();
            String password = passwordInput.getText().toString();

            // TODO: Autoryzacja przez API
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, getString(R.string.empty_credentials_warning), Toast.LENGTH_SHORT).show();
            } else {
                String message = String.format(getString(R.string.login_success), email);
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
            }
        });

        forgotPasswordLink.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, ForgotPasswordActivity.class);
            startActivity(intent);
        });
    }
}
