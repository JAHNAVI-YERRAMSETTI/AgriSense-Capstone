import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import { registerFarmer } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import "./Register.css";

function Register() {
    const navigate = useNavigate();

    const { setAuthenticatedFarmer } = useAuth();
    const { t } = useLanguage();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        location: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleRegister = async (event) => {
        event.preventDefault();

        if (
            !formData.name.trim() ||
            !formData.email.trim() ||
            !formData.password.trim()
        ) {
            toast.error(t("requiredFields"));
            return;
        }

        try {
            setLoading(true);

            const data = await registerFarmer(formData);

            if (!data.success) {
                throw new Error(
                    data.message || "Registration failed"
                );
            }

            // Store newly registered farmer in AuthContext
            setAuthenticatedFarmer(data);

            toast.success(t("registrationSuccessful"));

            // Go directly to dashboard
            navigate("/dashboard");

        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                "Registration failed";

            toast.error(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-page">

            {/* Top Navigation */}
            <div className="register-top-navigation">

                <button
                    type="button"
                    className="register-home-button"
                    onClick={() => navigate("/")}
                >
                    <span className="register-home-logo">
                        🌱
                    </span>

                    <span>
                        AgriSense
                    </span>
                </button>

                <LanguageSelector />

            </div>


            <div className="register-card">

                <div className="register-logo">
                    🌱
                </div>

                <h1>
                    {t("appName")}
                </h1>

                <p className="register-subtitle">
                    {t("appSubtitle")}
                </p>

                <h2>
                    {t("farmerRegistration")}
                </h2>


                <form onSubmit={handleRegister}>

                    {/* Name */}
                    <div className="register-form-group">

                        <label htmlFor="name">
                            {t("name")} *
                        </label>

                        <input
                            id="name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder={t("name")}
                            autoComplete="name"
                            disabled={loading}
                        />

                    </div>


                    {/* Email */}
                    <div className="register-form-group">

                        <label htmlFor="email">
                            {t("email")} *
                        </label>

                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t("enterEmail")}
                            autoComplete="email"
                            disabled={loading}
                        />

                    </div>


                    {/* Password */}
                    <div className="register-form-group">

                        <label htmlFor="password">
                            {t("password")} *
                        </label>

                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={t("enterPassword")}
                            autoComplete="new-password"
                            disabled={loading}
                        />

                    </div>


                    {/* Phone */}
                    <div className="register-form-group">

                        <label htmlFor="phone">
                            {t("phone")}
                        </label>

                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder={t("phone")}
                            autoComplete="tel"
                            disabled={loading}
                        />

                    </div>


                    {/* Location */}
                    <div className="register-form-group">

                        <label htmlFor="location">
                            {t("location")}
                        </label>

                        <input
                            id="location"
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder={t("location")}
                            disabled={loading}
                        />

                    </div>


                    <button
                        type="submit"
                        className="register-button"
                        disabled={loading}
                    >
                        {loading
                            ? t("creatingAccount")
                            : t("createAccount")}
                    </button>

                </form>


                <p className="register-login-text">

                    {t("alreadyHaveAccount")}{" "}

                    <span
                        onClick={() => navigate("/login")}
                    >
                        {t("login")}
                    </span>

                </p>


                {/* Back to Home */}
                <button
                    type="button"
                    className="register-back-home"
                    onClick={() => navigate("/")}
                >
                    ← Back to Home
                </button>

            </div>

        </div>
    );
}

export default Register;