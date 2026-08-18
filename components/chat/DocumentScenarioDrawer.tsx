"use client";

import { useRef } from "react";
import { AppIcon } from "@/components/shared/AppIcon";
import {
  DL_UPLOAD_SCENARIOS,
  getBillUploadScenariosForSource,
  type BillScenarioGroup,
} from "@/features/chat/demoUploadScenarios";
import type {
  BillUploadScenarioId,
  DlUploadScenarioId,
  DocumentUploadKind,
  UploadOptionId,
} from "@/features/chat/types";
import { staggerStyle } from "@/lib/ui/staggerStyle";
import { useModalFocus } from "@/lib/ui/useModalFocus";

export type DocumentScenarioSelection =
  | { kind: "bill"; scenarioId: BillUploadScenarioId }
  | { kind: "dl"; scenarioId: DlUploadScenarioId };

type DocumentScenarioDrawerProps = {
  open: boolean;
  kind: DocumentUploadKind;
  source: UploadOptionId;
  onSelect: (selection: DocumentScenarioSelection) => void;
  onClose: () => void;
};

const SOURCE_LABELS: Record<UploadOptionId, string> = {
  camera: "Camera",
  pdf: "PDF",
  gallery: "Gallery",
};

const GROUP_LABELS: Record<BillScenarioGroup, string> = {
  common: "Common bills",
  exceptions: "Exceptions",
};

export function DocumentScenarioDrawer({
  open,
  kind,
  source,
  onSelect,
  onClose,
}: DocumentScenarioDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  useModalFocus(drawerRef, open, onClose);

  const billGroups: BillScenarioGroup[] = ["common", "exceptions"];
  const billScenarios = getBillUploadScenariosForSource(source);

  return (
    <div
      ref={drawerRef}
      className={`fixed inset-0 z-[80] mx-auto max-w-phone ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close demo document picker"
        onClick={onClose}
        className={`absolute inset-0 bg-pine-dark/40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="document-scenario-title"
        className={`absolute inset-x-0 bottom-0 flex max-h-[88%] flex-col rounded-t-bubble bg-white shadow-drawer transition-transform duration-300 ease-out ${
          open ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-pill bg-border-muted" />

        <header className="flex items-start justify-between gap-3 px-page pb-3 pt-4">
          <div>
            <p className="type-section-label text-pine-primary">
              {SOURCE_LABELS[source]} demo
            </p>
            <h2 id="document-scenario-title" className="type-section-title text-pine">
              {kind === "bill" ? "Choose a bill scenario" : "Choose a DL outcome"}
            </h2>
            <p className="mt-1 type-body-secondary">
              Select an image to run the mock upload flow.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-pill text-ink-secondary hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-pine-primary"
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-page pb-8">
          {kind === "bill" ? (
            <div className="flex flex-col gap-section">
              {billGroups.map((group) => {
                const scenarios = billScenarios.filter(
                  (scenario) => scenario.group === group,
                );
                return (
                  <section key={group} aria-labelledby={`scenario-group-${group}`}>
                    <h3
                      id={`scenario-group-${group}`}
                      className="type-field-label mb-3 text-pine"
                    >
                      {GROUP_LABELS[group]}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {scenarios.map((scenario, index) => (
                        <button
                          key={scenario.id}
                          type="button"
                          onClick={() =>
                            onSelect({ kind: "bill", scenarioId: scenario.id })
                          }
                          style={staggerStyle(index)}
                          className="animate-rise-in min-h-11 overflow-hidden rounded-card border border-border-line bg-white text-left shadow-card transition-colors hover:border-pine-primary focus-visible:outline-2 focus-visible:outline-pine-primary"
                        >
                          <AppIcon
                            src={scenario.asset}
                            alt={`Demo preview: ${scenario.label}`}
                            width={320}
                            height={320}
                            className="aspect-square w-full object-cover"
                          />
                          <span className="block px-3 pb-3 pt-2.5">
                            <strong className="block text-body-sm font-bold text-pine">
                              {scenario.label}
                            </strong>
                            <span className="mt-0.5 block text-caption text-ink-secondary">
                              {scenario.description}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {DL_UPLOAD_SCENARIOS.map((scenario, index) => (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() =>
                    onSelect({ kind: "dl", scenarioId: scenario.id })
                  }
                  style={staggerStyle(index)}
                  className="animate-rise-in min-h-11 overflow-hidden rounded-card border border-border-line bg-white text-left shadow-card transition-colors hover:border-pine-primary focus-visible:outline-2 focus-visible:outline-pine-primary"
                >
                  <AppIcon
                    src={scenario.asset}
                    alt={`Demo preview: ${scenario.label}`}
                    width={320}
                    height={320}
                    className="aspect-square w-full object-cover"
                  />
                  <span className="block px-3 pb-3 pt-2.5">
                    <strong className="block text-body-sm font-bold text-pine">
                      {scenario.label}
                    </strong>
                    <span className="mt-0.5 block text-caption text-ink-secondary">
                      {scenario.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}

          <p className="mt-4 rounded-control bg-surface-tint px-3 py-2.5 text-caption text-ink-secondary">
            Demo only — no device file is selected or uploaded.
          </p>
        </div>
      </section>
    </div>
  );
}
