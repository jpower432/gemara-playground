// SPDX-License-Identifier: Apache-2.0

//go:build js && wasm

package main

import (
	"strings"
	"syscall/js"

	"cuelang.org/go/cue/cuecontext"
	"cuelang.org/go/cue/errors"
	cueyaml "cuelang.org/go/encoding/yaml"
)

func main() {
	api := js.Global().Get("Object").New()
	api.Set("validateYAML", js.FuncOf(validateYAML))

	js.Global().Set("GemaraPlayground", api)

	select {}
}

func validateYAML(_ js.Value, args []js.Value) interface{} {
	if len(args) < 2 {
		return errorResult("validateYAML requires 2 arguments: yamlContent, schemaSource")
	}

	yamlContent := args[0].String()
	schemaSource := args[1].String()

	ctx := cuecontext.New()
	val := ctx.CompileString(schemaSource)
	if err := val.Err(); err != nil {
		return errorResult("loading schema: " + err.Error())
	}

	if err := cueyaml.Validate([]byte(yamlContent), val); err != nil {
		return validationResult(false, extractErrors(err))
	}

	return validationResult(true, nil)
}

type fieldError struct {
	Path    string
	Message string
}

func extractErrors(err error) []fieldError {
	var result []fieldError
	for _, e := range errors.Errors(err) {
		var pathParts []string
		for _, p := range e.Path() {
			pathParts = append(pathParts, p)
		}
		result = append(result, fieldError{
			Path:    strings.Join(pathParts, "."),
			Message: e.Error(),
		})
	}
	if len(result) == 0 {
		result = append(result, fieldError{Message: err.Error()})
	}
	return result
}

func validationResult(valid bool, errs []fieldError) interface{} {
	obj := js.Global().Get("Object").New()
	obj.Set("valid", valid)

	if len(errs) > 0 {
		jsErrs := js.Global().Get("Array").New(len(errs))
		for i, e := range errs {
			jsErr := js.Global().Get("Object").New()
			jsErr.Set("path", e.Path)
			jsErr.Set("message", e.Message)
			jsErrs.SetIndex(i, jsErr)
		}
		obj.Set("errors", jsErrs)
	} else {
		obj.Set("errors", js.Global().Get("Array").New(0))
	}

	return obj
}

func errorResult(msg string) interface{} {
	return validationResult(false, []fieldError{{Message: msg}})
}
