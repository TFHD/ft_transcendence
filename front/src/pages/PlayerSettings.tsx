import React, { useState } from 'react';

const PlayerSettingsPage: React.FC = () => {
  // 🎯 Logique TypeScript
  const [twoFA, setTwoFA] = useState<boolean>(false);
  const [showQRCode, setShowQRCode] = useState<boolean>(false);
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [avatarPreview, setAvatarPreview] = useState<string>('https://via.placeholder.com/80');

  const toggleTwoFA = () => {
    if (twoFA) {
      setTwoFA(false);
      setShowQRCode(false);
      setVerificationCode('');
    } else {
      setShowQRCode(true);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAvatarPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCodeVerification = () => {
    // Simuler vérification
    if (verificationCode === '123456') {
      setTwoFA(true);
      setShowQRCode(false);
      alert('2FA activé avec succès ✅');
    } else {
      alert('Code incorrect ❌');
    }
  };

  // 🖼️ Structure JSX
  return (
    <div className="min-h-screen bg-[#0b0c10] text-white p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-[#f7c80e]">Paramètres du joueur</h1>

        {/* Avatar */}
        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer l'avatar</h2>
          <div className="flex items-center space-x-4">
            <img src={avatarPreview} alt="Avatar actuel" className="w-20 h-20 rounded-full" />
            <input type="file" className="text-sm" onChange={handleAvatarChange} />
          </div>
        </section>

        {/* Email */}
        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer l'email</h2>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Nouvel email"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
            />
            <button className="bg-[#44a29f] hover:bg-[#3b8a8a] px-4 py-2 rounded text-white">
              Mettre à jour l'email
            </button>
          </div>
        </section>

        {/* Mot de passe */}
        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Changer le mot de passe</h2>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Ancien mot de passe"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
            />
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
            />
            <button className="bg-[#44a29f] hover:bg-[#3b8a8a] px-4 py-2 rounded text-white">
              Mettre à jour le mot de passe
            </button>
          </div>
        </section>

        {/* 2FA */}
        <section className="bg-[#1e2933] p-6 rounded-lg shadow space-y-4">
          <h2 className="text-xl font-semibold">Authentification à deux facteurs (2FA)</h2>

          <div className="flex items-center justify-between">
            <p className="text-[#5d5570]">
              {twoFA ? "2FA est activé" : "2FA est désactivé"}
            </p>
            <button
              onClick={toggleTwoFA}
              className={`px-4 py-2 rounded text-white ${
                twoFA ? 'bg-red-500 hover:bg-red-600' : 'bg-[#44a29f] hover:bg-[#3b8a8a]'
              }`}
            >
              {twoFA ? "Désactiver" : "Activer"}
            </button>
          </div>

          {/* Étape de vérification 2FA */}
          {showQRCode && !twoFA && (
            <div className="mt-4 space-y-4">
              <div className="bg-[#0b0c10] p-4 rounded flex justify-center">
                {/* QR Code fictif */}
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?data=otpauth://totp/MonApp%3Fsecret%3DABCDEF123456"
                  alt="QR Code 2FA"
                  className="w-40 h-40"
                />
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
      </div>
    </div>
  );
};

export default PlayerSettingsPage;
