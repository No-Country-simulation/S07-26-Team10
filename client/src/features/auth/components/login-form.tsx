"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { loginAction } from "@/features/auth/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  rememberMe: z.boolean().optional(),
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
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = watch("rememberMe");

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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {serverError && (
        <Alert
          variant="destructive"
          className="border-destructive/30 bg-destructive/10"
        >
          <AlertCircle className="size-4" />
          <AlertTitle className="font-semibold text-sm">
            {t("authError")}
          </AlertTitle>
          <AlertDescription className="text-xs">{serverError}</AlertDescription>
        </Alert>
      )}

      {/* Email Field */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left"
        >
          {t("emailLabel")}
        </label>
        <Input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          className="h-11 rounded-md bg-background border-input text-foreground text-sm focus-visible:ring-1 transition-all"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <span className="text-xs text-destructive font-medium pl-1 text-left">
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Password Field */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-left"
          >
            {t("passwordLabel")}
          </label>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-xs text-muted-foreground hover:text-foreground hover:underline italic transition-colors"
          >
            {t("forgotPassword")}
          </a>
        </div>
        <div className="relative flex items-center">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="pr-10 h-11 rounded-md bg-background border-input text-foreground text-sm focus-visible:ring-1 transition-all"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <span className="text-xs text-destructive font-medium pl-1 text-left">
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Remember Me Checkbox */}
      <div className="flex items-center gap-2 pt-1">
        <Checkbox
          id="rememberMe"
          checked={rememberMe}
          onCheckedChange={(checked) => setValue("rememberMe", !!checked)}
        />
        <label
          htmlFor="rememberMe"
          className="text-sm font-normal text-foreground cursor-pointer select-none"
        >
          {t("rememberMe")}
        </label>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 mt-2 rounded-md font-semibold tracking-wider uppercase text-sm flex items-center justify-center gap-2 transition-all"
      >
        {isSubmitting ? (
          <>
            <Spinner className="size-4" />
            {t("signingIn")}
          </>
        ) : (
          <>
            {t("signIn")}
            <ArrowRight className="size-4" />
          </>
        )}
      </Button>
    </form>
  );
}
