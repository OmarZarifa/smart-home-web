import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/users`); 
      const data = await response.json();

      if (data.error) {
        setMessage(`Error: ${data.error.message}`); 
      } else {
        const user = data.data.users.find(
          (u) => u.email === formData.email && u.password === formData.password
        );
        if (user) {
          setMessage("Login successful!");
          // Redirect user or save session here
        } else {
          setMessage("Invalid email or password.");
        }
      }
    } catch (err) {
      setMessage("Failed to connect to the server.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit" className="bg-green-500 text-white px-4 py-2">
          Login
        </button>
      </form>
      {message && <p className="mt-2">{message}</p>}
    </div>
  );
}

export default Login;
