import { LoginForm } from "@/components/login-form";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="grid min-h-svh lg:h-svh lg:grid-cols-2 lg:overflow-hidden">
      <div className="flex flex-col gap-4 p-6 md:p-8 lg:overflow-y-auto">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <img className="h-14 w-auto object-contain" src="/system-service-logo.png" alt="iSpot logo" />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-slate-100 lg:flex lg:h-svh lg:items-center lg:justify-center dark:bg-slate-900">
        <img
          src="/comonunca.jpg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl dark:brightness-[0.2] dark:grayscale"
        />
        <img
          src="/comonunca.jpg"
          alt="iSpot Servicio Técnico Especializado"
          className="relative z-10 max-h-svh w-full h-full object-contain object-center dark:brightness-[0.85]"
        />
      </div>
    </div>
  );
};

export default Landing;
