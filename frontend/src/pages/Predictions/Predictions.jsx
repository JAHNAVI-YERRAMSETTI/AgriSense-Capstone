import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

import Sidebar from "../../components/Sidebar/Sidebar";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";

import { getFarmsByFarmerId } from "../../services/farmService";
import { getFarmStateByFarmId } from "../../services/farmStateService";
import { getCropRecommendation } from "../../services/predictionService";
import { detectDisease } from "../../services/diseaseDetectionService";
import { predictYield } from "../../services/yieldPredictionService";

import "./Predictions.css";


function Predictions() {

    const { farmer } = useAuth();
    const { t } = useLanguage();


    const [farms, setFarms] = useState([]);
    const [selectedFarmId, setSelectedFarmId] = useState("");

    const [farmState, setFarmState] = useState(null);
    const [prediction, setPrediction] = useState(null);


    const [loadingFarms, setLoadingFarms] = useState(true);
    const [loadingState, setLoadingState] = useState(false);
    const [predicting, setPredicting] = useState(false);
const [yieldResult, setYieldResult] = useState(null);
const [predictingYield, setPredictingYield] = useState(false);

    /* =========================================
       Disease Detection State
    ========================================= */

    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [diseaseResult, setDiseaseResult] = useState(null);
    const [detectingDisease, setDetectingDisease] = useState(false);


    /* =========================================
       Load Farmer Farms
    ========================================= */

    useEffect(() => {

        const loadFarms = async () => {

            if (!farmer?.userId) {

                setFarms([]);
                setSelectedFarmId("");
                setLoadingFarms(false);

                return;
            }


            try {

                setLoadingFarms(true);


                const data = await getFarmsByFarmerId(
                    farmer.userId
                );


                const farmerFarms = data || [];


                setFarms(farmerFarms);


                if (farmerFarms.length > 0) {

                    setSelectedFarmId(
                        String(farmerFarms[0].id)
                    );

                } else {

                    setSelectedFarmId("");

                }

            } catch (error) {

                console.error(error);


                toast.error(
                    error.response?.data?.message ||
                    t("predictionLoadFarmsError")
                );


                setFarms([]);
                setSelectedFarmId("");

            } finally {

                setLoadingFarms(false);

            }
        };


        loadFarms();

    }, [farmer?.userId, t]);


    /* =========================================
       Load Farm State
    ========================================= */

    useEffect(() => {

        const loadFarmState = async () => {

            if (!selectedFarmId) {

                setFarmState(null);
                setPrediction(null);
                setYieldResult(null);

                setSelectedImage(null);
                setImagePreview("");
                setDiseaseResult(null);

                return;
            }


            try {

                setLoadingState(true);

                setPrediction(null);
                setYieldResult(null);

                setDiseaseResult(null);


                const data = await getFarmStateByFarmId(
                    selectedFarmId
                );


                setFarmState(data);

            } catch (error) {

                console.error(error);

                setFarmState(null);

            } finally {

                setLoadingState(false);

            }
        };


        loadFarmState();

    }, [selectedFarmId]);


    /* =========================================
       Crop Recommendation
    ========================================= */

    const handlePrediction = async () => {

        if (!selectedFarmId) {

            toast.error(
                t("predictionSelectFarm")
            );

            return;
        }


        try {

            setPredicting(true);


            const result =
                await getCropRecommendation(
                    selectedFarmId
                );


            if (!result.success) {

                toast.error(
                    result.message ||
                    t("predictionFailed")
                );


                setPrediction(null);

                return;
            }


            setPrediction(result);


            toast.success(
                t("predictionGenerated")
            );

        } catch (error) {

            console.error(error);


            setPrediction(null);


            toast.error(
                error.response?.data?.message ||
                t("predictionFailed")
            );

        } finally {

            setPredicting(false);

        }
    };


    /* =========================================
       Disease Image Selection
    ========================================= */

    const handleImageChange = (event) => {

        const file =
            event.target.files?.[0];


        if (!file) {

            setSelectedImage(null);
            setImagePreview("");
            setDiseaseResult(null);

            return;
        }


        setSelectedImage(file);
        setDiseaseResult(null);


        const previewUrl =
            URL.createObjectURL(file);


        setImagePreview(previewUrl);

    };


    /* =========================================
       Disease Detection
    ========================================= */

    const handleDiseaseDetection = async () => {

        if (!selectedFarmId) {

            toast.error(
                t("predictionSelectFarm")
            );

            return;
        }


        if (!selectedImage) {

            toast.error(
                t("diseaseSelectImageError")
            );

            return;
        }


        try {

            setDetectingDisease(true);
            setDiseaseResult(null);


            const result =
                await detectDisease(
                    selectedFarmId,
                    selectedImage
                );


            if (!result.success) {

                toast.error(
                    result.message ||
                    t("diseaseDetectionFailed")
                );

                return;
            }


            setDiseaseResult(result);


            toast.success(
                t("diseaseDetectionSuccess")
            );

        } catch (error) {

            console.error(error);


            setDiseaseResult(null);


            toast.error(
                error.response?.data?.message ||
                t("diseaseDetectionFailed")
            );

        } finally {

            setDetectingDisease(false);

        }
    };
const handleYieldPrediction = async () => {
    if (!selectedFarmId) {
        toast.error(t("predictionSelectFarm"));
        return;
    }

    try {
        setPredictingYield(true);
        setYieldResult(null);

        const result = await predictYield(
            selectedFarmId
        );

        if (!result?.success) {
            toast.error(
                result?.message ||
                t("yieldPredictionFailed")
            );
            setYieldResult(null);
            return;
        }

        setYieldResult(result);

        toast.success(
            t("yieldPredictionSuccess")
        );

    } catch (error) {

        console.error(
            "Yield prediction error:",
            error
        );

        toast.error(
            error.response?.data?.message ||
            t("yieldPredictionFailed")
        );

    } finally {
        setPredictingYield(false);
    }
};

    /* =========================================
       Selected Farm
    ========================================= */

    const selectedFarm = farms.find(
        (farm) =>
            String(farm.id) ===
            String(selectedFarmId)
    );


    /* =========================================
       Percentage Formatter
    ========================================= */

    const formatPercentage = (probability) => {

        return `${(
            probability * 100
        ).toFixed(2)}%`;

    };


    return (

        <div className="predictions-layout">

            {/* =========================================
                Sidebar
            ========================================= */}

            <Sidebar />


            {/* =========================================
                Main Content
            ========================================= */}

            <main className="predictions-main">

                <div className="predictions-page">


                    {/* =========================================
                        Header
                    ========================================= */}

                    <header className="predictions-header">

                        <div>

                            <h1>
                                {t("predictionsTitle")}
                            </h1>

                            <p>
                                {t("predictionsSubtitle")}
                            </p>

                        </div>


                        <LanguageSelector />

                    </header>


                    {/* =========================================
                        Farm Selection
                    ========================================= */}

                    <section className="prediction-selection-card">

                        <div className="prediction-field">

                            <label htmlFor="farm-select">

                                {t(
                                    "predictionSelectFarmLabel"
                                )}

                            </label>


                            <select
                                id="farm-select"
                                value={selectedFarmId}
                                onChange={(event) =>
                                    setSelectedFarmId(
                                        event.target.value
                                    )
                                }
                                disabled={loadingFarms}
                            >

                                <option value="">

                                    {loadingFarms
                                        ? t(
                                            "predictionLoadingFarms"
                                        )
                                        : t(
                                            "predictionChooseFarm"
                                        )}

                                </option>


                                {farms.map((farm) => (

                                    <option
                                        key={farm.id}
                                        value={farm.id}
                                    >

                                        {farm.farmName} -{" "}
                                        {farm.location}

                                    </option>

                                ))}

                            </select>

                        </div>


                        {/* Selected Farm Information */}

                        {selectedFarm && (

                            <div className="selected-farm-info">

                                <div>

                                    <span>
                                        {t(
                                            "predictionFarmName"
                                        )}
                                    </span>

                                    <strong>
                                        {selectedFarm.farmName}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        {t(
                                            "predictionLocation"
                                        )}
                                    </span>

                                    <strong>
                                        {selectedFarm.location}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        {t(
                                            "predictionCrop"
                                        )}
                                    </span>

                                    <strong>
                                        {selectedFarm.crop}
                                    </strong>

                                </div>


                                <div>

                                    <span>
                                        {t(
                                            "predictionGrowthStage"
                                        )}
                                    </span>

                                    <strong>
                                        {selectedFarm.growthStage}
                                    </strong>

                                </div>

                            </div>

                        )}

                    </section>


                    {/* =========================================
                        Loading Farm State
                    ========================================= */}

                    {loadingState && (

                        <div className="prediction-message">

                            {t(
                                "predictionLoadingState"
                            )}

                        </div>

                    )}


                    {/* =========================================
                        Crop Recommendation
                    ========================================= */}

                    <section className="prediction-module-heading">

                        <div className="section-heading">

                            <h2>
                                {t("cropRecommendationTitle")}
                            </h2>

                            <p>
                                {t("cropRecommendationSubtitle")}
                            </p>

                        </div>

                    </section>


                    {/* =========================================
                        Farm State
                    ========================================= */}

                    {!loadingState &&
                        farmState && (

                            <section className="farm-state-preview">

                                <div className="section-heading">

                                    <h2>
                                        {t(
                                            "predictionFarmStateTitle"
                                        )}
                                    </h2>

                                    <p>
                                        {t(
                                            "predictionFarmStateSubtitle"
                                        )}
                                    </p>

                                </div>


                                <div className="farm-state-grid">


                                    {/* Soil pH */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionSoilPh"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.soilPh ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Nitrogen */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionNitrogen"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.nitrogen ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Phosphorus */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionPhosphorus"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.phosphorus ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Potassium */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionPotassium"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.potassium ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Temperature */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionTemperature"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.temperature ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Humidity */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionHumidity"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.humidity ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Rainfall */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionRainfall"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.rainfall ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    {/* Soil Moisture */}

                                    <div className="state-item">

                                        <span>
                                            {t(
                                                "predictionSoilMoisture"
                                            )}
                                        </span>

                                        <strong>
                                            {
                                                farmState.soilMoisture ??
                                                "-"
                                            }
                                        </strong>

                                    </div>

                                </div>


                                {/* Generate Crop Recommendation */}

                                <button
                                    className="prediction-button"
                                    onClick={
                                        handlePrediction
                                    }
                                    disabled={
                                        predicting
                                    }
                                >

                                    {predicting
                                        ? t(
                                            "predictionGenerating"
                                        )
                                        : t(
                                            "predictionGenerateButton"
                                        )}

                                </button>

                            </section>

                        )}


                    {/* =========================================
                        No Farm State
                    ========================================= */}

                    {!loadingState &&
                        selectedFarmId &&
                        !farmState && (

                            <div className="prediction-empty">

                                <p>
                                    {t(
                                        "predictionNoFarmState"
                                    )}
                                </p>

                            </div>

                        )}


                    {/* =========================================
                        Crop Recommendation Result
                    ========================================= */}

                    {prediction && (

                        <section className="prediction-result">


                            <div className="result-header">

                                <div>

                                    <h2>
                                        {t(
                                            "predictionResultTitle"
                                        )}
                                    </h2>

                                    <p>
                                        {t(
                                            "predictionResultSubtitle"
                                        )}
                                    </p>

                                </div>

                            </div>


                            {/* Recommended Crop */}

                            <div className="recommended-crop-card">

                                <span>
                                    {t(
                                        "predictionRecommendedCrop"
                                    )}
                                </span>


                                <h3>
                                    {
                                        prediction.recommendedCrop
                                    }
                                </h3>

                            </div>


                            {/* Top Recommendations */}

                            {prediction
                                .topRecommendations
                                ?.length > 0 && (

                                <div className="top-recommendations">

                                    <h3>
                                        {t(
                                            "predictionTopRecommendations"
                                        )}
                                    </h3>


                                    <div className="recommendation-list">

                                        {prediction
                                            .topRecommendations
                                            .map(
                                                (
                                                    recommendation,
                                                    index
                                                ) => (

                                                    <div
                                                        className="recommendation-item"
                                                        key={
                                                            recommendation.crop
                                                        }
                                                    >

                                                        <div className="recommendation-rank">

                                                            #
                                                            {index +
                                                                1}

                                                        </div>


                                                        <div className="recommendation-details">

                                                            <div className="recommendation-name">

                                                                {
                                                                    recommendation.crop
                                                                }

                                                            </div>


                                                            <div className="probability-bar">

                                                                <div
                                                                    className="probability-fill"
                                                                    style={{
                                                                        width:
                                                                            formatPercentage(
                                                                                recommendation.probability
                                                                            )
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>


                                                        <div className="recommendation-probability">

                                                            {
                                                                formatPercentage(
                                                                    recommendation.probability
                                                                )
                                                            }

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                    </div>

                                </div>

                            )}


                            {/* Advisory Note */}

                            <div className="prediction-note">

                                <strong>

                                    {t(
                                        "predictionAdvisoryNoteTitle"
                                    )}

                                </strong>


                                <p>

                                    {t(
                                        "predictionAdvisoryNote"
                                    )}

                                </p>

                            </div>

                        </section>

                    )}


                    {/* =========================================
                        Yield Prediction
                    ========================================= */}

                    {selectedFarmId && (
                        <section className="yield-prediction-card">

                            <div className="section-heading">

                                <h2>
                                    {t("yieldPrediction")}
                                </h2>

                                <p>
                                    {t("yieldPredictionDescription")}
                                </p>

                            </div>

                            <button
                                className="prediction-button"
                                onClick={handleYieldPrediction}
                                disabled={predictingYield}
                            >
                                {predictingYield
                                    ? t("yieldPredictionPredicting")
                                    : t("yieldPredictionButton")}
                            </button>

                            {yieldResult && (
                                <div className="yield-result">

                                    <div className="yield-result-main">
                                        <span>
                                            {t("yieldPredictionResult")}
                                        </span>

                                        <strong>
                                            {Number(
                                                yieldResult.predictedYieldKgPerHa
                                            ).toLocaleString(undefined, {
                                                maximumFractionDigits: 2
                                            })}
                                        </strong>

                                        <small>
                                            {t("yieldPredictionUnit")}
                                        </small>
                                    </div>

                                    <div className="yield-result-details">
                                        <div>
                                            <span>{t("predictionCrop")}</span>
                                            <strong>
                                                {yieldResult.crop || selectedFarm?.crop || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>{t("predictionLocation")}</span>
                                            <strong>
                                                {yieldResult.district || selectedFarm?.location || "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>{t("area")}</span>
                                            <strong>
                                                {yieldResult.area ?? selectedFarm?.area ?? "-"}
                                            </strong>
                                        </div>
                                    </div>

                                </div>
                            )}

                        </section>
                    )}


                    {/* =========================================
                        Disease Detection
                    ========================================= */}

                    <section className="disease-detection-card">

                        <div className="section-heading">

                            <h2>
                                {t(
                                    "diseaseDetectionTitle"
                                )}
                            </h2>

                            <p>
                                {t(
                                    "diseaseDetectionSubtitle"
                                )}
                            </p>

                        </div>


                        {/* Image Upload */}

                        <div className="disease-upload-area">

                            <label
                                htmlFor="disease-image"
                                className="disease-upload-label"
                            >

                                {t(
                                    "diseaseSelectImage"
                                )}

                            </label>


                            <input
                                id="disease-image"
                                type="file"
                                accept="image/*"
                                onChange={
                                    handleImageChange
                                }
                            />


                            {selectedImage && (

                                <p className="disease-file-name">

                                    {selectedImage.name}

                                </p>

                            )}

                        </div>


                        {/* Image Preview */}

                        {imagePreview && (

                            <div className="disease-image-preview">

                                <img
                                    src={imagePreview}
                                    alt={t(
                                        "diseaseImagePreview"
                                    )}
                                />

                            </div>

                        )}


                        {/* Detect Button */}

                        <button
                            className="prediction-button"
                            onClick={
                                handleDiseaseDetection
                            }
                            disabled={
                                detectingDisease ||
                                !selectedImage ||
                                !selectedFarmId
                            }
                        >

                            {detectingDisease
                                ? t(
                                    "diseaseDetecting"
                                )
                                : t(
                                    "diseaseDetectButton"
                                )}

                        </button>


                        {/* Disease Result */}

                        {diseaseResult && (

                            <div className="disease-result">


                                {/* Main Prediction */}

                                <div className="disease-result-main">

                                    <span>
                                        {t(
                                            "diseasePrediction"
                                        )}
                                    </span>

                                    <h3>
                                        {
                                            diseaseResult.predictedDisease
                                        }
                                    </h3>

                                </div>


                                {/* Confidence */}

                                <div className="disease-confidence">

                                    <span>
                                        {t(
                                            "diseaseConfidence"
                                        )}
                                    </span>

                                    <strong>
                                        {
                                            diseaseResult.confidence
                                        }%
                                    </strong>

                                </div>


                                {/* Top Predictions */}

                                {diseaseResult
                                    .topPredictions
                                    ?.length > 0 && (

                                    <div className="disease-top-predictions">

                                        <h3>
                                            {t(
                                                "diseaseTopPredictions"
                                            )}
                                        </h3>


                                        <div className="disease-prediction-list">

                                            {diseaseResult
                                                .topPredictions
                                                .map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (

                                                        <div
                                                            className="disease-prediction-item"
                                                            key={`${item.disease}-${index}`}
                                                        >

                                                            <span>
                                                                #
                                                                {index +
                                                                    1}
                                                            </span>

                                                            <strong>
                                                                {
                                                                    item.disease
                                                                }
                                                            </strong>

                                                            <b>
                                                                {
                                                                    item.confidence
                                                                }%
                                                            </b>

                                                        </div>

                                                    )
                                                )}

                                        </div>

                                    </div>

                                )}

                            </div>

                        )}

                    </section>




                </div>

            </main>

        </div>

    );
}


export default Predictions;