import React, { useState } from "react";
import "./styles/Register.css"; // Asegúrate de crear este archivo para los estilos


/**
 * Register es un componente de React que permite a los usuarios registrarse mediante su correo electrónico.
 * 
 * - Utiliza el hook useState para gestionar el estado de los campos de entrada, mensajes de error y mensajes 
 *   de éxito durante el proceso de registro.
 * - Al enviar el formulario, se ejecuta la función handleSubmit, que previene el comportamiento predeterminado 
 *   del formulario, limpia mensajes previos de error y éxito, y realiza una solicitud POST a la API de 
 *   registro de usuarios.
 * - La solicitud incluye el correo electrónico del usuario como nombre de usuario, enviado en formato JSON.
 * - Si la respuesta es exitosa (código de estado 200), se muestra un mensaje de éxito y se redirige al usuario 
 *   a la página de inicio de sesión después de 1 segundo. Esto se logra mediante un setTimeout.
 * - Si hay un error durante la solicitud, se captura y se establece un mensaje de error adecuado.
 * - En la interfaz, se muestra un formulario que incluye un campo de entrada para el correo electrónico y un 
 *   botón de registro. También se muestran mensajes de error y éxito si están presentes.
 * - Asegúrate de que el archivo CSS correspondiente ("styles/Register.css") esté creado para aplicar estilos 
 *   a los elementos del componente.
 */



export function Register() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");

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
        body: JSON.stringify({ username: email, password:  password}),
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
    <div className="register-container">
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ingresa tu correo"
          required
          className="input-field"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
          className="input-field"
        />
        <button type="submit" className="submit-button">Registrar</button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {message && <p className="success-message">{message}</p>}
    </div>
  );
}
