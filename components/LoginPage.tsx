import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const LoginPage: React.FC = () => {
    const [isRegisterView, setIsRegisterView] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isRegisterView) {
                // Register
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setMessage('Đăng ký thành công! Vui lòng kiểm tra email của bạn để xác thực tài khoản.');
            } else {
                // Login
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // No message needed on successful login, App.tsx will redirect.
            }
        } catch (error: any) {
             let errorMessage = "Đã xảy ra lỗi. Vui lòng thử lại.";
             if (error.message) {
                 switch (error.message) {
                    case 'Invalid login credentials':
                        errorMessage = 'Email hoặc mật khẩu không đúng.';
                        break;
                    case 'User already registered':
                        errorMessage = 'Email này đã được đăng ký. Vui lòng đăng nhập.';
                        break;
                    case 'Password should be at least 6 characters':
                        errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự.';
                        break;
                    case 'Email not confirmed':
                        errorMessage = 'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn trong email xác nhận.';
                        break;
                    default:
                        errorMessage = error.message;
                 }
             }
             setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center items-center gap-4 mb-8">
                     <svg className="w-10 h-10 text-blue-600" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM12 15L8 11H11V8H13V11H16L12 15Z"/>
                    </svg>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Trợ lý Quản lý Hợp đồng</h1>
                </div>

                <div className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-center text-slate-800 dark:text-slate-200 mb-6">
                        {isRegisterView ? 'Tạo tài khoản mới' : 'Đăng nhập'}
                    </h2>

                    <form onSubmit={handleAuthAction} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Địa chỉ Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Mật khẩu
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete={isRegisterView ? "new-password" : "current-password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3 bg-white dark:bg-slate-900/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                                />
                            </div>
                        </div>

                        {error && <p className="text-sm text-center text-red-600 dark:text-red-400">{error}</p>}
                        {message && <p className="text-sm text-center text-green-600 dark:text-green-400">{message}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : isRegisterView ? 'Đăng ký' : 'Đăng nhập'}
                            </button>
                        </div>
                    </form>

                    <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                        {isRegisterView ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                        <button
                            onClick={() => {
                                setIsRegisterView(!isRegisterView);
                                setError(null);
                                setMessage(null);
                            }}
                            className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                            {isRegisterView ? 'Đăng nhập ngay' : 'Đăng ký'}
                        </button>
                    </p>
                </div>
                 <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
                    <p>Tài khoản demo:</p>
                    <p>Email: <span className="font-mono">admin@longkhanh.com</span></p>
                    <p>Mật khẩu: <span className="font-mono">LongKh@nh</span></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;