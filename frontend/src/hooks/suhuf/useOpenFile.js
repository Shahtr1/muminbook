import { useEffect, useState } from "react";
import { useOpenSuhuf } from "@/hooks/suhuf/useOpenSuhuf.js";
import { useUpdateSuhufConfig } from "@/hooks/suhuf/useUpdateSuhufConfig.js";
import { useQuery } from "@tanstack/react-query";
import { getSuhuf } from "@/services/suhuf.service"; // replace with actual service

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const useOpenFile = (fileId, isReading = false) => {
  const [createdSuhufId, setCreatedSuhufId] = useState(null);

  const { mutate: updateConfig } = useUpdateSuhufConfig(createdSuhufId);

  const { data: suhuf } = useQuery({
    queryKey: ["suhuf", createdSuhufId],
    queryFn: () => getSuhuf(createdSuhufId),
    enabled: !!createdSuhufId,
  });

  useEffect(() => {
    if (!suhuf || !createdSuhufId) return;

    const panels = suhuf?.config?.panels || [];
    const activeIndex = panels.findIndex((p) => p.active);
    if (activeIndex === -1) return;

    const updatedPanels = panels.map((panel, i) =>
      i === activeIndex
        ? {
            ...panel,
            fileId,
            fileType: isReading ? "reading" : "user",
          }
        : panel,
    );

    if (!deepEqual(updatedPanels, panels)) {
      updateConfig({ panels: updatedPanels });
    }
  }, [suhuf, createdSuhufId, fileId, isReading, updateConfig]);

  const openSuhuf = useOpenSuhuf((suhufId) => {
    setCreatedSuhufId(suhufId);
  });

  return openSuhuf;
};
