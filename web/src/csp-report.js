// SPDX-License-Identifier: Apache-2.0

document.addEventListener("securitypolicyviolation", (e) => {
  console.warn(
    `[CSP] Blocked ${e.violatedDirective}: ${e.blockedURI || "inline"}`,
    {
      directive: e.violatedDirective,
      blocked: e.blockedURI,
      source: e.sourceFile,
      line: e.lineNumber,
    },
  );
});
