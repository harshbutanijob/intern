"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";

const loginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().required("Password is required"),
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get("registered")) {
      setSuccess("Account created successfully! Please sign in.");
    }
  }, [searchParams]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      setSuccess(null);

      const res = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setSubmitting(false);
      } else {
        const session = await fetch("/api/auth/session").then((r) => r.json());
        const role = session?.user?.role;
        if (role === "admin") router.push("/dashboard");
        else if (role === "manager") router.push("/dashboard/manager");
        else router.push("/dashboard/user");
      }
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-app-bg">
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-black mb-2 tracking-tight">Sign In</h2>
            <p className="text-zinc-500">Enter your credentials to access your account</p>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {success}
            </div>
          )}

          {error && (
            <div className="alert-error mb-6 flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <div>
              <label className="form-label mb-1.5 block">Email Address</label>
              <input
                type="email"
                className={`form-input bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-primary/50 ${
                  formik.touched.email && formik.errors.email ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
                placeholder="you@company.com"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.email}</div>
              ) : null}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label block m-0">Password</label>
                <Link href="#" className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                className={`form-input bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-primary/50 ${
                  formik.touched.password && formik.errors.password ? "border-red-500 focus:ring-red-500/20" : ""
                }`}
                placeholder="••••••••"
                {...formik.getFieldProps("password")}
              />
              {formik.touched.password && formik.errors.password ? (
                <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.password}</div>
              ) : null}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-base font-semibold mt-4 shadow-lg shadow-primary/10 transition-all hover:shadow-primary/20 active:scale-[0.98]"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-zinc-500 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary font-semibold hover:text-primary-dark transition-colors pl-1">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
