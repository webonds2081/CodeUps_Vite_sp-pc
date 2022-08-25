import { defineConfig } from 'vite';
import { resolve } from 'path';
import viteImagemin from 'vite-plugin-imagemin'
import sassGlobImports from 'vite-plugin-sass-glob-import';
import handlebars from 'vite-plugin-handlebars';
import ejs from 'vite-plugin-ejs-engine';

// HTMLの複数出力を自動化する
//./src配下のファイル一式を取得
//const fs = require('fs');
import fs from 'fs';
const fileNameList = fs.readdirSync(resolve(__dirname, './src/'));

//htmlファイルのみ抽出
const htmlFileList = fileNameList.filter(file => /.html$/.test(file));

//build.rollupOptions.inputに渡すオブジェクトを生成
const inputFiles = {};
for (let i = 0; i < htmlFileList.length; i++) {
  const file = htmlFileList[i];
  inputFiles[file.slice(0,-5)] = resolve(__dirname, './src/' + file );
  /*
    この形を自動的に作る
    input:{
      index: resolve(__dirname, './src/index.html'),
      list: resolve(__dirname, './src/list.html')
    }
  */
}


//HTML上で出し分けたい各ページごとの情報
const pageData = {
  '/index.html': {
    isHome: true,
    title: 'Top Page',
    contextTtl: "Hello, ContextTtl",
    contextAry: {
      ary01 : "ary01-item",
      ary02 : "ary02-item",
      ary03 : "ary03-item",
    },
    momoclo : [
      {firstname : "Kanako", lastname : "Momota"},
      {firstname : "Ayaka", lastname : "Sasaki"},
      {firstname : "Shiori", lastname : "Tamai"},
      {firstname : "Momoka", lastname : "Ariyasu"},
      {firstname : "Reni", lastname : "Takagi"},
      ],
    color : {
      "Kanako" : "red",
      "Ayaka" : "pink",
      "Shiori" : "yellow",
      "Momoka" : "green",
      "Reni" : "purple",
    },
  },
  '/hoge.html': {
    isHome: false,
    title: 'Hoge Page',
  },
};

export default defineConfig({
  server: {
    port: 3200, // 任意のポート番号を書く
  },
  base: './', //相対パスでビルドする
  root: './src', //開発ディレクトリ設定
  build: {
    outDir: '../dist', //出力場所の指定
    rollupOptions: { //ファイル出力設定        
      output: {
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.')[1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'images';
          }
	        //ビルド時のCSS名を明記してコントロールする
          if(extType === 'css') {
            return `assets/css/style.css`;
          }
          return `assets/${extType}/[name][extname]`;
        },
        chunkFileNames: 'assets/js/[name].js',
        entryFileNames: 'assets/js/[name].js',
      },
      //生成オブジェクトを渡す
      input: inputFiles,

    },
  },
  plugins: [
    sassGlobImports(),
    ejs(),
    handlebars({
      //コンポーネントの格納ディレクトリを指定
      partialDirectory: resolve(__dirname, './src/components'),

      //各ページ情報の読み込み
      context(pagePath) {
        return pageData[pagePath];
      },
    }),

    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 20,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ],
});



