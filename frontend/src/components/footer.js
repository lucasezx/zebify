import React from "react";
import "../components/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>
        Zebify &copy; {new Date().getFullYear()} - Todos os direitos
        reservados.
      </p>
    </footer>
  );
};

export default Footer;
