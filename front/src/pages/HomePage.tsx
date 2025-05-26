import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckToken, getIsAuthA2F, checkCode } from "../components/CheckConnection";
import Modal2FA from '../components/Model2FA'
import GoogleLoginButton from "../components/GoogleButton";
import { connectGateWaySocket, getGatewaySocket, closeGateWaySocket} from '../components/GatewaySocket'

const host = window.location.hostname;

const HomePage = () => {

  useEffect(() => {
      CheckToken().then(res => {
      if (res)
        navigate("/lobby");
      });
  }, []);
  
  const askFor2FACode = (): Promise<string> => {
    return new Promise((resolve) => {
      setOn2FASubmit(() => (code: string) => {
        setShow2FAModal(false);
        resolve(code);
      });
      setShow2FAModal(true);
    });
  };

  const navigate = useNavigate();
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [on2FASubmit, setOn2FASubmit] = useState<(code: string) => void>(() => () => {});
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [statusMessage, setStatusMessage] = useState({
    text : "",
    type : ""
  });

  const toggleMode = () => {
    navigate("/register");
  };
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    let code2FA = "";
    let reponse = null;
    try {
      reponse = await axios.post(`https://${host}:8000/api/auth/login`, {
        username: formData.identifier,
        email: formData.identifier,
        password: formData.password,
      }, {withCredentials: true});
      setStatusMessage({
        text: "Connexion réussie !",
        type: "success",
      });
    } catch (err) {
      if (err.response.data.message == "Two-factor authentication is required.") {
        try {
          code2FA = await askFor2FACode();
          reponse = await axios.post(`https://${host}:8000/api/auth/login`, {
            username: formData.identifier,
            email: formData.identifier,
            password: formData.password,
          }, {
            withCredentials: true,
            headers : {
              'x-2fa-token' : code2FA
            }
          });
          navigate("/lobby");
          setStatusMessage({
            text: "Connexion avec succès !",
            type: "error",
          });
        } catch (err) {
          setStatusMessage({
            text: "Le code A2F est faux !",
            type: "error",
          });
        }
      }
      else
        setStatusMessage({
          text: "Le mot de passe ou l'email est invalide !",
          type: "error",
        });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1e2933] text-white rounded-lg shadow-lg p-8">
      {show2FAModal && (
        <Modal2FA
          message="Entrez votre code 2FA"
          onSubmit={on2FASubmit}
          onClose={() => setShow2FAModal(false)}
        />
      )}
      <h2 className="text-2xl font-semibold text-center mb-6">Connexion</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Email ou Nom d'utilisateur</label>
          <input
            type="text"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded bg-[#5d5570] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#44a29f]"
            placeholder="Entrez votre email ou nom d'utilisateur"
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
          Se connecter
        </button>
      <GoogleLoginButton/>
      </form>

      <p className="mt-6 text-center text-sm text-gray-300">
        Pas encore de compte ?{" "}
        <button
          onClick={toggleMode}
          className="text-[#f7c80e] hover:underline font-medium"
        >
          S'inscrire
        </button>
      </p>
    </div>
  </div>
  );
};

export default HomePage;