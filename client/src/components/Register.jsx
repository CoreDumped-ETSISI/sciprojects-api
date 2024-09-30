import React, { useState } from "react";

export function Register() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");

    try {
      const response = await fetch("http://localhost:8000/api/v1/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("¡Registro exitoso! Revisa tu correo para obtener la contraseña.");
        
        // Redirigir a la página de login después de 1 segundos
        setTimeout(() => {
          window.location.href = "/signin";  // Asegúrate de que esta ruta sea correcta
        }, 1000);
      } else {
        setError(data.error || "Error al registrar.");
      }
    } catch (err) {
      setError("Error al conectar con el servidor.");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu correo"
          required
        />
        <button type="submit">Register</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {message && <p style={{ color: "green" }}>{message}</p>}
    </div>
  );
}
