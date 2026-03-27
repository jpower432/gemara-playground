// SPDX-License-Identifier: Apache-2.0

import jsyaml from "js-yaml";

const LAYER_MAP = {
  GuidanceCatalog: 1,
  PrincipleCatalog: 1,
  ThreatCatalog: 2,
  ControlCatalog: 2,
  CapabilityCatalog: 2,
  VectorCatalog: 2,
  Policy: 3,
  RiskCatalog: 3,
  EvaluationLog: 3,
  EnforcementLog: 3,
  AuditLog: 3,
  MappingDocument: 3,
};

export function layerForType(docType) {
  return LAYER_MAP[docType] ?? null;
}

export function extractIdentity(doc) {
  const identity = { id: "", type: "", title: "" };

  if (typeof doc.title === "string") {
    identity.title = doc.title;
  }

  const meta = doc.metadata;
  if (meta && typeof meta === "object") {
    if (typeof meta.id === "string") identity.id = meta.id;
    if (typeof meta.type === "string") identity.type = meta.type;
  }

  if (!identity.type) {
    identity.type = inferDocType(doc);
  }

  return identity;
}

export function inferDocType(doc) {
  if (doc.controls) return "ControlCatalog";
  if (doc.threats) return "ThreatCatalog";
  if (doc.capabilities) {
    return doc.threats ? "ThreatCatalog" : "CapabilityCatalog";
  }
  if (doc.guidelines) return "GuidanceCatalog";
  if (doc.risks) return "RiskCatalog";
  if (doc.scope || doc.adherence) return "Policy";
  if (doc.principles) return "PrincipleCatalog";
  if (doc.vectors) return "VectorCatalog";
  return "";
}

export function extractMappingRefs(doc) {
  const refs = doc.metadata?.["mapping-references"];
  if (!Array.isArray(refs)) return [];

  return refs
    .filter((r) => r && typeof r === "object" && typeof r.id === "string")
    .map((r) => ({
      id: r.id,
      title: r.title || "",
      version: r.version || "",
      url: r.url || "",
    }));
}

function extractEntryIDs(group) {
  if (!Array.isArray(group.entries)) return [];
  return group.entries
    .filter((e) => e && typeof e === "object" && typeof e["reference-id"] === "string")
    .map((e) => e["reference-id"]);
}

function appendUnique(arr, items) {
  const seen = new Set(arr);
  for (const item of items) {
    if (!seen.has(item)) {
      arr.push(item);
      seen.add(item);
    }
  }
  return arr;
}

function extractRefEntryGroups(doc, field, refType) {
  const items = doc[field];
  if (!Array.isArray(items)) return [];

  const refs = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const refID = item["reference-id"];
    if (typeof refID !== "string") continue;

    refs.push({
      targetID: refID,
      refType,
      entryIDs: extractEntryIDs(item),
      fieldPath: field,
    });
  }
  return refs;
}

function extractNestedRefGroups(doc, listField, nestedField, refType) {
  const items = doc[listField];
  if (!Array.isArray(items)) return [];

  const refMap = new Map();
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const groups = item[nestedField];
    if (!Array.isArray(groups)) continue;

    for (const group of groups) {
      if (!group || typeof group !== "object") continue;
      const refID = group["reference-id"];
      if (typeof refID !== "string") continue;

      if (!refMap.has(refID)) refMap.set(refID, []);
      appendUnique(refMap.get(refID), extractEntryIDs(group));
    }
  }

  return Array.from(refMap, ([refID, entryIDs]) => ({
    targetID: refID,
    refType,
    entryIDs,
    fieldPath: `${listField}[].${nestedField}`,
  }));
}

function extractImportControls(doc) {
  const controls = doc.imports?.controls;
  if (!Array.isArray(controls)) return [];

  return controls
    .filter((c) => c && typeof c === "object" && typeof c["reference-id"] === "string")
    .map((c) => ({
      targetID: c["reference-id"],
      refType: "import-controls",
      entryIDs: extractEntryIDs(c),
      fieldPath: "imports.controls",
    }));
}

function extractImportCatalogs(doc) {
  const catalogs = doc.imports?.catalogs;
  if (!Array.isArray(catalogs)) return [];

  return catalogs
    .filter((c) => c && typeof c === "object" && typeof c["reference-id"] === "string")
    .map((c) => ({
      targetID: c["reference-id"],
      refType: "import-catalogs",
      entryIDs: [],
      fieldPath: "imports.catalogs",
    }));
}

