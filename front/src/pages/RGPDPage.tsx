import React from 'react';
import { useNavigate } from 'react-router-dom';

const RGPDPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#f7c80e] mb-4">
            Politique de Confidentialité & RGPD
          </h1>
          <p className="text-[#44a29f] text-lg">
            Protection de vos données personnelles
          </p>
        </div>

        <div className="bg-[#1e2933] rounded-lg shadow-lg p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-[#f7c80e] mb-4 flex items-center">
              🔒 Collecte des Données
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                Notre plateforme de jeu collecte uniquement les données nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Nom d'utilisateur et email (pour l'authentification)</li>
                <li>Avatar (optionnel, choisi par l'utilisateur)</li>
                <li>Statistiques de jeu (scores, victoires, défaites)</li>
                <li>Messages entre amis (chiffrés)</li>
                <li>Historique des parties</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#f7c80e] mb-4 flex items-center">
              🛡️ Sécurité des Données
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                Nous prenons la sécurité de vos données très au sérieux :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Chiffrement :</strong> Tous les messages sont chiffrés de bout en bout</li>
                <li><strong>Authentification sécurisée :</strong> Support de l'authentification à deux facteurs (2FA)</li>
                <li><strong>Stockage sécurisé :</strong> Les mots de passe sont hachés avec des algorithmes robustes</li>
                <li><strong>Transmission sécurisée :</strong> Toutes les communications utilisent HTTPS/WSS</li>
                <li><strong>Accès restreint :</strong> Seules les personnes autorisées ont accès aux serveurs</li>
              </ul>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#f7c80e] mb-4 flex items-center">
              ⚖️ Vos Droits RGPD
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#0b0c10] p-4 rounded-lg">
                  <h3 className="text-[#44a29f] font-semibold mb-2">✅ Droit d'accès</h3>
                  <p className="text-sm">Consulter toutes vos données personnelles</p>
                </div>
                <div className="bg-[#0b0c10] p-4 rounded-lg">
                  <h3 className="text-[#44a29f] font-semibold mb-2">✏️ Droit de rectification</h3>
                  <p className="text-sm">Corriger vos informations inexactes</p>
                </div>
                <div className="bg-[#0b0c10] p-4 rounded-lg">
                  <h3 className="text-[#44a29f] font-semibold mb-2">🗑️ Droit à l'effacement</h3>
                  <p className="text-sm">Supprimer définitivement votre compte</p>
                </div>
                <div className="bg-[#0b0c10] p-4 rounded-lg">
                  <h3 className="text-[#44a29f] font-semibold mb-2">📦 Droit à la portabilité</h3>
                  <p className="text-sm">Exporter vos données dans un format lisible</p>
                </div>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#f7c80e] mb-4 flex items-center">
              🔥 Suppression et Anonymisation
            </h2>
            <div className="text-gray-300 space-y-3">
              <div className="bg-[#0b0c10] p-6 rounded-lg border-l-4 border-[#44a29f]">
                <h3 className="text-[#44a29f] font-semibold mb-3">Suppression de compte</h3>
                <p className="mb-3">
                  Lorsque vous supprimez votre compte :
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Toutes vos données personnelles sont <strong>supprimées définitivement</strong></li>
                  <li>Vos messages sont <strong>supprimés</strong></li>
                  <li>Votre historique de jeu est <strong>supprimé</strong></li>
                  <li>Cette action est <strong>irréversible</strong></li>
                </ul>
              </div>
              
              <div className="bg-[#0b0c10] p-6 rounded-lg border-l-4 border-[#f7c80e]">
                <h3 className="text-[#f7c80e] font-semibold mb-3">Rétention des données</h3>
                <p>
                  Les données statistiques anonymisées peuvent être conservées à des fins d'amélioration du service, 
                  mais ne permettent plus de vous identifier personnellement.
                </p>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-2xl font-semibold text-[#f7c80e] mb-4 flex items-center">
              📧 Contact et Exercice des Droits
            </h2>
            <div className="text-gray-300 space-y-3">
              <p>
                Pour exercer vos droits ou pour toute question concernant vos données personnelles :
              </p>
              <div className="bg-[#0b0c10] p-4 rounded-lg">
                <p>
                  🔧 <strong>Via les paramètres :</strong> Vous pouvez directement gérer vos données depuis la page paramètres
                </p>
              </div>
            </div>
          </section>
          <section className="border-t border-[#44a29f] pt-6">
            <h2 className="text-2xl font-semibold text-[#f7c80e] mb-4 flex items-center">
              🔄 Mises à Jour
            </h2>
            <div className="text-gray-300">
              <p>
                Cette politique de confidentialité peut être mise à jour. 
                Les modifications importantes vous seront notifiées lors de votre prochaine connexion.
              </p>
              <p className="text-sm text-[#5d5570] mt-4">
                Dernière mise à jour : 26 mai 2025
              </p>
            </div>
          </section>
        </div>
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-[#5d5570] hover:bg-[#44a29f] text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            ← Retour
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="bg-[#44a29f] hover:bg-[#f7c80e] hover:text-[#0b0c10] text-white px-6 py-3 rounded-lg font-semibold transition duration-200"
          >
            Gérer mes données
          </button>
        </div>
      </div>
    </div>
  );
};

export default RGPDPage;