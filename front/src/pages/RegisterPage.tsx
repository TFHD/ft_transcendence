import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckToken } from "../components/CheckConnection";

const host = import.meta.env.VITE_ADDRESS;

const RegisterPage = () => {

  const navigate = useNavigate();

  useEffect(() => {
      CheckToken().then(res => {
      if (res)
        navigate("/lobby");
      });
  }, []);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });
  const [statusMessage, setStatusMessage] = useState({
    text : "",
    type : ""
  });


  const toggleMode = () => {
    navigate("/");
  };
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`https://${host}:8000/api/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setStatusMessage({
        text: "Inscription réussie !",
        type: "success",
      });
    } catch (err) {
      setStatusMessage({
        text: "Erreur lors de l'inscription. Veuillez réessayer.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1e2933] text-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-center mb-6">Inscription</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Nom d'utilisateur</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#5d5570] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#44a29f]"
            placeholder="Nom d'utilisateur"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#5d5570] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#44a29f]"
            placeholder="Email"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#5d5570] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#44a29f]"
            placeholder="Mot de passe"
          />
        </div>

        {statusMessage && (
          <div
            className={`text-center mt-2 text-sm ${
              statusMessage.type === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-[#44a29f] hover:bg-[#3b8b89] text-white font-semibold rounded transition duration-200"
        >
          S'inscrire
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-300">
        Vous avez déjà un compte ?{" "}
        <button
          onClick={toggleMode}
          className="text-[#f7c80e] hover:underline font-medium"
        >
          Se connecter
        </button>
      </p>
    </div>
    </div>
  );
};

export default RegisterPage;