import { useState, useEffect } from "react";
import InputField from "./InputField";

export default function AuthModal({ open, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState("login"); 
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");

useEffect(() => {
    if (!open) return;
    setError("");

    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      password: "",
    });
    setMode("login");
  }, [open]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Email és jelszó kötelező.");
      return;
    }

    if (mode === "register") {
      if (!formData.username) {
        setError("Felhasználónév kötelező regisztrációnál.");
        return;
      }

      const user = {
        id: crypto.randomUUID(),
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      };
      localStorage.setItem("user", JSON.stringify(user));
      onAuthSuccess?.(user);
      onClose?.();
      return;
    }

    const raw = localStorage.getItem("user");
    if (!raw) {
      setError("Nincs regisztrált felhasználó. Előbb regisztrálj!");
      return;
    }
    const existing = JSON.parse(raw);

    if (existing.email !== formData.email) {
      setError("Hibás email vagy jelszó.");
      return;
    }
    onAuthSuccess?.(existing);
    onClose?.();
  };

  const inputFieldsRegister = [
    { name: "firstName", type: "text", label: "First name:" },
    { name: "lastName", type: "text", label: "Last name:" },
    { name: "username", type: "text", label: "Username:" },
    { name: "email", type: "email", label: "Email:" },
    { name: "phone", type: "tel", label: "Phone number:" },
    { name: "password", type: "password", label: "Password:" },
  ];

  const inputFieldsLogin = [
    { name: "email", type: "email", label: "Email:" },
    { name: "password", type: "password", label: "Password:" },
  ];

  return (
    <div className="authModal__backdrop" onClick={onClose}>
      <div className="authModal__window" onClick={(e) => e.stopPropagation()}>
        <div className="authModal__header">
          <div className="authModal__tabs">
            <button
              className={`authModal__tab ${mode === "login" ? "active" : ""}`}
              onClick={() => setMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`authModal__tab ${mode === "register" ? "active" : ""}`}
              onClick={() => setMode("register")}
              type="button"
            >
              Register
            </button>
          </div>
          <button className="authModal__close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        <form className="authModal__form" onSubmit={handleSubmit}>
          {error && <div className="authModal__error">Hiba: {error}</div>}

          {(mode === "register" ? inputFieldsRegister : inputFieldsLogin).map(
            (field, idx) => (
              <InputField
                key={idx}
                name={field.name}
                type={field.type}
                label={field.label}
                value={formData[field.name]}
                onChange={handleChange}
              />
            )
          )}

          <button className="authModal__submit" type="submit">
            {mode === "register" ? "Create account" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
