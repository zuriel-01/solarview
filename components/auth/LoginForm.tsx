// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export function LoginForm() {
//   const router = useRouter();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");

//     try {
//         email,
//         password,
//       });

//       if (signInError) {
//         console.error("Login error:", signInError);
//         setError(signInError.message);
//         return;
//       }

//       if (data?.user) {
//         console.log("Login successful:", data);
//         router.replace("/home");
//       } else {
//         setError("Login failed. Please try again.");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       setError("Failed to sign in. Please try again.");
//     }
//   };

//   return (
//     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
//       <div className="rounded-md shadow-sm -space-y-px">
//         <div>
//           <label htmlFor="email-address" className="sr-only">
//             Email address
//           </label>
//           <input
//             id="email-address"
//             name="email"
//             type="email"
//             autoComplete="email"
//             required
//             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//             placeholder="Email address"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//           />
//         </div>
//         <div>
//           <label htmlFor="password" className="sr-only">
//             Password
//           </label>
//           <input
//             id="password"
//             name="password"
//             type="password"
//             autoComplete="current-password"
//             required
//             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
//             placeholder="Password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//           />
//         </div>
//       </div>

//       {error && (
//         <div className="text-red-500 text-sm text-center">{error}</div>
//       )}

//       <div className="flex items-center justify-between">
//         <div className="flex items-center">
//           <input
//             id="remember-me"
//             name="remember-me"
//             type="checkbox"
//             className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
//           />
//           <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
//             Remember me
//           </label>
//         </div>

//         <div className="text-sm">
//           <Link href="/auth/login/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
//             Forgot your password?
//           </Link>
//         </div>
//       </div>

//       <div>
//         <button
//           type="submit"
//           className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//         >
//           Sign in
//         </button>
//       </div>

//       <div className="text-sm text-center">
//         <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
//           Don&apos;t have an account? Sign up
//         </Link>
//       </div>
//     </form>
//   );
// }