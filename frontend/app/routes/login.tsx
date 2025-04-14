import { LoginForm } from '~/components/login-form'; // Adjust path

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center bg-gray-100 dark:bg-gray-900 min-h-screen">
      <LoginForm />
    </div>
  );
}