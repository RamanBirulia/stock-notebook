import React from "react";
import { Settings } from "lucide-react";

import { Button } from "../ui/Button";
import { AuthDebug } from "../debug/AuthDebug";

interface DebugToggleProps {
  showDebug: boolean;
  onToggleDebug: () => void;
}

export const DebugToggle: React.FC<DebugToggleProps> = ({
  showDebug,
  onToggleDebug,
}) => {
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={onToggleDebug}
          variant="secondary"
          size="sm"
          leftIcon={<Settings className="w-4 h-4" />}
        >
          Debug Info
        </Button>
      </div>

      {showDebug && <AuthDebug />}
    </div>
  );
};
