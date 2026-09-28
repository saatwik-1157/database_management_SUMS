# docs

| File                           | What it is                                            |
| ------------------------------ | ----------------------------------------------------- |
| `SUMS_Full_Project_Report.pdf` | Full project report                                   |
| `SUMS_Final_Report.md`         | Final report in Markdown                              |
| `Project_Report.html`          | Plain-language project report                         |
| `Presentation.html`            | Reveal.js slide deck; its demo button opens `../apps/web/index.html` |
| `slides_style.css`             | Slide stylesheet; nothing in the repository links to it at present |

The reports were written before the repository was reorganised and refer to
files by their old root-level names:

| Named in the reports | Now at                        |
| -------------------- | ----------------------------- |
| `server.py`          | `apps/api/python/server.py`   |
| `node_server.js`     | `apps/api/node/server.js`     |
| `JdbcServer.java`    | `apps/api/java/JdbcServer.java` |
| `php_server.php`     | `apps/api/php/server.php`     |
| `app.js`             | `apps/web/app.js`             |

`scripts/generate_ai_ppt.py` is not part of SUMS: it builds a general
"Current State of AI" deck with python-pptx and saves
`AI_Impact_Presentation.pptx` in the current directory.
