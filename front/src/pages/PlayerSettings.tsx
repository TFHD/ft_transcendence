import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckToken, getIsAuthA2F, checkCode } from "../components/CheckConnection";
import { useNavigate } from 'react-router-dom';
import Modal2FA from '../components/Model2FA'
import { connectGateWaySocket, getGatewaySocket, closeGateWaySocket} from '../components/GatewaySocket'
import ChatWindow from '../components/ChatWindow';


const host = window.location.hostname;

const PlayerSettingsPage = () => {

  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [canChangeAvatar, setcanChangeAvatar] = useState<boolean>(true);
  const [changeMail, setChangeMail] = useState({ email: "", password: "" });
  const [changePassword, setNewPassword] = useState({ password: "", new_password: "" });
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [on2FASubmit, setOn2FASubmit] = useState<(code: string) => void>(() => () => {});
  const [statusMessage, setStatusMessage] = useState({
    text : "",
    type : ""});
  const navigate = useNavigate();

  useEffect(() => {
    CheckToken().then(res => {
      if (!res) { navigate("/"); closeGateWaySocket(); }
      if (!getGatewaySocket())
        connectGateWaySocket(`https://${host}:8000/api/gateway`);
      const check2FA = async () => {
        const isEnabled = await getIsAuthA2F();
        setTwoFA(isEnabled);
        try {
          const userResponse = await axios.get(`https://${host}:8000/api/users/@me`, {
            withCredentials: true
          });
          const avatar = userResponse.data.avatar_url;
          if (avatar) {
            setAvatarPreview(avatar);
          }
        } catch (error) {
        }
      };
      check2FA();
      
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

  const toggleTwoFA = async (e) => {
    if (twoFA) {
      setShowQRCode(false);
      setVerificationCode('');
      const code2FA = await askFor2FACode();
      const returnCheck = await checkCode(code2FA!);
      if (!returnCheck) {
        alert('Le code est mauvais ❌');
        return;
      }
        alert('2FA désactivé avec succès ✅');
        setTwoFA(false);
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
      code2FA = await askFor2FACode()!;
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
		let errorMessage = "Échec du changement d'email.";
		if (err.response && err.response.data) {
			switch (err.response.data.code) {
				case "GOOGLE_USER":
					errorMessage = "Impossible de changer l'email d'un compte Google.";
					break ;
				case "MISSING_FIELDS":
					errorMessage = "Veuillez remplir tous les champs.";
					break ;
				case "PASSWORD_INVALID":
					errorMessage = "Mot de passe incorrect.";
					break ;
				case "USER_ALREADY_EXISTS":
					errorMessage = "Un compte avec cet email existe déjà.";
					break ;
				case "EMAIL_INVALID":
					errorMessage = "L'email fourni est invalide.";
					break ;
				case "INVALID_CREDENTIALS":
					errorMessage = "Identifiants invalides. Veuillez vérifier votre mot de passe.";
					break ;
			}
		}
        setStatusMessage({
          text: errorMessage,
          type: "failed",
      });
    }
    setNewPassword({ ...changePassword, password: "" });
  };

  const ChangePassword = async (e) => {
    e.preventDefault();
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA)
      code2FA = await askFor2FACode()!;
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
      setNewPassword({ ...changePassword, password: "" });
      navigate("/");
    } catch (err) { }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.");
    if (!confirmed) return;
  
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA)
      code2FA = await askFor2FACode()!;
  
    try {
      await axios.delete(`https://${host}:8000/api/users/@me`, {
        headers: {
          'x-2fa-token': code2FA
        },
        withCredentials: true
      });
      alert("Votre compte a été supprimé.");
      navigate("/");
    } catch (err) {
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

        setTwoFA(true);
        setShowQRCode(false);
        alert('2FA activé avec succès ✅');

    } catch (err) { alert('Code incorrect ❌'); }
  };

  const handleAvatarSubmit = async () => {
    if (!selectedFile) return;
  
    let code2FA = "";
    const is2FA = await getIsAuthA2F();
    if (is2FA) {
      code2FA = await askFor2FACode()!;
    }
  
    const formData = new FormData();
    formData.append("file", selectedFile);
    setSelectedFile(null);
    try {
      await axios.patch(`https://${host}:8000/api/users/@me`, formData, {
        headers: {
          'x-2fa-token': code2FA
        },
        withCredentials: true,
      });
  
      alert("Avatar mis à jour avec succès !");
    } catch (error) {
      alert("Échec du changement d'avatar. Vérifie le format de l'image.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
      {show2FAModal && (
        <Modal2FA
          message="Entrez votre code 2FA"
          onSubmit={on2FASubmit}
          onClose={() => setShow2FAModal(false)}
        />
      )}
        <h1 className="text-3xl font-bold text-[#f7c80e]">Paramètres du joueur</h1>

        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer l'avatar</h2>
          <div className="flex items-center justify-between space-x-6">
            <img
              src={avatarPreview || '/assets/no_profile.jpg'}
              alt="Avatar actuel"
              className="w-32 h-32 rounded-full object-cover border-4 border-[#44a29f]"
            />
            <div className="flex flex-col justify-center space-y-2">
              <label
                htmlFor="avatar-upload"
                className="cursor-pointer bg-[#44a29f] hover:bg-[#3b8a8a] px-6 py-3 rounded text-white text-lg"
              >
                Choisir un fichier
              </label>
              <input
                id="avatar-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                className={`bg-[#44a29f] px-4 py-2 rounded text-white hover:bg-[#3b8a8a] ${selectedFile ? "cursor-pointer" : "cursor-not-allowed"}`}
                onClick={handleAvatarSubmit}
                disabled={!selectedFile}
              >
                Valider l'avatar
              </button>
            </div>
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
      <ChatWindow />
    </div>
  );
};

export default PlayerSettingsPage;
