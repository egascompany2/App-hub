import { useCallback, useMemo, useRef, useState } from "react";
import * as Location from "expo-location";
import { LocationDisclosureModal } from "@/components/LocationDisclosureModal";

export function useLocationDisclosure() {
  const [visible, setVisible] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const resolverRef = useRef<(value: boolean) => void>();

  const resolve = (value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = undefined;
  };

  const ensurePermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === "granted") {
      setHasAccepted(true);
      return true;
    }

    return new Promise<boolean>((resolvePromise) => {
      resolverRef.current = resolvePromise;
      setVisible(true);
    });
  }, []);

  const handleContinue = useCallback(async () => {
    try {
      setIsRequesting(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      if (granted) {
        setHasAccepted(true);
      }
      setVisible(false);
      resolve(granted);
    } finally {
      setIsRequesting(false);
    }
  }, []);

  const handleDecline = useCallback(() => {
    setVisible(false);
    resolve(false);
  }, []);

  const disclosureModal = useMemo(
    () => (
      <LocationDisclosureModal
        visible={visible}
        onContinue={handleContinue}
        onDecline={handleDecline}
        isRequesting={isRequesting}
      />
    ),
    [visible, handleContinue, handleDecline, isRequesting]
  );

  return {
    ensurePermission,
    disclosureModal,
  };
}
