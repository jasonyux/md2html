# Converts Markdown File to HTML page
Conversion using `marked` + `highlight.js`, with some customized stylesheets (see `public/css`) + html page design (under development).

## Usage
Basically it takes the markdown files under the `source` folder and generates `html` files (along with others) into the `<root>` folder.
```
node .\converter\converter.js <root>
```
where:
- `<root>` [optional] specifies the root directory for rendered output. This defaults to `/public/`. (For local test purposes, leave it to the default value.)
---
*For example*:
```bash
node .\converter\converter.js /projects/
```
which sets the root directory to `/projects/`
---