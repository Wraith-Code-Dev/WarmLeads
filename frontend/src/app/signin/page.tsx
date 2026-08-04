'use client';
import { useState } from "react";
import { Zap, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            
            if (error) {
                setError(error.message);
                setIsLoading(false);
                return;
            }
            
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || "Failed to sign in");
            setIsLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen w-full bg-white flex items-center justify-center p-4 overflow-hidden absolute inset-0 z-[100]"
            style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.4) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.4) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }}
        >
            <div className="w-full max-w-lg scale-[0.75] sm:scale-100 origin-center transition-transform py-2 bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-gray-200">
                {/* Logo & Branding */}
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Zap className="w-7 h-7 text-violet-600 fill-violet-600" />
                        </div>
                        <div className="text-left">
                            <h2 className="text-2xl font-black text-black tracking-tighter leading-none">WARMLEADS</h2>
                            <p className="text-violet-600 text-xs font-bold tracking-[0.2em] transform scale-y-90 uppercase">Platform</p>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-3">ACCESS_PORTAL_V4</h1>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-black bg-black text-white border-2 border-black rounded-md uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                        AUTH_MODE: ZERO_TRUST_ENCRYPTION
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg p-8 sm:p-10 relative overflow-visible shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2 duration-300">
                            <AlertCircle className="shrink-0" size={18} />
                            <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
                                // IDENTITY_URI
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    inputMode="email"
                                    autoComplete="username"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="OPERATOR@SYSTEM.COM"
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-black rounded-lg text-sm font-black text-black placeholder:text-gray-300 focus:outline-none focus:bg-violet-50 hover:shadow-md transition-all uppercase"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
                                // CRYPTOGRAPHIC_KEY
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-4 bg-white border border-black rounded-lg text-sm font-black text-black placeholder:text-gray-300 focus:outline-none focus:bg-violet-50 hover:shadow-md transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border border-black bg-white peer-checked:bg-violet-600 peer-checked:border-violet-600 transition-colors rounded"></div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-black group-hover:text-violet-600 transition-colors">PERSIST_SESSION</span>
                            </label>
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-violet-600 hover:underline">
                                RECOVER_ACCESS
                            </button>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full px-6 py-5 bg-black text-white border border-black rounded-lg flex items-center justify-center gap-3 text-lg font-black uppercase tracking-wider hover:shadow-md transition-all group ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
                        >
                            {isLoading ? 'INITIALIZING_LINK...' : (
                                <>
                                    INITIALIZE_SESSION
                                    <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>


                </div>

                <div className="mt-6 text-center space-y-4">
                    <p className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                        NULL_ACCOUNT_RECORD? <a href="#" className="text-violet-600 hover:underline transition-all">REQUEST_CREDENTIALS</a>
                    </p>
                    <div className="flex justify-center items-center gap-4 text-[10px] font-black text-black/20 uppercase tracking-[0.2em]">
                        <span className="w-8 h-px bg-black/10" />
                        <Link href="/" className="hover:text-black transition-colors">RETURN_TO_ROOT_DOMAIN</Link>
                        <span className="w-8 h-px bg-black/10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
