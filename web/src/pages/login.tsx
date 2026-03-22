import { useNavigate } from "@tanstack/react-router";
import { LoginForm } from "../components/forms/LoginForm";
import { useLoginForm } from "../hooks/useLoginForm";

export function LoginPage() {
  const navigate = useNavigate();
  const formProps = useLoginForm({
    onLoginSuccess: () => void navigate({ to: "/dashboard" }),
  });
  return <LoginForm {...formProps} />;
}
