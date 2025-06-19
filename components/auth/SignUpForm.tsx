// 'use client';

// import { useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { supabase } from '@/supabase';

// export function SignUpForm() {
//   const router = useRouter();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const { data, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (signUpError) {
//         console.error('Signup error:', signUpError);
//         setError(signUpError.message);
//         return;
//       }

//       if (data?.user) {
//         console.log('Signup successful:', data);
//         router.replace('/data/Settings/ManageSystemAppliances');
//       } else {
//         setError('Signup failed. Please try again.');
//       }
//     } catch (error) {
//       console.error('Signup error:', error);
//       setError('Failed to create account. Please try again.');
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
//             autoComplete="new-password"
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

//       <div>
//         <button
//           type="submit"
//           className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//         >
//           Sign up
//         </button>
//       </div>

//       <div className="text-sm text-center">
//         <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500">
//           Already have an account? Sign in
//         </Link>
//       </div>
//     </form>
//   );
// } 