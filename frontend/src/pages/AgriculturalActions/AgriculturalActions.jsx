import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
    Plus,
    BookOpen,
    RefreshCw,
    Save,
    X,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";

import { useLanguage } from "../../context/LanguageContext";

import {
    getAllAgriculturalActions,
    addAgriculturalAction,
} from "../../services/agriculturalActionService";

import "./AgriculturalActions.css";


function AgriculturalActions() {

    const { t } = useLanguage();

    const [actions, setActions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [formData, setFormData] = useState({
        actionName: "",
        category: "",
        description: "",
        requiredWater: "",
        requiredLabour: "",
        requiredBudget: "",
        applicableCrop: "",
        applicableGrowthStage: "",
        evidenceStatus: "",
        sourceReference: "",
        active: true,
    });


    /* ==========================================
       LOAD ACTIONS
    ========================================== */

    useEffect(() => {
        loadActions();
    }, []);


    const loadActions = async () => {

        try {

            setLoading(true);

            const data =
                await getAllAgriculturalActions();

            setActions(data || []);

        } catch (error) {

            console.error(error);

            toast.error(
                t("agriculturalActionsLoadFailed")
            );

        } finally {

            setLoading(false);
        }
    };


    /* ==========================================
       FORM CHANGE
    ========================================== */

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };


    /* ==========================================
       RESET
    ========================================== */

    const handleReset = () => {

        setFormData({
            actionName: "",
            category: "",
            description: "",
            requiredWater: "",
            requiredLabour: "",
            requiredBudget: "",
            applicableCrop: "",
            applicableGrowthStage: "",
            evidenceStatus: "",
            sourceReference: "",
            active: true,
        });
    };


    /* ==========================================
       SUBMIT
    ========================================== */

    const handleSubmit = async (event) => {

        event.preventDefault();


        if (!formData.actionName.trim()) {

            toast.error(
                t("agriculturalActionNameRequired")
            );

            return;
        }


        if (!formData.applicableCrop.trim()) {

            toast.error(
                t("agriculturalActionCropRequired")
            );

            return;
        }


        if (!formData.applicableGrowthStage.trim()) {

            toast.error(
                t("agriculturalActionGrowthStageRequired")
            );

            return;
        }


        try {

            setSaving(true);


            const payload = {

                actionName:
                    formData.actionName.trim(),

                category:
                    formData.category.trim(),

                description:
                    formData.description.trim(),

                requiredWater:
                    formData.requiredWater === ""
                        ? null
                        : Number(
                              formData.requiredWater
                          ),

                requiredLabour:
                    formData.requiredLabour === ""
                        ? null
                        : Number(
                              formData.requiredLabour
                          ),

                requiredBudget:
                    formData.requiredBudget === ""
                        ? null
                        : Number(
                              formData.requiredBudget
                          ),

                applicableCrop:
                    formData.applicableCrop.trim(),

                applicableGrowthStage:
                    formData.applicableGrowthStage.trim(),

                evidenceStatus:
                    formData.evidenceStatus.trim(),

                sourceReference:
                    formData.sourceReference.trim(),

                active:
                    formData.active,
            };


            await addAgriculturalAction(
                payload
            );


            toast.success(
                t("agriculturalActionAdded")
            );


            handleReset();

            setShowForm(false);

            await loadActions();

        } catch (error) {

            console.error(error);

            toast.error(
                error.response?.data?.message ||
                t("agriculturalActionAddFailed")
            );

        } finally {

            setSaving(false);
        }
    };


    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="agricultural-actions-layout">

            {/* =====================================
                SIDEBAR
            ===================================== */}

            <Sidebar />


            {/* =====================================
                MAIN CONTENT
            ===================================== */}

            <main className="agricultural-actions-main">

                <div className="agricultural-actions-page">

                    <div className="agricultural-actions-container">


                        {/* =================================
                            PAGE HEADER
                        ================================= */}

                        <div className="agricultural-actions-header">

                            <div>

                                <div className="page-title-row">

                                    <BookOpen
                                        size={30}
                                    />

                                    <h1>
                                        {t(
                                            "agriculturalActionsTitle"
                                        )}
                                    </h1>

                                </div>


                                <p>
                                    {t(
                                        "agriculturalActionsSubtitle"
                                    )}
                                </p>

                            </div>


                            <div className="header-actions">

                                <button
                                    type="button"
                                    className="secondary-action-button"
                                    onClick={loadActions}
                                    disabled={loading}
                                >

                                    <RefreshCw
                                        size={17}
                                        className={
                                            loading
                                                ? "spin"
                                                : ""
                                        }
                                    />

                                    {t("refresh")}

                                </button>


                                <button
                                    type="button"
                                    className="primary-action-button"
                                    onClick={() =>
                                        setShowForm(
                                            !showForm
                                        )
                                    }
                                >

                                    {showForm ? (
                                        <X size={18} />
                                    ) : (
                                        <Plus size={18} />
                                    )}


                                    {showForm
                                        ? t("cancel")
                                        : t(
                                              "addAgriculturalAction"
                                          )}

                                </button>

                            </div>

                        </div>


                        {/* =================================
                            KNOWLEDGE BASE INFO
                        ================================= */}

                        <div className="knowledge-info-box">

                            <BookOpen size={21} />

                            <div>

                                <strong>
                                    {t(
                                        "agriculturalActionsKnowledgeBase"
                                    )}
                                </strong>

                                <p>
                                    {t(
                                        "agriculturalActionsKnowledgeDescription"
                                    )}
                                </p>

                            </div>

                        </div>


                        {/* =================================
                            ADD ACTION FORM
                        ================================= */}

                        {showForm && (

                            <div className="action-form-card">

                                <div className="section-heading">

                                    <h2>
                                        {t(
                                            "addAgriculturalAction"
                                        )}
                                    </h2>

                                    <p>
                                        {t(
                                            "agriculturalActionFormDescription"
                                        )}
                                    </p>

                                </div>


                                <form
                                    onSubmit={
                                        handleSubmit
                                    }
                                >


                                    {/* BASIC INFORMATION */}

                                    <div className="form-section">

                                        <h3>
                                            {t(
                                                "actionBasicInformation"
                                            )}
                                        </h3>


                                        <div className="form-grid">

                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "actionName"
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    name="actionName"
                                                    value={
                                                        formData.actionName
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "enterActionName"
                                                    )}
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "actionCategory"
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={
                                                        formData.category
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "enterActionCategory"
                                                    )}
                                                />

                                            </div>


                                            <div className="form-group full-width">

                                                <label>
                                                    {t(
                                                        "actionDescription"
                                                    )}
                                                </label>

                                                <textarea
                                                    name="description"
                                                    value={
                                                        formData.description
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "enterActionDescription"
                                                    )}
                                                    rows="4"
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* APPLICABILITY */}

                                    <div className="form-section">

                                        <h3>
                                            {t(
                                                "actionApplicability"
                                            )}
                                        </h3>


                                        <div className="form-grid">

                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "applicableCrop"
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    name="applicableCrop"
                                                    value={
                                                        formData.applicableCrop
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "enterApplicableCrop"
                                                    )}
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "applicableGrowthStage"
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    name="applicableGrowthStage"
                                                    value={
                                                        formData.applicableGrowthStage
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "enterGrowthStage"
                                                    )}
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* RESOURCE REQUIREMENTS */}

                                    <div className="form-section">

                                        <h3>
                                            {t(
                                                "actionResourceRequirements"
                                            )}
                                        </h3>

                                        <p className="form-note">
                                            {t(
                                                "actionResourceNote"
                                            )}
                                        </p>


                                        <div className="form-grid">

                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "requiredWater"
                                                    )}
                                                </label>

                                                <input
                                                    type="number"
                                                    name="requiredWater"
                                                    value={
                                                        formData.requiredWater
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                    step="any"
                                                    placeholder={
                                                        t(
                                                            "optional"
                                                        )
                                                    }
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "requiredLabour"
                                                    )}
                                                </label>

                                                <input
                                                    type="number"
                                                    name="requiredLabour"
                                                    value={
                                                        formData.requiredLabour
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                    step="1"
                                                    placeholder={
                                                        t(
                                                            "optional"
                                                        )
                                                    }
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "requiredBudget"
                                                    )}
                                                </label>

                                                <input
                                                    type="number"
                                                    name="requiredBudget"
                                                    value={
                                                        formData.requiredBudget
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    min="0"
                                                    step="any"
                                                    placeholder={
                                                        t(
                                                            "optional"
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* EVIDENCE */}

                                    <div className="form-section">

                                        <h3>
                                            {t(
                                                "actionEvidence"
                                            )}
                                        </h3>


                                        <div className="form-grid">

                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "evidenceStatus"
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    name="evidenceStatus"
                                                    value={
                                                        formData.evidenceStatus
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "selectEvidenceStatus"
                                                    )}
                                                />

                                            </div>


                                            <div className="form-group">

                                                <label>
                                                    {t(
                                                        "sourceReference"
                                                    )}
                                                </label>

                                                <input
                                                    type="text"
                                                    name="sourceReference"
                                                    value={
                                                        formData.sourceReference
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                    placeholder={t(
                                                        "enterSourceReference"
                                                    )}
                                                />

                                            </div>

                                        </div>

                                    </div>


                                    {/* ACTIVE */}

                                    <div className="form-section">

                                        <label className="checkbox-row">

                                            <input
                                                type="checkbox"
                                                name="active"
                                                checked={
                                                    formData.active
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <span>
                                                {t(
                                                    "actionActive"
                                                )}
                                            </span>

                                        </label>

                                    </div>


                                    {/* FORM ACTIONS */}

                                    <div className="form-actions">

                                        <button
                                            type="button"
                                            className="secondary-action-button"
                                            onClick={() => {
                                                handleReset();
                                                setShowForm(false);
                                            }}
                                            disabled={saving}
                                        >
                                            <X size={17} />
                                            {t("cancel")}
                                        </button>


                                        <button
                                            type="submit"
                                            className="primary-action-button"
                                            disabled={saving}
                                        >

                                            <Save size={17} />

                                            {saving
                                                ? t("saving")
                                                : t("save")}

                                        </button>

                                    </div>

                                </form>

                            </div>

                        )}


                        {/* =================================
                            ACTION LIST
                        ================================= */}

                        <div className="actions-card">

                            <div className="section-heading">

                                <h2>
                                    {t(
                                        "agriculturalActionsList"
                                    )}
                                </h2>

                                <p>
                                    {t(
                                        "agriculturalActionsListDescription"
                                    )}
                                </p>

                            </div>


                            {loading ? (

                                <div className="empty-state">

                                    <RefreshCw
                                        className="spin"
                                        size={25}
                                    />

                                    <p>
                                        {t("loading")}
                                    </p>

                                </div>

                            ) : actions.length === 0 ? (

                                <div className="empty-state">

                                    <BookOpen
                                        size={35}
                                    />

                                    <p>
                                        {t(
                                            "noAgriculturalActions"
                                        )}
                                    </p>

                                </div>

                            ) : (

                                <div className="actions-table-wrapper">

                                    <table className="actions-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    {t(
                                                        "actionName"
                                                    )}
                                                </th>

                                                <th>
                                                    {t(
                                                        "actionCategory"
                                                    )}
                                                </th>

                                                <th>
                                                    {t(
                                                        "applicableCrop"
                                                    )}
                                                </th>

                                                <th>
                                                    {t(
                                                        "applicableGrowthStage"
                                                    )}
                                                </th>

                                                <th>
                                                    {t(
                                                        "evidenceStatus"
                                                    )}
                                                </th>

                                                <th>
                                                    {t(
                                                        "status"
                                                    )}
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {actions.map(
                                                (action) => (

                                                    <tr
                                                        key={
                                                            action.id
                                                        }
                                                    >

                                                        <td>

                                                            <div className="action-name-cell">

                                                                <strong>
                                                                    {
                                                                        action.actionName
                                                                    }
                                                                </strong>

                                                                {action.description && (

                                                                    <small>
                                                                        {
                                                                            action.description
                                                                        }
                                                                    </small>

                                                                )}

                                                            </div>

                                                        </td>


                                                        <td>
                                                            {
                                                                action.category ||
                                                                "—"
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                action.applicableCrop ||
                                                                "—"
                                                            }
                                                        </td>


                                                        <td>
                                                            {
                                                                action.applicableGrowthStage ||
                                                                "—"
                                                            }
                                                        </td>


                                                        <td>

                                                            <span className="evidence-badge">

                                                                {
                                                                    action.evidenceStatus ||
                                                                    "—"
                                                                }

                                                            </span>

                                                        </td>


                                                        <td>

                                                            <span
                                                                className={
                                                                    action.active
                                                                        ? "status-badge active"
                                                                        : "status-badge inactive"
                                                                }
                                                            >
                                                                {
                                                                    action.active
                                                                        ? t(
                                                                              "active"
                                                                          )
                                                                        : t(
                                                                              "inactive"
                                                                          )
                                                                }
                                                            </span>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}


export default AgriculturalActions;