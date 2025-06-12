import React from "react";

const Footer = () => {
  return (
    <footer className="py-4 text-sm text-gray-500 text-center">
      <p>
        Zebify &copy; {new Date().getFullYear()} - Todos os direitos
        reservados.
      </p>
    </footer>
  );
};

export default Footer;
