import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import { login, setAuth } from "../lib/api";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return; 

    setIsLoading(true);
    setError("");

    try {
      const data = await login(email.trim().toLowerCase(), password);

      setAuth(data.token, data.user);

      navigate({ to: "/dashboard", replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 relative overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:50px_50px] opacity-30" />

      <div className="w-full max-w-md relative z-10">

        <a
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to homepage
        </a>

        <div className="text-center mb-10">
          <h1 className="text-5xl font-black">Welcome back</h1>
          <p className="text-muted-foreground mt-3">
            Sign in to track your gains
          </p>
        </div>

        <div className="bg-card border border-border rounded-3xl p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Email address
              </label>

              <input
                type="email"
                value={email}
                disabled={isLoading}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                placeholder="you@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2 text-muted-foreground">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-background border border-border rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/30 outline-none"
                  placeholder="••••••••"
                  required
                />

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 p-3 rounded-2xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold py-4 rounded-2xl hover:opacity-90 active:scale-[0.985] transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-muted-foreground mt-8">
          Don't have an account?{" "}
          <a href="/register" className="text-primary hover:underline font-medium">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
export default Login;