# falling-leaves 0.1.0

Vendored browser ESM files from the pinned npm package `falling-leaves@0.1.0`.
Source: https://github.com/ernkerr/falling-leaves
MIT license is included in LICENSE. Source-map comments are removed; runtime
code is otherwise unchanged. The application imports these files directly,
so deploying the static site needs neither npm install nor a build step.

When upgrading, install an exact reviewed version, copy its vanilla ESM entry
and referenced chunks (not the React adapter), preserve the license, and update
package-lock.json and this version note together.
