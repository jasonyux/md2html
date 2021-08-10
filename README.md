# Converts Markdown File to HTML page
Conversion using `marked` + `highlight.js`, with some customized stylesheets + html page design (under development).

## Usage
Basically it takes the markdown files under the `source` folder and generates `html` files (along with others) into the `<root>` folder.
```
node .\converter\converter.js <root>
```
where:
- `<root>` [optional] specifies the root directory for rendered output. This defaults to `/public/`.
---
*For example*:
```bash
node .\converter\converter.js /projects/
```
---