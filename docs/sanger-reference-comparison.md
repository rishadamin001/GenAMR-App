# Sanger database comparison

[Project overview](../README.md) · [Documentation index](README.md)

Open **Sanger** to find the comparison panel to the right of the trace (below it on narrow screens). It compares the current synthetic sample with a species-matched, bundled PointFinder reference and updates when mutations or the target locus change.

## Review a result

- Read the reference accession, species, locus and snapshot revision.
- Compare Ref and Sample rows. Changed bases have amber highlighting and an underline.
- Use **Show differences only**, expand a codon, and select **Locate codon in trace**. The trace pans to the selected codon and highlights it in teal.
- Read the database annotation and its caveats. The source links open the exact pinned upstream files.
- Export comparison JSON for the sequence, reference, revision, coding coordinates, counts and annotations.

## What is compared

Four 33-base windows are bundled: gyrA codons 80–90 and parC codons 76–86 for Escherichia coli and Klebsiella pneumoniae. Positions are 1-based coding-sequence coordinates, on the forward coding strand. The accession comes from the upstream FASTA header. Exact species matching permits a trailing strain label, but never silently applies a different species' reference. Unsupported species receive no score.

For these species, simulated traces now use the sourced window as their template instead of invented flanking sequence. Mutations remain simulated; this is not patient sequencing. The comparison performs an ungapped coordinate comparison of the window, not a sequence search, real read alignment, allele identification, or whole-gene coverage calculation. It does not ingest .ab1 files. It does not make external network calls or require Supabase.

Identity is matching unambiguous bases / compared unambiguous bases. N is unresolved and excluded; an entirely unresolved window has no identity score. Length mismatches and unsupported characters are rejected. Amino-acid translation separates synonymous, catalogued and uncatalogued substitutions. The underlying function compares bases, not the list of mutation-toggle labels.

PointFinder annotation matches use position, reference amino acid and alternate amino acid. The Klebsiella reference FASTA and some annotation rows use different synonymous codons (gyrA 83 and parC 80); the UI explicitly discloses this. Source notes and additional-mutation requirements remain visible. A catalogue match is not a resistance determination. Uncatalogued substitutions are not classified as benign; unchanged windows are not classified as susceptible. This panel does not overwrite the existing illustrative report rules.

## Source and attribution

Snapshot retrieved **2026-11-10**, PointFinder revision **44ce624a806c6d2b70f7e39841a5f9cb4d9010aa**.

| Species | Locus | FASTA accession | Source |
| --- | --- | --- | --- |
| E. coli | gyrA | CP073768.1 | [FASTA](https://bitbucket.org/genomicepidemiology/pointfinder_db/src/44ce624a806c6d2b70f7e39841a5f9cb4d9010aa/escherichia_coli/gyrA.fsa) |
| E. coli | parC | CP084529.1 | [FASTA](https://bitbucket.org/genomicepidemiology/pointfinder_db/src/44ce624a806c6d2b70f7e39841a5f9cb4d9010aa/escherichia_coli/parC.fsa) |
| K. pneumoniae | gyrA | AF052258.1 | [FASTA](https://bitbucket.org/genomicepidemiology/pointfinder_db/src/44ce624a806c6d2b70f7e39841a5f9cb4d9010aa/klebsiella/gyrA.fsa) |
| K. pneumoniae | parC | AF303641.1 | [FASTA](https://bitbucket.org/genomicepidemiology/pointfinder_db/src/44ce624a806c6d2b70f7e39841a5f9cb4d9010aa/klebsiella/parC.fsa) |

Annotations are the rows within these windows from each species' `resistens-overview.txt`. The derived subset is stored in `src/lib/data/references/pointfinder-qrdr.json`; the upstream repository is maintained by the Center for Genomic Epidemiology. Changes here: truncated reference sequences to the listed windows, selected annotation rows, converted to JSON and added provenance metadata. The upstream README declares Apache-2.0; the [license text](licenses/Apache-2.0.txt) is included. No endorsement or complete PointFinder implementation is claimed.

Updates are deliberately reviewed and pinned, not silently downloaded in the browser. To refresh, retrieve the four FASTA files and two annotation files at a reviewed revision, extract the same coding windows, preserve source fields, inspect synonymous-codon discrepancies, update provenance and rerun tests. No live database freshness claim is made.

## Similar applications studied

- [SnapGene: Align Sanger Reads to a Reference](https://support.snapgene.com/hc/en-us/articles/10384298841364-Align-Sanger-Reads-to-a-Reference-Sequence): reference/read display, discrepancy navigation and trace inspection informed the layout.
- [Geneious: Assembling Chromatograms](https://www.geneious.com/tutorials/assembling-chromatograms): quality review and explicit reference comparisons informed the distinction between sequence differences and reliable calls.
- [CGE ResFinder documentation](https://github.com/genomicepidemiology/resfinder): separate reference sequences, sample sequences and species-specific PointFinder annotations informed the data model.

No proprietary code, assets or algorithms from these applications are included. This feature does not replicate their full alignment, trimming or variant-calling capabilities.
