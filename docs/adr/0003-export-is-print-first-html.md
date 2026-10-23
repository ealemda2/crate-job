# The export is one HTML document, printed to PDF

The shipment summary is rendered as a self-contained HTML document (inline CSS and SVG, no network) with a print stylesheet. "Export PDF" opens it in the browser's print dialog; "Export HTML" downloads the same document. Readers receive it by email, where PDF survives every inbox and HTML attachments are often blocked, so PDF is the primary path. We chose the print dialog over a PDF library to avoid a heavy dependency and to guarantee the PDF and the HTML never drift apart. The cost: the planner clicks through the print dialog once.
