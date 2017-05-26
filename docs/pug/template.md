# Template

A template is a way to share frequently used html between all pages. This usually includes the header, head, and footer of the page. By default there is a main site template that includes the svg sprite generated by gulp-svg-sprite, a skip link for screen readers, and a block to inject content into. Templates will then be extended on the page level in order to include this pre-defined structure on each page.

**If you're looking to modify any blocks on your page, check out the extensive [blocks documentation](https://github.com/mimoduo/mimogear/tree/master/docs/pug/blocks.md)**