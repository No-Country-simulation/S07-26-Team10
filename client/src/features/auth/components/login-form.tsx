"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { loginAction } from "@/features/auth/auth-actions";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
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
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const rememberMe = useWatch({ control, name: "rememberMe" });

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
    <form
      onSubmit={handleSubmit(onSubmit)}
      style={{ display: "flex", flexDirection: "column" }}
    >
      {serverError && (
        <div style={{ marginBottom: "16px" }}>
          <Alert
            variant="destructive"
            className="border-destructive/30 bg-destructive/10"
          >
            <AlertCircle className="size-4" />
            <AlertTitle className="font-semibold text-sm">
              {t("authError")}
            </AlertTitle>
            <AlertDescription className="text-xs">
              {serverError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Campo de Correo (.fld del prototipo) */}
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor="email"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#00603a",
            marginBottom: "7px",
            letterSpacing: "-0.01em",
            fontFamily: "'Inter Tight', system-ui, sans-serif",
          }}
        >
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          placeholder={t("emailPlaceholder")}
          autoComplete="email"
          className="w-full h-[42px] px-[14px] rounded-[8px] bg-white text-[14px] text-[#08090a] outline-none transition-all duration-150 focus:border-[#00603a] focus:ring-2 focus:ring-[#00603a]/12"
          style={{
            border: errors.email ? "1px solid #b3261e" : "1px solid #ebebeb",
            fontFamily: "inherit",
            boxSizing: "border-box",
          }}
          {...register("email")}
        />
        {errors.email && (
          <span
            style={{
              fontSize: "12px",
              color: "#b3261e",
              fontWeight: 500,
              display: "block",
              marginTop: "4px",
            }}
          >
            {errors.email.message}
          </span>
        )}
      </div>

      {/* Campo de Contraseña (.fld del prototipo) */}
      <div style={{ marginBottom: "14px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            marginBottom: "7px",
          }}
        >
          <label
            htmlFor="password"
            style={{
              flex: 1,
              fontSize: "14px",
              fontWeight: 500,
              color: "#00603a",
              letterSpacing: "-0.01em",
              fontFamily: "'Inter Tight', system-ui, sans-serif",
            }}
          >
            {t("passwordLabel")}
          </label>
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              fontSize: "12.5px",
              color: "#00603a",
              textDecoration: "none",
              fontFamily: "'Inter Tight', system-ui, sans-serif",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.textDecoration = "underline")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            {t("forgotPassword")}
          </a>
        </div>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full h-[42px] pl-[14px] pr-[38px] rounded-[8px] bg-white text-[14px] text-[#08090a] outline-none transition-all duration-150 focus:border-[#00603a] focus:ring-2 focus:ring-[#00603a]/12"
            style={{
              border: errors.password
                ? "1px solid #b3261e"
                : "1px solid #ebebeb",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "10px",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#6f6f6f",
              display: "flex",
              alignItems: "center",
              padding: "4px",
            }}
            aria-label={showPassword ? t("hidePassword") : t("showPassword")}
          >
            {showPassword ? (
              <EyeOff style={{ width: 16, height: 16, strokeWidth: 1.8 }} />
            ) : (
              <Eye style={{ width: 16, height: 16, strokeWidth: 1.8 }} />
            )}
          </button>
        </div>
        {errors.password && (
          <span
            style={{
              fontSize: "12px",
              color: "#b3261e",
              fontWeight: 500,
              display: "block",
              marginTop: "4px",
            }}
          >
            {errors.password.message}
          </span>
        )}
      </div>

      {/* Casilla de Mantener Sesión (.chk del prototipo) */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "14px",
          color: "#08090a",
          margin: "4px 0 22px 0",
          cursor: "pointer",
          userSelect: "none",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
        }}
        onClick={() => setValue("rememberMe", !rememberMe)}
      >
        <i
          style={{
            width: "17px",
            height: "17px",
            borderRadius: "4px",
            background: rememberMe ? "#00603a" : "#ffffff",
            border: rememberMe ? "none" : "1px solid #c8c8c8",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
            transition: "background .16s, border-color .16s",
          }}
        >
          {rememberMe && (
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "11px",
                height: "11px",
                stroke: "#ffffff",
                fill: "none",
                strokeWidth: 2.4,
              }}
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          )}
        </i>
        <span>{t("rememberMe")}</span>
      </label>

      {/* Botón Ingresar (.b.pri del prototipo) */}
      <button
        type="submit"
        disabled={isSubmitting}
        style={{
          width: "100%",
          height: "44px",
          borderRadius: "8px",
          background: isSubmitting ? "#0e4a2e" : "#00603a",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          border: "none",
          cursor: isSubmitting ? "not-allowed" : "pointer",
          transition: "background .16s",
          fontFamily: "'Inter Tight', system-ui, sans-serif",
          letterSpacing: "-0.01em",
        }}
        onMouseEnter={(e) => {
          if (!isSubmitting)
            (e.currentTarget as HTMLElement).style.background = "#0e4a2e";
        }}
        onMouseLeave={(e) => {
          if (!isSubmitting)
            (e.currentTarget as HTMLElement).style.background = "#00603a";
        }}
      >
        {isSubmitting ? (
          <>
            <Spinner style={{ width: 16, height: 16 }} />
            <span>{t("signingIn")}</span>
          </>
        ) : (
          <>
            <span>{t("signIn")}</span>
            <svg
              viewBox="0 0 24 24"
              style={{
                width: "16px",
                height: "16px",
                stroke: "currentColor",
                fill: "none",
                strokeWidth: 2,
              }}
            >
              <path d="M5 12h13M12 6l6 6-6 6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
