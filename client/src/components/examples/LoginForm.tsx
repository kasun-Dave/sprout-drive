import { LoginForm } from "../LoginForm";

export default function LoginFormExample() {
  const handleLogin = async (email: string, password: string) => {
    console.log("Login attempt:", { email, password });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  return <LoginForm onLogin={handleLogin} />;
}
