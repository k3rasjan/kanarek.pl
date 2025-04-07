type FormFieldProps = {
    label: string;
    type?: string;
    name: string;
    placeholder?: string;
    required?: boolean;
};

const FormField = ({
                       label,
                       type = "text",
                       name,
                       placeholder,
                       required = true,
                   }: FormFieldProps) => (
    <div style={{ marginBottom: "1rem" }}>
        <label htmlFor={name}>
            {label}
            <br />
            <input
                type={type}
                name={name}
                id={name}
                placeholder={placeholder}
                required={required}
            />
        </label>
    </div>
);

export default FormField;
