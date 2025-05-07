import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckToken, getIsAuthA2F, checkCode } from "../components/CheckConnection";
import { useNavigate } from 'react-router-dom';

const host = import.meta.env.VITE_ADDRESS;

const PlayerSettingsPage = () => {

  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [changeMail, setChangeMail] = useState({ email: "", password: "" });
  const [changePassword, setNewPassword] = useState({ password: "", new_password: "" });
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState({
      text : "",
      type : ""
    });
  const navigate = useNavigate();

  useEffect(() => {
    CheckToken().then(res => {
      if (!res) navigate("/");
      const check2FA = async () => {
        const isEnabled = await getIsAuthA2F();
        console.log(isEnabled);
        setTwoFA(isEnabled);
      };
      check2FA();
    });
  }, []);


  const toggleTwoFA = async (e) => {
    if (twoFA) {
      setShowQRCode(false);
      setVerificationCode('');
      const code2FA = prompt("Entrez votre code 2FA :");
      const returnCheck = await checkCode(code2FA!);
      if (!returnCheck) {
        alert('Le code est mauvais ❌');
        return;
      }
        alert('2FA désactivé avec succès ✅');
        setTwoFA(true);
    } else {
      setShowQRCode(true);
      try {
        const response = await axios.get(`https://${host}:8000/api/auth/2fa/setup`, {
          withCredentials: true
        });
        if (response.data?.qrCode) {
          setQrCodeImage(response.data.qrCode);
        }
      } catch(err) {}
    }
  };
  const handleChangeMail = (e) =>
    setChangeMail({ ...changeMail, [e.target.name]: e.target.value });

  const handleChangePassword = (e) =>
    setNewPassword({ ...changePassword, [e.target.name]: e.target.value });


  const MailChange = async (e) => {
    e.preventDefault();
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA) {
      code2FA = prompt("Entrez votre code 2FA :")!;
    }
    try {
      const reponse = await axios.patch(`https://${host}:8000/api/users/@me`, {
        email: changeMail.email,
        password: changeMail.password,
      }, {
        headers : {
          'x-2fa-token' : code2FA
        },
        withCredentials: true
      });
      
      if (reponse.status == 204) {
        setStatusMessage({
          text: "Changement réussi !",
          type: "success",
        });
      }
    } catch (err) {
        setStatusMessage({
          text: "Le mail existe déjà !",
          type: "failed",
      });
    }
  };

  const ChangePassword = async (e) => {
    e.preventDefault();
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA)
      code2FA = prompt("Entrez votre code 2FA :")!;
    try {
      await axios.patch(`https://${host}:8000/api/users/@me`, {
        password: changePassword.password,
        new_password: changePassword.new_password
      }, {
        headers : {
          'x-2fa-token' : code2FA
        },
        withCredentials: true
      });

      await axios.post(`https://${host}:8000/api/auth/logout`, undefined, {
        withCredentials: true,
        headers: {
          'Content-Type': ''
        }
      });
        navigate("/");
    } catch (err) {
      console.log("failed", err.response?.data || err.message);
    }
  };

  const patchProfile = async (file : File) => {
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA)
      code2FA = prompt("Entrez votre code 2FA :")!;
    try {
      await axios.patch(`https://${host}:8000/api/users/@me`,
        {file : file},
        {
          headers: {
            'x-2fa-token': code2FA,
          },
          withCredentials: true
        }
      );
      alert("Profil mis à jour !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file!);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
      patchProfile(selectedFile!);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
    if (!confirmed) return;
  
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA)
      code2FA = prompt("Entrez votre code 2FA :")!;
  
    try {
      await axios.delete(`https://${host}:8000/api/users/@me`, {
        headers: {
          'x-2fa-token': code2FA
        },
        withCredentials: true
      });
      console.log("1");
      alert("Votre compte a été supprimé.");
      navigate("/");
    } catch (err) {
      console.error("Erreur lors de la suppression du compte :", err.response?.data || err.message);
      alert("Échec de la suppression du compte.");
    }
  };

  const handleCodeVerification = async (e) => {

    try {
      await axios.post(`https://${host}:8000/api/auth/2fa/verify`, {
        token: verificationCode,
      }, {
        withCredentials: true
      });

        setTwoFA(false);
        setShowQRCode(false);
        alert('2FA activé avec succès ✅');

    } catch (err) { alert('Code incorrect ❌'); }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#f7c80e]">Paramètres du joueur</h1>

        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer l'avatar</h2>
          <div className="flex items-center space-x-4">
            <img src={avatarPreview} alt="Avatar actuel" className="w-20 h-20 rounded-full" />
            <input type="file" className="text-sm" onChange={handleAvatarChange} />
          </div>
        </section>

        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer l'email</h2>
          <form className="space-y-2" onSubmit={MailChange}>
            <input
              type="email"
              name="email"
              value={changeMail.email}
              placeholder="Nouvel email"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
              onChange={handleChangeMail}
              required
            />
            <input
              type="password"
              name="password"
              value={changeMail.password}
              placeholder="Mot de passe actuel"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
              onChange={handleChangeMail}
              required
            />
            <button
              type="submit"
              className="bg-[#44a29f] hover:bg-[#3b8a8a] px-4 py-2 rounded text-white"
            >
              Mettre à jour l'email
            </button>
            {statusMessage && (
              <div
                className={`text-center mt-2 text-sm ${statusMessage.type === "success" ? "text-green-500" : "text-red-500"}`}
              >
                {statusMessage.text}
              </div>
            )}
          </form>
        </section>


        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
          <div className="space-y-2">
            <input
              type="password"
              name="password"
              placeholder="Ancien mot de passe"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
              onChange={handleChangePassword}
              required
            />
            <input
              name="new_password"
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
              onChange={handleChangePassword}
              required
            />
            <button
              className="bg-[#44a29f] hover:bg-[#3b8a8a] px-4 py-2 rounded text-white"
              onClick={ChangePassword}
                >
              Mettre à jour le mot de passe
            </button>
          </div>
        </section>

        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Authentification à deux facteurs (2FA)</h2>

          <div className="flex items-center justify-between">
            <p className="text-[#5d5570]">
              {twoFA ? "2FA est activé" : "2FA est désactivé"}
            </p>
            <button
              onClick={toggleTwoFA}
              className={`px-4 py-2 rounded text-white ${twoFA ? 'bg-red-500 hover:bg-red-600' : 'bg-[#44a29f] hover:bg-[#3b8a8a]'}`}
            >
              {twoFA ? "Désactiver" : "Activer"}
            </button>
          </div>

          {showQRCode && !twoFA && (
            <div className="mt-4 space-y-4">
              <div className="bg-[#0b0c10] p-4 rounded flex justify-center">
                {qrCodeImage ? (
                  <img
                    src={qrCodeImage}
                    alt="QR Code 2FA"
                    className="w-40 h-40"
                  />
                ) : (
                  <p>Chargement du QR Code...</p>
                )}
              </div>
              <input
                type="text"
                placeholder="Entrez le code 2FA"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
              />
              <button
                onClick={handleCodeVerification}
                className="bg-[#f7c80e] hover:bg-yellow-400 px-4 py-2 rounded text-black font-semibold"
              >
                Vérifier le code
              </button>
            </div>
          )}
        </section>

        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold text-red-500">Supprimer le compte</h2>
          <p className="text-sm text-[#5d5570]">
            Cette action est irréversible. Votre compte sera définitivement supprimé.
          </p>
          <button
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white font-semibold"
            onClick={handleDeleteAccount}
          >
            Supprimer mon compte
          </button>
        </section>

        <div className="flex justify-start">
          <button
            onClick={() => navigate('/lobby')}
            className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
          >
            ← Retour au lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSettingsPage;
