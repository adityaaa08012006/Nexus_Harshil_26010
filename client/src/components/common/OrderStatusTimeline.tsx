import React, { useState } from "react";
import { FileText, Clock, CheckCircle, Truck, Package, X } from "lucide-react";

interface TimelineStage {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  statuses: string[]; // Which order statuses map to this stage
}

interface OrderStatusTimelineProps {
  currentStatus: string;
  orderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const OrderStatusTimeline: React.FC<OrderStatusTimelineProps> = ({
  currentStatus,
  orderId,
  createdAt,
  updatedAt,
}) => {
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const stages: TimelineStage[] = [
    {
      id: "submitted",
      label: "Submitted",
      icon: <FileText className="w-4 h-4" />,
      description:
        "Order has been submitted and is waiting for initial review.",
      statuses: ["pending"],
    },
    {
      id: "review",
      label: "Under Review",
      icon: <Clock className="w-4 h-4" />,
      description: "Order is being reviewed by warehouse management.",
      statuses: ["reviewing"],
    },
    {
      id: "approved",
      label: "Approved",
      icon: <CheckCircle className="w-4 h-4" />,
      description:
        "Order has been approved and allocated to available inventory.",
      statuses: ["allocated"],
    },
    {
      id: "dispatched",
      label: "Dispatched",
      icon: <Truck className="w-4 h-4" />,
      description:
        "Order has been dispatched and is on the way to destination.",
      statuses: ["dispatched", "in-transit"],
    },
    {
      id: "delivered",
      label: "Delivered",
      icon: <Package className="w-4 h-4" />,
      description: "Order has been successfully delivered and completed.",
      statuses: ["delivered", "completed"],
    },
  ];

  // Determine which stage is currently active
  const getCurrentStageIndex = () => {
    if (currentStatus === "cancelled") return -1;
    for (let i = 0; i < stages.length; i++) {
      if (stages[i].statuses.includes(currentStatus)) {
        return i;
      }
    }
    return 0;
  };

  const currentStageIndex = getCurrentStageIndex();
  const isCancelled = currentStatus === "cancelled";

  const getStageStyle = (index: number) => {
    if (isCancelled) {
      return {
        bg: "#FEE2E2",
        border: "#FCA5A5",
        text: "#991B1B",
        icon: "#991B1B",
      };
    }

    if (index < currentStageIndex) {
      // Completed stages
      return {
        bg: "#D1FAE5",
        border: "#6EE7B7",
        text: "#065F46",
        icon: "#10B981",
      };
    } else if (index === currentStageIndex) {
      // Current stage
      return {
        bg: "#DBEAFE",
        border: "#60A5FA",
        text: "#1E40AF",
        icon: "#3B82F6",
      };
    } else {
      // Future stages
      return {
        bg: "#F3F4F6",
        border: "#D1D5DB",
        text: "#6B7280",
        icon: "#9CA3AF",
      };
    }
  };

  const getConnectorStyle = (index: number) => {
    if (isCancelled) {
      return "#FCA5A5";
    }
    if (index < currentStageIndex) {
      return "#6EE7B7";
    }
    return "#D1D5DB";
  };

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-2">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border-2"
          style={{
            backgroundColor: "#FEE2E2",
            borderColor: "#FCA5A5",
            color: "#991B1B",
          }}
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-semibold">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline */}
      <div className="flex items-center justify-between gap-1 py-3">
        {stages.map((stage, index) => {
          const style = getStageStyle(index);
          const isPast = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isClickable = isPast || isCurrent;

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Circle */}
              <div
                className={`flex flex-col items-center ${isClickable ? "cursor-pointer" : "cursor-default"} relative group`}
                onClick={() => isClickable && setSelectedStage(stage.id)}
              >
                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${isClickable ? "hover:scale-110" : ""}`}
                  style={{
                    backgroundColor: style.bg,
                    borderColor: style.border,
                    color: style.icon,
                  }}
                >
                  {isPast ? <CheckCircle className="w-5 h-5" /> : stage.icon}
                </div>
                <div className="mt-2 text-center">
                  <p
                    className="text-xs font-semibold whitespace-nowrap"
                    style={{ color: style.text }}
                  >
                    {stage.label}
                  </p>
                </div>

                {/* Tooltip on hover */}
                {isClickable && (
                  <div
                    className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block z-10 w-48 p-3 rounded-lg shadow-lg border"
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderColor: style.border,
                    }}
                  >
                    <p className="text-xs text-gray-700">{stage.description}</p>
                  </div>
                )}
              </div>

              {/* Connector Line */}
              {index < stages.length - 1 && (
                <div
                  className="flex-1 h-0.5 -mt-6"
                  style={{ backgroundColor: getConnectorStyle(index) }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Expanded Details (when stage is clicked) */}
      {selectedStage && (
        <div className="mt-4 p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-bold text-blue-900">
              {stages.find((s) => s.id === selectedStage)?.label}
            </h4>
            <button
              onClick={() => setSelectedStage(null)}
              className="text-blue-600 hover:text-blue-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-blue-800 mb-3">
            {stages.find((s) => s.id === selectedStage)?.description}
          </p>
          {orderId && (
            <p className="text-xs text-blue-700 font-mono">
              Order ID: {orderId}
            </p>
          )}
          {createdAt && (
            <p className="text-xs text-blue-700">
              Created: {new Date(createdAt).toLocaleString()}
            </p>
          )}
          {updatedAt && (
            <p className="text-xs text-blue-700">
              Last Updated: {new Date(updatedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
