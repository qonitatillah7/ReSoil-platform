# GeneLab — Dari DNA ke Protein

An Indonesian SMA learning laboratory with four controllable 3D stages: DNA structure, transcription, RNA processing and translation. A bright interface includes linked sequences, a complete standard codon table, three single-base substitution examples, and short practice inputs.

`dist/` is the complete dependency-free static site. `biology.js` owns sequence derivation, the genetic code, translation steps and teaching explanations. `scene.js` creates independently moving molecular objects. `renderer.js` uses WebGL with a software 3D fallback and a projected text layer. `app.js` binds the controls to one state model.

The main DNA is an 18-base CDS fragment. The splicing view is explicitly labeled as a separate illustrative intron example; UTRs, promoter and transcript termini are schematic. Stop codons are handled by release factors, never represented as amino acids or stop tRNAs.

Run `node --test tests/*.test.js`. Tests cover biology, all variants, stages and scenes, projection, controls, animation, reset, keyboard, gestures, table, exercises, and local assets. DOM tests use a small fixture; they do not replace browser/WebGL QA. Browser QA was unavailable in the creation environment.

Site access must remain owner-private unless the user expressly authorizes a change.
