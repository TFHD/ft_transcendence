import React, { useState } from 'react';

interface Modal2FAProps {
  message: string;
  onSubmit: (code: string) => void;
  onClose: () => void;
}

const Modal2FA: React.FC<Modal2FAProps> = ({ message, onSubmit, onClose }) => {
  const [code, setCode] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[#1e2933] p-6 rounded-lg shadow-lg w-80 text-white space-y-4">
        <h3 className="text-lg font-semibold text-center">{message}</h3>
        <input
          type="text"
          placeholder="Code 2FA"
          className="w-full p-2 rounded bg-[#0b0c10] border border-[#5d5570] text-white"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
          >
            Annuler
          </button>
          <button
            onClick={() => onSubmit(code)}
            className="px-4 py-2 bg-[#44a29f] hover:bg-[#3b8a8a] rounded"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal2FA;