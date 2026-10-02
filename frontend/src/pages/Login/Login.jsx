import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import "./Login.css";

function Login() {
    const navigate = useNavigate();

    const { login } = useAuth();
    const { t } = useLanguage();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();

        if (!email.trim() || !password.trim()) {
            toast.error(t("enterEmailPassword"));
            return;
        }

        try {
            setLoading(true);

            await login(email, password);

            toast.success(t("loginSuccessful"));

            navigate("/dashboard");

        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                t("invalidCredentials");

            toast.error(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Top Navigation */}
            <div className="login-top-navigation">

                <button
                    type="button"
                    className="login-home-button"
                    onClick={() => navigate("/")}
                >
                    <span className="login-home-logo">
                        🌱
                    </span>

                    <span>
                        AgriSense
                    </span>
                </button>

                <LanguageSelector />

            </div>


            <div className="login-card">

                <div className="login-logo">
                    🌱
                </div>

                <h1>
                    {t("appName")}
                </h1>

                <p className="login-subtitle">
                    {t("appSubtitle")}
                </p>

                <h2>
                    {t("farmerLogin")}
                </h2>


                <form onSubmit={handleLogin}>

                    <div className="login-form-group">

                        <label htmlFor="email">
                            {t("email")}
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            placeholder={t("enterEmail")}
                            autoComplete="email"
                            disabled={loading}
                        />

                    </div>


                    <div className="login-form-group">

                        <label htmlFor="password">
                            {t("password")}
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            placeholder={t("enterPassword")}
                            autoComplete="current-password"
                            disabled={loading}
                        />

                    </div>


                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? t("loggingIn")
                            : t("login")}
                    </button>

                </form>


                <p className="login-register-text">

                    {t("noAccount")}{" "}

                    <span
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        {t("register")}
                    </span>

                </p>


                {/* Back to landing page */}
                <button
                    type="button"
                    className="login-back-home"
                    onClick={() => navigate("/")}
                >
                    ← Back to Home
                </button>

            </div>

        </div>
    );
}

export default Login;