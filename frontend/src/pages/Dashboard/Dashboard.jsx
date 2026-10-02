import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import "./Dashboard.css";

function Dashboard() {
    const { farmer } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="dashboard-layout">

            <Sidebar />

            <main className="dashboard-main">

                <header className="dashboard-header">
                    <div>
                        <h1>
                            {t("welcome")}, {farmer?.name || t("farmer")} 👋
                        </h1>

                        <p>
                            {t("agriculturalDecisionSupport")}
                        </p>
                    </div>

                    <LanguageSelector />
                </header>

                <section className="dashboard-cards">

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            🌾
                        </div>

                        <div>
                            <h3>{t("farmer")}</h3>
                            <p>{farmer?.name || "-"}</p>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            🏡
                        </div>

                        <div>
                            <h3>{t("farm")}</h3>
                            <p>{t("manageFarmCrop")}</p>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            🌱
                        </div>

                        <div>
                            <h3>{t("farmState")}</h3>
                            <p>{t("manageFarmState")}</p>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="dashboard-card-icon">
                            🧠
                        </div>

                        <div>
                            <h3>{t("predictions")}</h3>
                            <p>{t("agriculturalPredictions")}</p>
                        </div>
                    </div>

                </section>

                <section className="dashboard-flow">

                    <div className="dashboard-section-header">
                        <div>
                            <h2>{t("decisionFlow")}</h2>

                            <p>
                                {t("decisionFlowDescription")}
                            </p>
                        </div>
                    </div>

                    <div className="decision-flow-container">

                        <div className="flow-step">
                            <span>👨‍🌾</span>
                            <p>{t("farmer")}</p>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-step">
                            <span>🏡</span>
                            <p>{t("farm")}</p>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-step">
                            <span>🌱</span>
                            <p>{t("farmState")}</p>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-step">
                            <span>🧠</span>
                            <p>{t("predictions")}</p>
                        </div>

                        <div className="flow-arrow">→</div>

                        <div className="flow-step">
                            <span>📋</span>
                            <p>{t("actionPlan")}</p>
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Dashboard;