# Converts Markdown File to HTML page
Conversion using `marked` + `highlight.js`, with some customized stylesheets (see `public/css`) + html page design (under development).

## Demo

http://jasonyux.com/projects/

where all you have to do is to:
- prepare your notes in `.md` and put them in the `source` folder.
- run the `converter.js` program (see below)

## Usage
Basically it takes
- markdown folders/files under the `source` folder
- template html/css files under the `templates` folder

and generates 
- `html` files for posts (including css and etc) into the `<root>/pages` folder
- the homepage `index.html` into the `<root>` folder which contains links to the above files

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

## References
Style on project homepage:
- https://codepen.io/ErrolMascarenhas/pen/YzVxJRJ