# Navigation

Each Sass navigation partial should refer to its respective pug partial. This makes navigation changes easier down the road.

**Wondering where the nav links are coming from? They are populated using data from configuration.json.**

## Template

In practice, each nav can be fairly unique. For that reason, a template navigation partial was created in order to have a go-to partial to copy into another unique partial for your new nav.

## Main

The main nav usually includes some more complicated styles compared to other navs. Because of this, direct child selectors were used in order to selectively style root links versus child links.
