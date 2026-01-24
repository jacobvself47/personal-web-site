"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Threat = {
  Name: string;
  Definition?: string;
  Mitigation: string | string[];
};

type AssetThreats = {
  [assetName: string]: {
    Threats?: Threat[];
  };
};

type AssetLayer = {
  [layerName: string]: AssetThreats;
};

type ThreatModel = {
  Assets: AssetLayer;
};

function ThreatCard({ threat }: { threat: Threat }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <span className="text-orange-500 dark:text-orange-400">⚠</span>
        <span className="flex-1 font-medium text-neutral-900 dark:text-neutral-100">
          {threat.Name}
        </span>
        <span
          className={`text-neutral-400 text-sm transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-neutral-200 dark:border-neutral-700 pt-3">
          {threat.Definition && (
            <div>
              <h5 className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
                Definition
              </h5>
              <p className="text-sm text-neutral-700 dark:text-neutral-300">
                {threat.Definition}
              </p>
            </div>
          )}

          <div>
            <h5 className="text-xs uppercase tracking-wide text-neutral-500 dark:text-neutral-400 mb-1">
              Mitigation
            </h5>
            {Array.isArray(threat.Mitigation) ? (
              <ul className="space-y-1">
                {threat.Mitigation.map((m, i) => (
                  <li
                    key={i}
                    className="text-sm text-green-700 dark:text-green-400 flex gap-2"
                  >
                    <span>→</span>
                    {m}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-700 dark:text-green-400">
                {threat.Mitigation}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AssetCard({
  asset,
  details,
}: {
  asset: string;
  details: { Threats?: Threat[] };
}) {
  const [expanded, setExpanded] = useState(false);
  const threatCount = details.Threats?.length || 0;

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden bg-neutral-50 dark:bg-neutral-900/50">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800/30 transition-colors"
      >
        <span className="text-2xl">🖥️</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-600 dark:text-blue-400">
            {asset}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {threatCount} threat{threatCount !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`text-neutral-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-2 border-t border-neutral-200 dark:border-neutral-800 pt-4">
          {details.Threats && details.Threats.length > 0 ? (
            details.Threats.map((threat, idx) => (
              <ThreatCard key={idx} threat={threat} />
            ))
          ) : (
            <p className="text-sm italic text-neutral-500 dark:text-neutral-500">
              No threats listed.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function LayerSection({
  layer,
  assets,
}: {
  layer: string;
  assets: AssetThreats;
}) {
  const [expanded, setExpanded] = useState(true);
  const assetCount = Object.keys(assets).length;
  const totalThreats = Object.values(assets).reduce(
    (sum, a) => sum + (a.Threats?.length || 0),
    0
  );

  return (
    <section className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-5 text-left bg-neutral-100 dark:bg-neutral-800/50 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
      >
        <span className="text-3xl">📁</span>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {layer}
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {assetCount} asset{assetCount !== 1 ? "s" : ""} • {totalThreats}{" "}
            threat{totalThreats !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className={`text-neutral-400 text-lg transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {Object.entries(assets).map(([asset, details]) => (
            <AssetCard key={asset} asset={asset} details={details} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function ThreatModelViewer() {
  const [data, setData] = useState<ThreatModel | null>(null);

  useEffect(() => {
    fetch("/Asset_Threat_Control.json")
      .then((res) => res.json())
      .then((json: ThreatModel) => setData(json));
  }, []);

  // Calculate summary stats
  const summary = data
    ? {
        layers: Object.keys(data.Assets).length,
        assets: Object.values(data.Assets).reduce(
          (sum, layer) => sum + Object.keys(layer).length,
          0
        ),
        threats: Object.values(data.Assets).reduce(
          (sum, layer) =>
            sum +
            Object.values(layer).reduce(
              (s, a) => s + (a.Threats?.length || 0),
              0
            ),
          0
        ),
      }
    : null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
          <li>
            <Link
              href="/projects"
              className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Projects
            </Link>
          </li>
          <li>/</li>
          <li className="text-neutral-900 dark:text-neutral-100">
            Threat Model Viewer
          </li>
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
          Threat Model Viewer
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400">
          Interactive visualization tool for exploring threat models with
          assets, threats, and mitigations organized by layer. Click on items to
          expand.
        </p>
      </header>

      {!data ? (
        <p className="text-neutral-500 dark:text-neutral-400">
          Loading threat model...
        </p>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 text-center bg-blue-500/10 border border-blue-500/30 rounded-xl">
              <div className="text-3xl font-bold text-blue-500 dark:text-blue-400">
                {summary?.layers}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Layers
              </div>
            </div>
            <div className="p-4 text-center bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="text-3xl font-bold text-purple-500 dark:text-purple-400">
                {summary?.assets}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Assets
              </div>
            </div>
            <div className="p-4 text-center bg-orange-500/10 border border-orange-500/30 rounded-xl">
              <div className="text-3xl font-bold text-orange-500 dark:text-orange-400">
                {summary?.threats}
              </div>
              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                Threats
              </div>
            </div>
          </div>

          {/* Layers */}
          <div className="space-y-4">
            {Object.entries(data.Assets).map(([layer, assets]) => (
              <LayerSection key={layer} layer={layer} assets={assets} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
