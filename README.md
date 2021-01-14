# go-cron-ui

## 【推荐】和go-cron-server结合使用，

[go-cron-server](https://github.com/lizongying/go-cron-server)

### build

```
npm run build:prod

```

## 如单独部署

* 修改.env.production

```
VUE_APP_BASE_API = '<host>'
```

* 修改vue.config.js

```
outputDir: 'dist',
```

