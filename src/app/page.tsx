"use client";

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

export default function Home() {
  const [data, setData] = useState<ThreatModel | null>(null);

  useEffect(() => {
    fetch("/Asset_Threat_Control.json")
      .then((res) => res.json())
      .then((json: ThreatModel) => setData(json));
  }, []);

  if (!data) return <p className="p-4">Loading threat model...</p>;

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold text-center">Threat Model Viewer</h1>
      {Object.entries(data.Assets).map(([layer, assets]) => (
        <section key={layer}>
          <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{layer}</h2>
          {Object.entries(assets).map(([asset, details]) => (
            <div key={asset} className="mb-6 p-4 border rounded-lg shadow bg-white">
              <h3 className="text-xl font-bold mb-3 text-blue-700">{asset}</h3>
              {details.Threats && details.Threats.length > 0 ? (
                <ul className="space-y-3">
                  {details.Threats.map((threat, idx) => (
                    <li key={idx} className="text-gray-600 rounded-md shadow-sm">
                      <p className="font-semibold text-lg">{threat.Name}</p>
                      {threat.Definition && (
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Definition:</strong> {threat.Definition}
                        </p>
                      )}
                      {Array.isArray(threat.Mitigation) ? (
                        <>
                        <p className="text-sm text-green-700 font-semibold">Mitigation:</p>
                          <ul className="list-disc ml-5 text-sm text-green-700">
                            {threat.Mitigation.map((m, i) => (
                              <li key={i}>{m}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p className="text-sm text-green-700">
                          <strong>Mitigation:</strong> {threat.Mitigation}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-gray-500">No threats listed.</p>
              )}
            </div>
          ))}
        </section>
      ))}
    </main>
  );
}