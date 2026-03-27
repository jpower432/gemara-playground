// SPDX-License-Identifier: Apache-2.0

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"net/http"
	"sort"
	"time"

	"cuelang.org/go/cue"
	"cuelang.org/go/cue/ast"
	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/cue/format"
	"cuelang.org/go/cue/load"
	"cuelang.org/go/mod/modconfig"
	"golang.org/x/mod/semver"
)

var definitions = []string{
	"#ControlCatalog",
	"#ThreatCatalog",
	"#CapabilityCatalog",
	"#GuidanceCatalog",
	"#VectorCatalog",
	"#PrincipleCatalog",
	"#RiskCatalog",
	"#Policy",
	"#EvaluationLog",
	"#EnforcementLog",
	"#AuditLog",
	"#MappingDocument",
}

func main() {
	outDir := "web"
	if len(os.Args) > 1 {
		outDir = os.Args[1]
	}

	log.Println("Fetching Gemara versions from registry...")
	versions, err := fetchVersions()
	if err != nil {
		log.Fatalf("fetching versions: %v", err)
	}
	log.Printf("Found %d versions", len(versions))

	var exported []string
	for _, version := range versions {
		log.Printf("Processing %s...", version)
		count, err := exportVersion(outDir, version)
		if err != nil {
			log.Printf("WARNING: skipping %s: %v", version, err)
			continue
		}
		if count == 0 {
			log.Printf("WARNING: skipping %s: no definitions exported (incompatible module structure)", version)
			continue
		}
		log.Printf("  %s: %d definitions exported", version, count)
		exported = append(exported, version)
	}

	versionsPath := filepath.Join(outDir, "versions.json")
	versionsJSON, err := json.MarshalIndent(exported, "", "  ")
	if err != nil {
		log.Fatalf("marshaling versions: %v", err)
	}
	if err := os.WriteFile(versionsPath, append(versionsJSON, '\n'), 0o644); err != nil {
		log.Fatalf("writing versions.json: %v", err)
	}
	log.Printf("Wrote %s (%d of %d versions)", versionsPath, len(exported), len(versions))

	log.Println("Done.")
}

func exportVersion(outDir, version string) (int, error) {
	schemaDir := filepath.Join(outDir, "schemas", version)
	if err := os.MkdirAll(schemaDir, 0o755); err != nil {
		return 0, fmt.Errorf("creating schema dir: %w", err)
	}

	exported := 0
	for _, def := range definitions {
		src, err := exportDefinition(version, def)
		if err != nil {
			log.Printf("  WARNING: %s %s: %v", version, def, err)
			continue
		}

		name := strings.TrimPrefix(def, "#")
		outPath := filepath.Join(schemaDir, name+".cue")
		if err := os.WriteFile(outPath, src, 0o644); err != nil {
			return exported, fmt.Errorf("writing %s: %w", outPath, err)
		}
		exported++
	}

	if exported == 0 {
		os.Remove(schemaDir)
	}

	return exported, nil
}

func exportDefinition(version, definition string) ([]byte, error) {
	tmpDir, err := os.MkdirTemp("", "gemara-export-*")
	if err != nil {
		return nil, fmt.Errorf("creating temp dir: %w", err)
	}
	defer os.RemoveAll(tmpDir)

	majorVersion := extractMajorVersion(version)

	moduleCue := fmt.Sprintf(`module: "playground.local@v0"
language: version: "v0.16.0"
deps: "github.com/gemaraproj/gemara@%s": v: %q
`, majorVersion, version)

	if err := os.MkdirAll(filepath.Join(tmpDir, "cue.mod"), 0o755); err != nil {
		return nil, fmt.Errorf("creating cue.mod dir: %w", err)
	}
	if err := os.WriteFile(filepath.Join(tmpDir, "cue.mod", "module.cue"), []byte(moduleCue), 0o644); err != nil {
		return nil, fmt.Errorf("writing module.cue: %w", err)
	}

	schemaCue := fmt.Sprintf(`package playground

import gemara "github.com/gemaraproj/gemara@%s"

schema: gemara.%s
`, majorVersion, definition)

	if err := os.WriteFile(filepath.Join(tmpDir, "schema.cue"), []byte(schemaCue), 0o644); err != nil {
		return nil, fmt.Errorf("writing schema.cue: %w", err)
	}

	ctx := cuecontext.New()
	reg, err := modconfig.NewRegistry(nil)
	if err != nil {
		return nil, fmt.Errorf("creating registry client: %w", err)
	}

	insts := load.Instances([]string{"."}, &load.Config{
		Dir:      tmpDir,
		Registry: reg,
	})
	if len(insts) == 0 {
		return nil, fmt.Errorf("no instances loaded")
	}
	if insts[0].Err != nil {
		return nil, fmt.Errorf("loading instance: %w", insts[0].Err)
	}

	val := ctx.BuildInstance(insts[0])
	if err := val.Err(); err != nil {
		return nil, fmt.Errorf("building instance: %w", err)
	}

	schema := val.LookupPath(cue.ParsePath("schema"))
	if !schema.Exists() {
		return nil, fmt.Errorf("definition %s not found", definition)
	}

	node := schema.Syntax(
		cue.Optional(true),
		cue.Definitions(true),
		cue.Attributes(true),
		cue.InlineImports(true),
	)

	file, ok := node.(*ast.File)
	if !ok {
		src, err := format.Node(node)
		if err != nil {
			return nil, fmt.Errorf("formatting schema: %w", err)
		}
		return src, nil
	}

	pkg := &ast.Package{Name: ast.NewIdent("schema")}
	file.Decls = append([]ast.Decl{pkg}, file.Decls...)

	src, err := format.Node(file)
	if err != nil {
		return nil, fmt.Errorf("formatting schema: %w", err)
	}

	return src, nil
}

func extractMajorVersion(version string) string {
	if strings.HasPrefix(version, "v0.") {
		return "v0"
	}
	parts := strings.SplitN(version, ".", 2)
	if len(parts) > 0 {
		return parts[0]
	}
	return "v0"
}

const (
	registryURL = "https://registry.cue.works"
	module      = "github.com/gemaraproj/gemara"
)

type tagsResponse struct {
	Tags []string `json:"tags"`
}

func fetchVersions() ([]string, error) {
	url := fmt.Sprintf("%s/v2/%s/tags/list", registryURL, module)
	client := &http.Client{Timeout: 10 * time.Second}

	resp, err := client.Get(url)
	if err != nil {
		return nil, fmt.Errorf("fetching tags: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("registry returned HTTP %d", resp.StatusCode)
	}

	var tags tagsResponse
	if err := json.NewDecoder(resp.Body).Decode(&tags); err != nil {
		return nil, fmt.Errorf("decoding tags: %w", err)
	}

	versions := make([]string, 0, len(tags.Tags))
	for _, tag := range tags.Tags {
		v := strings.TrimSpace(tag)
		if v == "" || semver.Major(v) == "v0" {
			continue
		}
		versions = append(versions, v)
	}

	sort.Slice(versions, func(i, j int) bool {
		return semver.Compare(versions[i], versions[j]) > 0
	})

	return versions, nil
}
