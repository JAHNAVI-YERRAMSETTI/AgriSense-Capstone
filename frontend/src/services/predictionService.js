import api from "./api";

export const getCropRecommendation = async (farmId) => {
    const response = await api.get(
        `/predictionapi/crop-recommendation/${farmId}`
    );

    return response.data;
};