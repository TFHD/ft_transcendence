import React, { useEffect } from 'react';
import axios from "axios";

const host = window.location.hostname;

const GoogleLoginButton = () => {
  useEffect(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: "776020834229-alq7m14cs9l6u2ipmv03vsacq3usinl3.apps.googleusercontent.com",
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-btn"),
        { theme: "outline", size: "large" }
      );
    }
  }, []);

  const handleCredentialResponse = async (response: any) => {
    const { credential: id_token } = response;
    try {
      await axios.post(`https://${host}:8000/api/auth/google`, { id_token }, {
        withCredentials: true
      });
      window.location.reload();
    } catch (err) {
    }
  };

  return <div id="google-signin-btn"></div>;
};

export default GoogleLoginButton;