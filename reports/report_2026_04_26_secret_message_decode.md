# Change Report — Secret Message Decoder

**Date:** 2026-04-26  
**Type:** Script Execution (no files changed)

## Summary

Ran a user-provided Python script that:
1. Fetched a published Google Docs page via `requests`
2. Parsed an HTML table with `BeautifulSoup` extracting `(x, char, y)` coordinate data
3. Plotted the characters on a 2D grid to reveal ASCII block art

## Output

The decoded message is rendered as large block-letter ASCII art spelling **HCWIDBO**.

## Notes

- Initial run failed due to Windows `cp1252` encoding not supporting block characters (`█`, `░`).
- Fixed by re-running with `python -X utf8` flag to force UTF-8 output encoding.
