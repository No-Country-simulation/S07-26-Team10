"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, AlertCircle, LogIn } from "lucide-react";
import { useTranslations } from "next-intl";

import { loginAction } from "@/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z
    .string()
    .min(1, "La contraseña es obligatoria")
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const t = useTranslations("LoginPage");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const result = await loginAction(data);
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      console.error("Error during login:", err);
      setServerError("Ocurrió un error inesperado al intentar iniciar sesión.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {serverError && (
        <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
          <AlertCircle className="size-4" />
          <AlertTitle className="font-semibold text-sm">{t("authError")}</AlertTitle>
          <AlertDescription className="text-xs">{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {t("emailLabel")}
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="admin@physaflow.com"
            autoComplete="email"
            className="pl-10 h-11 rounded-2xl bg-muted/40 focus-visible:bg-background border-border/60 transition-all text-sm"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </div>
        {errors.email && (
          <span className="text-xs text-destructive font-medium pl-1">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {t("passwordLabel")}
          </label>
        </div>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pl-10 pr-10 h-11 rounded-2xl bg-muted/40 focus-visible:bg-background border-border/60 transition-all text-sm"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-destructive font-medium pl-1">
            {errors.password.message}
          </span>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 mt-2 rounded-2xl font-medium shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
      >
        {isSubmitting ? (
          <>
            <Spinner className="mr-2 size-4" />
            {t("signingIn")}
          </>
        ) : (
          <>
            <LogIn className="mr-2 size-4" />
            {t("signIn")}
          </>
        )}
      </Button>
    </form>
  );
}
