import { ResetPasswordForm } from "../components/forms/ResetPasswordForm";
import { useResetPasswordForm } from "../hooks/useResetPasswordForm";

export function ResetPasswordPage() {
  const formProps = useResetPasswordForm({
    onResetSuccess: () => {},
  });
  return <ResetPasswordForm {...formProps} />;
}