function extractSeeAlso(doc) {
  if (!Array.isArray(doc.guidelines)) return [];

  const ids = [];
  for (const g of doc.guidelines) {
    if (!g || typeof g !== "object" || !Array.isArray(g["see-also"])) continue;
    for (const s of g["see-also"]) {
      if (typeof s === "string") appendUnique(ids, [s]);
    }
  }

  if (ids.length === 0) return [];
  return [{ targetID: "self", refType: "see-also", entryIDs: ids, fieldPath: "guidelines[].see-also" }];
}

export function extractAllReferences(doc) {
  return [
    ...extractRefEntryGroups(doc, "imported-capabilities", "imported-capabilities"),
    ...extractRefEntryGroups(doc, "imported-threats", "imported-threats"),
    ...extractNestedRefGroups(doc, "threats", "capabilities", "threat-capabilities"),
    ...extractNestedRefGroups(doc, "controls", "threats", "control-threats"),
    ...extractNestedRefGroups(doc, "controls", "threat-mappings", "threat-mappings"),
    ...extractNestedRefGroups(doc, "risks", "threats", "risk-threats"),
    ...extractImportControls(doc),
    ...extractImportCatalogs(doc),
    ...extractSeeAlso(doc),
  ];
}

export function parseDocument(yamlContent) {
  const doc = jsyaml.load(yamlContent);
  if (!doc || typeof doc !== "object") {
    throw new Error("YAML did not parse to an object");
  }

  const identity = extractIdentity(doc);
  const mappingRefs = extractMappingRefs(doc);
  const references = extractAllReferences(doc);
  return { identity, mappingRefs, references };
}

function disambiguate(candidates, refType) {
  const preferred = {
    "control-threats": "ThreatCatalog",
    "threat-mappings": "ThreatCatalog",
    "risk-threats": "ThreatCatalog",
    "imported-threats": "ThreatCatalog",
    "imported-capabilities": "CapabilityCatalog",
    "threat-capabilities": "CapabilityCatalog",
    "import-controls": "ControlCatalog",
    "import-catalogs": "ControlCatalog",
  }[refType];

  if (!preferred) return null;
  return candidates.find((c) => c.type === preferred) ?? null;
}

export function indexWorkspace(tutorialDocs) {
  const docs = [];

  for (const { filename, content } of tutorialDocs) {
    try {
      const doc = jsyaml.load(content);
      if (!doc || typeof doc !== "object") continue;

      const identity = extractIdentity(doc);
      if (!identity.id) continue;

      docs.push({
        id: identity.id,
        type: identity.type,
        title: identity.title,
        filename,
      });
    } catch {
      continue;
    }
  }

  return {
    docs,
    findByID(id) {
      return this.docs.filter((d) => d.id === id);
    },
  };
}

export function resolveDocument(yamlContent, workspace) {
  const { identity, mappingRefs, references } = parseDocument(yamlContent);

  const graph = {
    center: {
      id: identity.id,
      title: identity.title,
      type: identity.type,
      layer: layerForType(identity.type),
      resolved: true,
    },
    nodes: [],
    edges: [],
  };

  const mappingIndex = new Map(mappingRefs.map((mr) => [mr.id, mr]));
  const seen = new Set();

  for (const ref of references) {
    if (ref.targetID === "self") {
      graph.edges.push({
        source: identity.id,
        target: identity.id,
        type: ref.refType,
        details: ref.entryIDs,
      });
      continue;
    }

    if (!seen.has(ref.targetID)) {
      const node = resolveNode(ref.targetID, ref.refType, identity, workspace, mappingIndex);

      if (node.id === identity.id && node.type === identity.type) {
        graph.edges.push({
          source: identity.id,
          target: identity.id,
          type: ref.refType,
          details: ref.entryIDs,
        });
        continue;
      }

      graph.nodes.push(node);
      seen.add(ref.targetID);
    }

    graph.edges.push({
      source: identity.id,
      target: ref.targetID,
      type: ref.refType,
      details: ref.entryIDs,
    });
  }

  return graph;
}

function resolveNode(refID, refType, selfIdentity, workspace, mappingIndex) {
  let candidates = workspace.findByID(refID);

  if (candidates.length > 1) {
    const preferred = disambiguate(candidates, refType);
    if (preferred) candidates = [preferred];
  }

  const filtered = candidates.filter(
    (c) => !(c.id === selfIdentity.id && c.type === selfIdentity.type),
  );
  if (filtered.length > 0) candidates = filtered;

  if (candidates.length > 0) {
    const doc = candidates[0];
    return {
      id: refID,
      title: doc.title,
      type: doc.type,
      layer: layerForType(doc.type),
      resolved: true,
      filename: doc.filename,
    };
  }

  const mr = mappingIndex.get(refID);
  if (mr) {
    return {
      id: refID,
      title: mr.title,
      resolved: false,
      url: mr.url,
      version: mr.version,
    };
  }

  return { id: refID, title: refID, resolved: false };
}
