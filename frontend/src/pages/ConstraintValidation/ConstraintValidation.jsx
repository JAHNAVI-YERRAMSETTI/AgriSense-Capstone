import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
    Scale,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    HelpCircle,
} from "lucide-react";

import Sidebar from "../../components/Sidebar/Sidebar";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import {
    getFarmsByFarmerId,
} from "../../services/farmService";

import {
    getFarmStateByFarmId,
} from "../../services/farmStateService";

import {
    getActionsForFarm,
} from "../../services/agriculturalActionService";

import {
    validateConstraint,
} from "../../services/constraintValidationService";

import "./ConstraintValidation.css";


function ConstraintValidation() {

    const { farmer } = useAuth();
    const { t } = useLanguage();


    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] =
        useState("");

    const [farmState, setFarmState] =
        useState(null);

    const [actions, setActions] =
        useState([]);

    const [selectedActionId, setSelectedActionId] =
        useState("");

    const [selectedAction, setSelectedAction] =
        useState(null);

    const [result, setResult] =
        useState(null);

    const [loadingFarms, setLoadingFarms] =
        useState(false);

    const [loadingState, setLoadingState] =
        useState(false);

    const [loadingActions, setLoadingActions] =
        useState(false);

    const [validating, setValidating] =
        useState(false);


    /* ==========================================
       LOAD FARMS
    ========================================== */

    useEffect(() => {

        const loadFarms = async () => {

            if (!farmer?.userId) {
                return;
            }

            try {

                setLoadingFarms(true);

                const data =
                    await getFarmsByFarmerId(
                        farmer.userId
                    );

                const farmerFarms =
                    data || [];

                setFarms(farmerFarms);

                if (farmerFarms.length > 0) {

                    setSelectedFarmId(
                        String(
                            farmerFarms[0].id
                        )
                    );

                } else {

                    setSelectedFarmId("");
                }

            } catch (error) {

                console.error(error);

                setFarms([]);
                setSelectedFarmId("");

                toast.error(
                    t("constraintLoadFarmsFailed")
                );

            } finally {

                setLoadingFarms(false);
            }
        };


        loadFarms();

    }, [farmer?.userId, t]);


    /* ==========================================
       LOAD FARM STATE
    ========================================== */

    useEffect(() => {

        const loadFarmState = async () => {

            if (!selectedFarmId) {

                setFarmState(null);
                setActions([]);
                setSelectedActionId("");
                setSelectedAction(null);
                setResult(null);

                return;
            }


            try {

                setLoadingState(true);

                setFarmState(null);
                setActions([]);
                setSelectedActionId("");
                setSelectedAction(null);
                setResult(null);


                const data =
                    await getFarmStateByFarmId(
                        selectedFarmId
                    );

                setFarmState(data);

            } catch (error) {

                console.error(error);

                setFarmState(null);

                toast.error(
                    t("constraintFarmStateLoadFailed")
                );

            } finally {

                setLoadingState(false);
            }
        };


        loadFarmState();

    }, [selectedFarmId, t]);


    /* ==========================================
       LOAD CANDIDATE ACTIONS
    ========================================== */

    useEffect(() => {

        const loadActions = async () => {

            if (
                !farmState?.crop ||
                !farmState?.growthStage
            ) {

                setActions([]);
                setSelectedActionId("");
                setSelectedAction(null);

                return;
            }


            try {

                setLoadingActions(true);

                const data =
                    await getActionsForFarm(
                        farmState.crop,
                        farmState.growthStage
                    );

                const availableActions =
                    data || [];

                setActions(
                    availableActions
                );

                setSelectedActionId("");

                setSelectedAction(null);

                setResult(null);

            } catch (error) {

                console.error(error);

                setActions([]);

                setSelectedActionId("");

                setSelectedAction(null);

                toast.error(
                    t("constraintActionsLoadFailed")
                );

            } finally {

                setLoadingActions(false);
            }
        };


        loadActions();

    }, [
        farmState?.crop,
        farmState?.growthStage,
        t,
    ]);


    /* ==========================================
       ACTION SELECTION
    ========================================== */

    const handleActionChange = (event) => {

        const actionId =
            event.target.value;

        setSelectedActionId(
            actionId
        );

        setResult(null);


        const action =
            actions.find(
                (item) =>
                    String(item.id) ===
                    String(actionId)
            );


        setSelectedAction(
            action || null
        );
    };


    /* ==========================================
       VALIDATE
    ========================================== */

    const handleValidate = async () => {

        if (!selectedFarmId) {

            toast.error(
                t("constraintChooseFarm")
            );

            return;
        }


        if (!selectedActionId) {

            toast.error(
                t("constraintActionRequired")
            );

            return;
        }


        try {

            setValidating(true);

            setResult(null);


            const response =
                await validateConstraint({
                    farmId:
                        Number(
                            selectedFarmId
                        ),

                    actionId:
                        Number(
                            selectedActionId
                        ),
                });


            setResult(response);


            if (response?.success) {

                toast.success(
                    t(
                        "constraintValidationCompleted"
                    )
                );

            } else {

                toast.error(
                    response?.message ||
                    t(
                        "constraintValidationFailed"
                    )
                );
            }

        } catch (error) {

            console.error(error);

            setResult(null);

            toast.error(
                error.response?.data?.message ||
                t(
                    "constraintValidationFailed"
                )
            );

        } finally {

            setValidating(false);
        }
    };


    /* ==========================================
       SELECTED FARM
    ========================================== */

    const selectedFarm =
        farms.find(
            (farm) =>
                String(farm.id) ===
                String(selectedFarmId)
        );


    /* ==========================================
       STATUS CLASS
    ========================================== */

    const getStatusClass = (
        status
    ) => {

        if (
            status === "FEASIBLE"
        ) {
            return "status-feasible";
        }

        if (
            status === "INFEASIBLE"
        ) {
            return "status-infeasible";
        }

        if (
            status ===
            "PARTIALLY_FEASIBLE"
        ) {
            return "status-partial";
        }

        return "status-unknown";
    };


    /* ==========================================
       STATUS ICON
    ========================================== */

    const getStatusIcon = (
        status
    ) => {

        if (
            status === "FEASIBLE"
        ) {

            return (
                <CheckCircle
                    size={18}
                />
            );
        }


        if (
            status === "INFEASIBLE"
        ) {

            return (
                <AlertTriangle
                    size={18}
                />
            );
        }


        return (
            <HelpCircle
                size={18}
            />
        );
    };


    /* ==========================================
       RENDER
    ========================================== */

    return (

        <div className="constraint-page-layout">

            {/* SIDEBAR */}

            <Sidebar />


            {/* MAIN */}

            <main className="constraint-page-main">

                <div className="constraint-page">

                    <div className="constraint-container">


                        {/* HEADER */}

                        <header className="constraint-header">

                            <div>

                                <div className="constraint-title-row">

                                    <Scale
                                        size={30}
                                    />

                                    <h1>
                                        {t(
                                            "constraintValidationTitle"
                                        )}
                                    </h1>

                                </div>


                                <p>
                                    {t(
                                        "constraintValidationDescription"
                                    )}
                                </p>

                            </div>

                        </header>


                        {/* FARM STATE */}

                        <section className="constraint-card">

                            <div className="constraint-section-header">

                                <div>

                                    <h2>
                                        {t(
                                            "farmState"
                                        )}
                                    </h2>

                                    <p>
                                        {t(
                                            "constraintSelectFarmDescription"
                                        )}
                                    </p>

                                </div>

                            </div>


                            <div className="constraint-form-group">

                                <label>
                                    {t(
                                        "constraintChooseFarm"
                                    )}
                                </label>


                                <select
                                    value={
                                        selectedFarmId
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setSelectedFarmId(
                                            event.target.value
                                        )
                                    }
                                    disabled={
                                        loadingFarms
                                    }
                                >

                                    <option value="">
                                        {loadingFarms
                                            ? t(
                                                  "loading"
                                              )
                                            : t(
                                                  "constraintChooseFarm"
                                              )}
                                    </option>


                                    {farms.map(
                                        (farm) => (

                                            <option
                                                key={
                                                    farm.id
                                                }
                                                value={
                                                    farm.id
                                                }
                                            >
                                                {
                                                    farm.farmName
                                                }
                                                {" - "}
                                                {
                                                    farm.location
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {selectedFarm && (

                                <div className="farm-state-summary">

                                    <div>
                                        <span>
                                            {t(
                                                "farmName"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                selectedFarm.farmName
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            {t(
                                                "predictionLocation"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                selectedFarm.location
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            {t(
                                                "predictionCrop"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState?.crop ||
                                                selectedFarm.crop ||
                                                "—"
                                            }
                                        </strong>
                                    </div>


                                    <div>
                                        <span>
                                            {t(
                                                "predictionGrowthStage"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState?.growthStage ||
                                                selectedFarm.growthStage ||
                                                "—"
                                            }
                                        </strong>
                                    </div>

                                </div>

                            )}

                        </section>


                        {/* CANDIDATE ACTIONS */}

                        <section className="constraint-card">

                            <div className="constraint-section-header">

                                <div>

                                    <h2>
                                        {t(
                                            "candidateActions"
                                        )}
                                    </h2>

                                    <p>
                                        {t(
                                            "candidateActionsDescription"
                                        )}
                                    </p>

                                </div>

                            </div>


                            {loadingState ? (

                                <div className="constraint-loading">

                                    <RefreshCw
                                        size={22}
                                        className="spin"
                                    />

                                    <span>
                                        {t(
                                            "loading"
                                        )}
                                    </span>

                                </div>

                            ) : (

                                <div className="constraint-form-group">

                                    <label>
                                        {t(
                                            "selectAction"
                                        )}
                                    </label>


                                    <select
                                        value={
                                            selectedActionId
                                        }
                                        onChange={
                                            handleActionChange
                                        }
                                        disabled={
                                            loadingActions ||
                                            actions.length ===
                                                0
                                        }
                                    >

                                        <option value="">
                                            {loadingActions
                                                ? t(
                                                      "loadingActions"
                                                  )
                                                : actions.length ===
                                                    0
                                                  ? t(
                                                        "noApplicableActions"
                                                    )
                                                  : t(
                                                        "chooseAction"
                                                    )}
                                        </option>


                                        {actions.map(
                                            (
                                                action
                                            ) => (

                                                <option
                                                    key={
                                                        action.id
                                                    }
                                                    value={
                                                        action.id
                                                    }
                                                >
                                                    {
                                                        action.actionName
                                                    }
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            )}


                            {selectedAction && (

                                <div className="selected-action">

                                    <div className="selected-action-header">

                                        <div>

                                            <h3>
                                                {
                                                    selectedAction.actionName
                                                }
                                            </h3>

                                            <span className="reference-badge">
                                                {
                                                    selectedAction.evidenceStatus ||
                                                    "—"
                                                }
                                            </span>

                                        </div>

                                    </div>


                                    <div className="selected-action-details">

                                        <div>
                                            <span>
                                                {
                                                    t(
                                                        "actionCategory"
                                                    )
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    selectedAction.category ||
                                                    "—"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                {
                                                    t(
                                                        "predictionCrop"
                                                    )
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    selectedAction.applicableCrop ||
                                                    "—"
                                                }
                                            </strong>
                                        </div>


                                        <div>
                                            <span>
                                                {
                                                    t(
                                                        "predictionGrowthStage"
                                                    )
                                                }
                                            </span>

                                            <strong>
                                                {
                                                    selectedAction.applicableGrowthStage ||
                                                    "—"
                                                }
                                            </strong>
                                        </div>

                                    </div>


                                    {selectedAction.description && (

                                        <p className="action-description">
                                            {
                                                selectedAction.description
                                            }
                                        </p>

                                    )}


                                    {selectedAction.sourceReference && (

                                        <p className="action-source">
                                            <strong>
                                                {
                                                    t(
                                                        "sourceReference"
                                                    )
                                                }:
                                            </strong>{" "}
                                            {
                                                selectedAction.sourceReference
                                            }
                                        </p>

                                    )}

                                </div>

                            )}

                        </section>


                        {/* REQUIREMENTS */}

                        <section className="constraint-card">

                            <div className="constraint-section-header">

                                <div>

                                    <h2>
                                        {t(
                                            "actionRequirements"
                                        )}
                                    </h2>

                                    <p>
                                        {t(
                                            "constraintRequirementsDescription"
                                        )}
                                    </p>

                                </div>

                            </div>


                            {selectedAction ? (

                                <div className="requirements-grid">

                                    <div className="requirement-item">

                                        <span>
                                            {t(
                                                "waterConstraint"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                selectedAction.requiredWater ??
                                                "Unknown"
                                            }
                                        </strong>

                                    </div>


                                    <div className="requirement-item">

                                        <span>
                                            {t(
                                                "labourConstraint"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                selectedAction.requiredLabour ??
                                                "Unknown"
                                            }
                                        </strong>

                                    </div>


                                    <div className="requirement-item">

                                        <span>
                                            {t(
                                                "budgetConstraint"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                selectedAction.requiredBudget ??
                                                "Unknown"
                                            }
                                        </strong>

                                    </div>

                                </div>

                            ) : (

                                <div className="constraint-info-box">

                                    <HelpCircle
                                        size={20}
                                    />

                                    <span>
                                        {t(
                                            "constraintKnowledgeBasedValidation"
                                        )}
                                    </span>

                                </div>

                            )}


                            <button
                                type="button"
                                className="validate-button"
                                onClick={
                                    handleValidate
                                }
                                disabled={
                                    validating ||
                                    !selectedActionId
                                }
                            >

                                {validating ? (

                                    <>
                                        <RefreshCw
                                            size={18}
                                            className="spin"
                                        />

                                        {t(
                                            "validating"
                                        )}
                                    </>

                                ) : (

                                    <>
                                        <Scale
                                            size={18}
                                        />

                                        {t(
                                            "validateFeasibility"
                                        )}
                                    </>

                                )}

                            </button>

                        </section>


                        {/* RESULT */}

                        {result && (

                            <section className="constraint-card validation-result">

                                <div className="result-header">

                                    <div>

                                        <h2>
                                            {t(
                                                "validationResult"
                                            )}
                                        </h2>

                                        <p>
                                            {
                                                result.actionName
                                            }
                                        </p>

                                    </div>


                                    <div
                                        className={`overall-status ${getStatusClass(
                                            result.overallStatus
                                        )}`}
                                    >

                                        {getStatusIcon(
                                            result.overallStatus
                                        )}

                                        <span>
                                            {
                                                result.overallStatus
                                            }
                                        </span>

                                    </div>

                                </div>


                                <div className="constraint-results">

                                    {result.constraints?.map(
                                        (
                                            constraint,
                                            index
                                        ) => (

                                            <div
                                                key={
                                                    `${constraint.category}-${index}`
                                                }
                                                className="constraint-result-item"
                                            >

                                                <div className="constraint-result-left">

                                                    {getStatusIcon(
                                                        constraint.status
                                                    )}

                                                    <div>

                                                        <strong>
                                                            {
                                                                constraint.category
                                                            }
                                                        </strong>

                                                        <p>
                                                            {
                                                                constraint.message
                                                            }
                                                        </p>

                                                    </div>

                                                </div>


                                                <span
                                                    className={`constraint-status ${getStatusClass(
                                                        constraint.status
                                                    )}`}
                                                >
                                                    {
                                                        constraint.status
                                                    }
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            </section>

                        )}

                    </div>

                </div>

            </main>

        </div>
    );
}


export default ConstraintValidation;