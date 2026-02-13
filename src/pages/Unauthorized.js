import { useNavigate } from "react-router-dom";
import comingSoonImg from "../assets/images/defultlogo.png";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center  text-center animate-slide-fade-in">
      <div className="bg-white border-2 border-system-primary shadow-lg rounded-2xl p-10 max-w-md w-full transform animate-slide-fade-in hover:scale-105 transition-transform">
        <div className="flex justify-center mb-6 animate-slide-down">
          <img
            src={comingSoonImg}
            alt="Unauthorized"
            className="w-20 sm:w-24 object-contain animate-bounce"
          />
        </div>
        <h2 className="text-3xl font-bold mb-4 text-system-primary  animate-slide-fade-in">
          Unauthorized Access!
        </h2>
        <p className="text-gray-700 mb-6 animate-slide-fade-in delay-75">
          You do not have permission to view this page. Please contact your
          administrator if you believe this is a mistake.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-system-primary  hover:bg-gray-700 text-white font-bold px-6 py-2 rounded-xl transition-colors animate-slide-fade-in delay-150"
        >
          Go Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
