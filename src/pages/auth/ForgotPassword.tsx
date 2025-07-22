import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function ForgotPassword() {
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setLoading(true);
      await forgotPassword(email);
      setSubmitted(true);
    } catch (error) {
      // Error is handled in the AuthContext
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid max-w-md">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>
              {submitted
                ? "Email enviado! Verifique sua caixa de entrada."
                : "Enviaremos um link para redefinir sua senha"}
            </CardDescription>
          </CardHeader>
          {!submitted ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar link de recuperação"}
                </Button>
                <div className="text-sm text-muted-foreground text-center">
                  <Link to="/auth/login" className="hover:underline font-medium">
                    Voltar para o login
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center">
                Verifique seu email para o link de recuperação de senha. Se não encontrar, verifique a pasta de spam.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth/login">Voltar para o login</Link>
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}