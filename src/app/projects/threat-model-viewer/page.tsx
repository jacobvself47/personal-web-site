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

export default function ThreatModelViewer() {
  const [data, setData] = useState<ThreatModel | null>(null);

  useEffect(() => {
    fetch("/Asset_Threat_Control.json")
      .then((res) => res.json())
      .then((json: ThreatModel) => setData(json));
  }, []);

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
          assets, threats, and mitigations organized by layer.
        </p>
      </header>

      {!data ? (
        <p className="text-neutral-500 dark:text-neutral-400">
          Loading threat model...
        </p>
      ) : (
        <div className="space-y-8">
          {Object.entries(data.Assets).map(([layer, assets]) => (
            <section key={layer}>
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4 border-b border-neutral-200 dark:border-neutral-800 pb-2">
                {layer}
              </h2>
              {Object.entries(assets).map(([asset, details]) => (
                <div
                  key={asset}
                  className="mb-6 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-900"
                >
                  <h3 className="text-xl font-bold mb-3 text-blue-600 dark:text-blue-400">
                    {asset}
                  </h3>
                  {details.Threats && details.Threats.length > 0 ? (
                    <ul className="space-y-3">
                      {details.Threats.map((threat, idx) => (
                        <li
                          key={idx}
                          className="text-neutral-700 dark:text-neutral-300 rounded-md"
                        >
                          <p className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
                            {threat.Name}
                          </p>
                          {threat.Definition && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                              <strong>Definition:</strong> {threat.Definition}
                            </p>
                          )}
                          {Array.isArray(threat.Mitigation) ? (
                            <>
                              <p className="text-sm text-green-700 dark:text-green-400 font-semibold">
                                Mitigation:
                              </p>
                              <ul className="list-disc ml-5 text-sm text-green-700 dark:text-green-400">
                                {threat.Mitigation.map((m, i) => (
                                  <li key={i}>{m}</li>
                                ))}
                              </ul>
                            </>
                          ) : (
                            <p className="text-sm text-green-700 dark:text-green-400">
                              <strong>Mitigation:</strong> {threat.Mitigation}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-neutral-500 dark:text-neutral-500">
                      No threats listed.
                    </p>
                  )}
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
