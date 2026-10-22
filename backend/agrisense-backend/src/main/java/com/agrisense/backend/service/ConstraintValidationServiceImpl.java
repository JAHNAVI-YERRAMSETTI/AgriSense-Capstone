package com.agrisense.backend.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.agrisense.backend.dto.ConstraintResult;
import com.agrisense.backend.dto.ConstraintValidationRequest;
import com.agrisense.backend.dto.ConstraintValidationResponse;
import com.agrisense.backend.model.AgriculturalAction;
import com.agrisense.backend.model.Farm;
import com.agrisense.backend.model.FarmState;
import com.agrisense.backend.repository.AgriculturalActionRepository;
import com.agrisense.backend.repository.FarmRepository;
import com.agrisense.backend.repository.FarmStateRepository;

@Service
public class ConstraintValidationServiceImpl
        implements ConstraintValidationService {

    private final FarmRepository farmRepository;

    private final FarmStateRepository farmStateRepository;

    private final AgriculturalActionRepository agriculturalActionRepository;

    public ConstraintValidationServiceImpl(
            FarmRepository farmRepository,
            FarmStateRepository farmStateRepository,
            AgriculturalActionRepository agriculturalActionRepository) {

        this.farmRepository = farmRepository;
        this.farmStateRepository = farmStateRepository;
        this.agriculturalActionRepository =
                agriculturalActionRepository;
    }

    @Override
    public ConstraintValidationResponse validateAction(
            ConstraintValidationRequest request) {

        /*
         * =========================
         * Validate Request
         * =========================
         */

        if (request == null ||
                request.getFarmId() == null ||
                request.getActionId() == null) {

            return new ConstraintValidationResponse(
                    false,
                    "Farm ID and Action ID are required.",
                    request != null
                            ? request.getFarmId()
                            : null,
                    null,
                    "UNKNOWN",
                    new ArrayList<>()
            );
        }

        /*
         * =========================
         * Find Farm
         * =========================
         */

        Farm farm = farmRepository
                .findById(request.getFarmId())
                .orElse(null);

        if (farm == null) {

            return new ConstraintValidationResponse(
                    false,
                    "Farm not found.",
                    request.getFarmId(),
                    null,
                    "UNKNOWN",
                    new ArrayList<>()
            );
        }

        /*
         * =========================
         * Find Farm State
         * =========================
         */

        FarmState farmState = farmStateRepository
                .findByFarm(farm)
                .orElse(null);

        if (farmState == null) {

            return new ConstraintValidationResponse(
                    false,
                    "Farm state not found.",
                    farm.getId(),
                    null,
                    "UNKNOWN",
                    new ArrayList<>()
            );
        }

        /*
         * =========================
         * Find Agricultural Action
         * =========================
         */

        AgriculturalAction action =
                agriculturalActionRepository
                        .findById(request.getActionId())
                        .orElse(null);

        if (action == null) {

            return new ConstraintValidationResponse(
                    false,
                    "Agricultural action not found.",
                    farm.getId(),
                    null,
                    "UNKNOWN",
                    new ArrayList<>()
            );
        }

        /*
         * =========================
         * Validate Action Applicability
         * =========================
         */

        List<ConstraintResult> constraints =
                new ArrayList<>();

        /*
         * =========================
         * WATER
         * =========================
         */

        if (action.getRequiredWater() == null) {

            constraints.add(
                    new ConstraintResult(
                            "WATER",
                            "UNKNOWN",
                            "Water requirement is not available for this action."
                    )
            );

        } else if (farmState.getWaterAvailable() == null) {

            constraints.add(
                    new ConstraintResult(
                            "WATER",
                            "UNKNOWN",
                            "Current farm water availability is not available."
                    )
            );

        } else if (farmState.getWaterAvailable()
                >= action.getRequiredWater()) {

            constraints.add(
                    new ConstraintResult(
                            "WATER",
                            "FEASIBLE",
                            "Available water is sufficient."
                    )
            );

        } else {

            constraints.add(
                    new ConstraintResult(
                            "WATER",
                            "INFEASIBLE",
                            "Available water is insufficient."
                    )
            );
        }

        /*
         * =========================
         * LABOUR
         * =========================
         */

        if (action.getRequiredLabour() == null) {

            constraints.add(
                    new ConstraintResult(
                            "LABOUR",
                            "UNKNOWN",
                            "Labour requirement is not available for this action."
                    )
            );

        } else if (farmState.getLabourAvailable() == null) {

            constraints.add(
                    new ConstraintResult(
                            "LABOUR",
                            "UNKNOWN",
                            "Current farm labour availability is not available."
                    )
            );

        } else if (farmState.getLabourAvailable()
                >= action.getRequiredLabour()) {

            constraints.add(
                    new ConstraintResult(
                            "LABOUR",
                            "FEASIBLE",
                            "Available labour is sufficient."
                    )
            );

        } else {

            constraints.add(
                    new ConstraintResult(
                            "LABOUR",
                            "INFEASIBLE",
                            "Available labour is insufficient."
                    )
            );
        }

        /*
         * =========================
         * BUDGET
         * =========================
         */

        if (action.getRequiredBudget() == null) {

            constraints.add(
                    new ConstraintResult(
                            "BUDGET",
                            "UNKNOWN",
                            "Budget requirement is not available for this action."
                    )
            );

        } else if (farmState.getBudgetAvailable() == null) {

            constraints.add(
                    new ConstraintResult(
                            "BUDGET",
                            "UNKNOWN",
                            "Current farm budget availability is not available."
                    )
            );

        } else if (farmState.getBudgetAvailable()
                >= action.getRequiredBudget()) {

            constraints.add(
                    new ConstraintResult(
                            "BUDGET",
                            "FEASIBLE",
                            "Available budget is sufficient."
                    )
            );

        } else {

            constraints.add(
                    new ConstraintResult(
                            "BUDGET",
                            "INFEASIBLE",
                            "Available budget is insufficient."
                    )
            );
        }

        /*
         * =========================
         * Overall Status
         * =========================
         */

        boolean hasInfeasible = false;
        boolean hasUnknown = false;
        boolean hasFeasible = false;

        for (ConstraintResult constraint : constraints) {

            if ("INFEASIBLE".equals(
                    constraint.getStatus())) {

                hasInfeasible = true;

            } else if ("UNKNOWN".equals(
                    constraint.getStatus())) {

                hasUnknown = true;

            } else if ("FEASIBLE".equals(
                    constraint.getStatus())) {

                hasFeasible = true;
            }
        }

        String overallStatus;

        if (hasInfeasible) {

            overallStatus = "INFEASIBLE";

        } else if (hasUnknown && hasFeasible) {

            overallStatus = "PARTIALLY_FEASIBLE";

        } else if (hasUnknown) {

            overallStatus = "UNKNOWN";

        } else {

            overallStatus = "FEASIBLE";
        }

        /*
         * =========================
         * Final Response
         * =========================
         */

        return new ConstraintValidationResponse(
                true,
                "Constraint validation completed successfully.",
                farm.getId(),
                action.getActionName(),
                overallStatus,
                constraints
        );
    }
}