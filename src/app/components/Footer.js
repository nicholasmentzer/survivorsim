const Footer = () => {
    return (
      <footer className="bg-stone-700 text-white text-center py-6 w-full mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm mb-2">Fan created, non-profit. Not associated with Survivor/Paramount/CBS etc.</p>
          <p className="text-sm mb-2">Entered data (images, names, etc.) is never stored.</p>
          <button 
            onClick={() => window.open("https://docs.google.com/forms/d/e/1FAIpQLSekwH0_X3jVy6v4rjq0QaXkcHH9bHuKIdKtXEj8HFp5ROLOzw/viewform?usp=header", "_blank")} 
            className="bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900"
            >
            Contact Me
            </button>
        </div>
      </footer>
    );
  };
  
  export default Footer;