import { useState } from "react";
import { LoginForm } from "@/components/LoginForm";

interface LoginProps {
  onLogin: (role: "owner" | "staff") => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    // todo: remove mock functionality - replace with real auth
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (email && password) {
      const role = email.includes("staff") ? "staff" : "owner";
      onLogin(role);
    } else {
      setError("Please enter your email and password");
    }

    setIsLoading(false);
  };

  return <LoginForm onLogin={handleLogin} isLoading={isLoading} error={error} />;
}
