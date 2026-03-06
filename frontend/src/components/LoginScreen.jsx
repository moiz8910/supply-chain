import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Activity, ShieldCheck, Zap } from 'lucide-react';

const LoginScreen = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate network request
        setTimeout(() => {
            setIsLoading(false);
            localStorage.setItem('isAuthenticated', 'true');
            // Navigate to main dashboard
            navigate('/');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-white flex w-full">
            {/* Left Side - Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative z-10">
                <div className="max-w-md w-full mx-auto">
                    {/* Brand/Logo Area */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                            <Activity className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-black text-gray-900 tracking-tight">SupplyCtrl</span>
                    </div>

                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Welcome back</h1>
                        <p className="text-gray-500 font-medium">Please enter your details to access the control tower.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 block">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-gray-700 block">Password</label>
                                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Forgot password?</a>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                                    Remember me for 30 days
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <>
                                    Sign In <ArrowRight className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </button>

                        <div className="pt-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500 font-medium">Enterprise SSO</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                        >
                            <img className="h-5 w-5 mr-2" src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Microsoft" />
                            Continue with Microsoft
                        </button>
                    </form>
                </div>
            </div>

            {/* Right Side - Image/Feature Showcase */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-900 border-l border-indigo-800">
                {/* Abstract Background Overlay */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8ed7450951?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-900/80 to-indigo-900/40"></div>

                <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24 h-full text-white w-full">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-800/50 backdrop-blur-md border border-indigo-700 text-indigo-200 font-semibold text-sm mb-6 w-max shadow-xl">
                        Supply System v2.4
                    </div>
                    <h2 className="text-5xl font-bold mb-6 leading-tight tracking-tight">AI-Powered <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">Control Tower</span></h2>
                    <p className="text-lg text-indigo-200 mb-12 max-w-lg leading-relaxed font-medium">
                        Real-time visibility, automated exception management, and predictive optimization for your modern supply chain operation.
                    </p>

                    <div className="space-y-6">
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-800/30 border border-indigo-700/50 backdrop-blur-sm max-w-md shadow-xl">
                            <div className="p-3 bg-indigo-700/50 rounded-xl shrink-0">
                                <Zap className="h-6 w-6 text-blue-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">Real-time Optimization</h3>
                                <p className="text-indigo-200 text-sm">React to anomalies before they impact your delivery SLA.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-800/30 border border-indigo-700/50 backdrop-blur-sm max-w-md shadow-xl">
                            <div className="p-3 bg-indigo-700/50 rounded-xl shrink-0">
                                <ShieldCheck className="h-6 w-6 text-blue-300" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-1">Enterprise Security</h3>
                                <p className="text-indigo-200 text-sm">Bank-grade encryption and granular role-based access control.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
