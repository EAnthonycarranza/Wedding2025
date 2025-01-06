import React, { useEffect } from "react";

const Registry = () => {
  useEffect(() => {
    // Redirect to the standalone registry page
    window.location.href = "/registry.html";
  }, []);

  return null; // No need to render anything since we're redirecting
};

export default Registry;