"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import client from "../../lib/apolloClient";
import { gql } from "@apollo/client";
import bcrypt from "bcryptjs";
import { useFormik } from "formik";
import * as Yup from "yup";

const REGISTER_USER = gql`
  mutation RegisterUser(
    $name: String!
    $email: String!
    $password: String!
    $role: String!
    $created_at: timestamp!
  ) {
    insert_users_one(
      object: {
        name: $name
        email: $email
        password: $password
        role: $role
        created_at: $created_at
      }
    ) {
      id
      name
      email
      role
      created_at
    }
  }
`;

type RegisterUserResult = {
  insert_users_one: {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
};

const validationSchema = Yup.object({
  username: Yup.string().required("Full name is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setError(null);
      try {
        const createdAt = new Date().toISOString();
        const hashedPassword = await bcrypt.hash(values.password, 10);

        // Enforce 'user' role for public registration
        const role = "user";

        const res = await client.mutate<RegisterUserResult>({
          mutation: REGISTER_USER,
          variables: { name: values.username, email: values.email, password: hashedPassword, role, created_at: createdAt },
        });

        if (res.data?.insert_users_one) {
          router.push("/login?registered=true");
        } else {
          setError("Failed to register user. Please try again.");
        }
      } catch (err) {
        console.error("Apollo error:", err);
        setError("Registration failed. Email might already be in use.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col md:flex-row bg-app-bg text-black">
      <div className="flex-1 flex items-center justify-center p-8 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold text-black mb-2 tracking-tight">Create your account</h2>
            <p className="text-zinc-500">Join InternHub and manage your internship efficiently</p>
          </div>

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
              <label className="form-label mb-1.5 block">Full Name</label>
              <input
                type="text"
                className={`form-input bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-primary/50 ${formik.touched.username && formik.errors.username ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
                placeholder="John Doe"
                {...formik.getFieldProps("username")}
              />
              {formik.touched.username && formik.errors.username ? (
                <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.username}</div>
              ) : null}
            </div>

            <div>
              <label className="form-label mb-1.5 block">Email Address</label>
              <input
                type="email"
                className={`form-input bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-primary/50 ${formik.touched.email && formik.errors.email ? "border-red-500 focus:ring-red-500/20" : ""
                  }`}
                placeholder="john@example.com"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.email}</div>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1.5 block">Password</label>
                <input
                  type="password"
                  className={`form-input bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-primary/50 ${formik.touched.password && formik.errors.password ? "border-red-500 focus:ring-red-500/20" : ""
                    }`}
                  placeholder="••••••••"
                  {...formik.getFieldProps("password")}
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.password}</div>
                ) : null}
              </div>
              <div>
                <label className="form-label mb-1.5 block">Confirm Password</label>
                <input
                  type="password"
                  className={`form-input bg-white border-zinc-200 text-black placeholder:text-zinc-400 focus:border-primary/50 ${formik.touched.confirmPassword && formik.errors.confirmPassword ? "border-red-500 focus:ring-red-500/20" : ""
                    }`}
                  placeholder="••••••••"
                  {...formik.getFieldProps("confirmPassword")}
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
                  <div className="text-red-500 text-xs mt-1 font-medium">{formik.errors.confirmPassword}</div>
                ) : null}
              </div>
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
                  Processing...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-zinc-500 text-sm">
            Already have an account?{" "}
            <button onClick={() => router.push("/login")} className="text-primary font-bold hover:underline">
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

