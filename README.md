# unit-builder

## Project setup
```
npm install
```

### Generate database, meta, images and optimization

```
npm run generate
```

WARNING: some game files are not served by the celeste API. For legal reasons, they cannot be included in the repository. You will have to find these files in your game directory and put them in the `db` folder:
- `techtreex.xml`
- the whole `tactics` folder, containing `.tactics` files

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for pre-production

(Robots.txt denies everything)

```
npm run build
```

### Compiles and minifies for production

(Robots.txt allows everything)

```
npm run build-prod
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## License

Age of Empires Online © Microsoft Corporation. This unit builder application was created under Microsoft's [Game Content Usage Rules](https://www.xbox.com/en-us/developers/rules) using assets from Age of Empires Online, and it is not endorsed by or affiliated with Microsoft.

This application is MIT Licensed. Copyright © 2020 Jérémy LAMBERT (SystemGlitch)
