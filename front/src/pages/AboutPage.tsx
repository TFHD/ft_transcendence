import React, { useState } from 'react';

const AboutPage = () => {
  const [linkLabel, setLinkLabel] = useState('Changer de label');
  const [clicked, setClicked] = useState(false);

  const host = import.meta.env.VITE_ADRESS;
  const fetchLabel = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log(host);
    try {
      const response = await fetch(`https://${host}:8000/api/button`);
      if (response.ok) {
        const data = await response.json();
        setLinkLabel(clicked ? 'Changer de label' : data.newLabel); 
        setClicked(!clicked);
      } else {
        console.error('Erreur lors de l\'appel API');
      }
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
    }
  };

  return (
    <div>
      <h1 className="mb-5">Page A propos</h1>
      <a href="#" onClick={fetchLabel} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        {linkLabel}
      </a>
    </div>
  );
};

export default AboutPage;